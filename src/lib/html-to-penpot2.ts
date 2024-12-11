/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
type TYPE = "SVG" | "RECTANGLE" | "TEXT" | "FRAME";
type STROKE_TYPE = "SOLID";
type SHADOW_EFFECT_TYPE = "DROP_SHADOW";
type BLEND_MODE = "NORMAL";
export type StrokeWeight = number;
export type Effect = WithRef<ShadowEffect>;
export type Stroke = {
  type: STROKE_TYPE;
  color: Color;
  opacity: number;
};
export type Constraints = {
  horizontal: "center" | "right" | "left" | "center" | "scale";
  vertical: "center" | "bottom" | "top" | "scale";
};

interface ParsedBoxShadow {
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius: number;
  color: string;
}

export type ShadowEffect = {
  color: Color;
  type: SHADOW_EFFECT_TYPE;
  blur_radius: number;
  spread_radius: number;
  blendMode: BLEND_MODE;
  visible: boolean;
  offset: {
    x: number;
    y: number;
  };
};

type RectangleNode = {
  type: TYPE;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills: Paint[];
  strokes: Stroke[];
  strokeWeight: StrokeWeight;
  effects: Effect[];
  topLeftRadius: number | undefined;
  topRightRadius: number | undefined;
  bottomLeftRadius: number | undefined;
  bottomRightRadius: number | undefined;
  constraints: Constraints;
};

type FrameNode = {
  type: TYPE;
  x: number;
  y: number;
  width: number;
  height: number;
  clipsContent: boolean;
  backgrounds: any[];
  children: any[];
  constraints: Constraints;
};

type TextNode = {
  type: TYPE;
  x: number;
  y: number;
  width: number;
  height: number;
  characters: string;
  fills: Paint[];
  letterSpacing: Unit;
  lineHeight: Unit;
  textCase: "UPPER" | "LOWER" | "TITLE";
  fontSize: number;
  textDecoration: any;
  textAlignHorizontal: any;
  constraints: Constraints;
};

export type Color = {
  r: number;
  g: number;
  b: number;
};

export type WithRef<T> = Partial<T> & { ref?: Element | Node };
export type LayerNode = WithRef<RectangleNode | TextNode | FrameNode | SvgNode>;
export type Paint = WithRef<SolidPaint | ImagePaint>;
export type SolidPaint = {
  type: "SOLID";
  color: Color;
  opacity: number;
};

export interface SvgNode {
  type: "SVG";
  svg: string;
  x: number;
  y: number;
  width: number;
  height: number;
  constraints: Constraints;
}

export function htmlToPenpot(selector: HTMLElement, time = true) {
  if (time) {
    console.time("Parse dom");
  }
  const layers: LayerNode[] = [];
  const el = selector;

  if (el) {
    processSvgUseElements(el);

    const els = generateElements(el);

    els.forEach((el) => {
      const elLayers = getLayersForElement(el);
      layers.push(...elLayers);
    });

    const textNodes = textNodesUnder(el);

    for (const node of textNodes) {
      const textNode = buildTextNode({ node });
      if (textNode) {
        layers.push(textNode);
      }
    }
  }

  const root: WithRef<FrameNode> = {
    type: "FRAME",
    width: Math.round(window.innerWidth),
    height: Math.round(document.documentElement.scrollHeight),
    x: 0,
    y: 0,
    ref: document.body,
    // Building relative to the body of the document
  };

  layers.unshift(root);

  const framesLayers = getLayersForFrames({ layers, root });

  removeRefs({ layers: framesLayers, root });

  if (time) {
    console.info("\n");
    console.timeEnd("Parse dom");
  }

  return framesLayers;
}

export const processSvgUseElements = (el: Element) => {
  // Process SVG <use> elements
  for (const use of Array.from(el.querySelectorAll("use"))) {
    try {
      const symbolSelector = use.href.baseVal;
      const symbol: SVGSymbolElement | null =
        document.querySelector(symbolSelector);
      if (symbol) {
        use.outerHTML = symbol.innerHTML;
      }
    } catch (err) {
      console.warn("Error querying <use> tag href", err);
    }
  }
};

const generateElements = (el: Element) => {
  const getShadowEls = (el: Element): Element[] =>
    Array.from(el.shadowRoot?.querySelectorAll("*") || []).reduce(
      (memo, el) => [...memo, el, ...getShadowEls(el)],
      [] as Element[],
    );

  const els = Array.from(el.querySelectorAll("*")).reduce(
    (memo, el) => [...memo, el, ...getShadowEls(el)],
    [] as Element[],
  );

  return els;
};

const getLayersForElement = (el: Element) => {
  const elementLayers: LayerNode[] = [];
  if (isHidden(el)) {
    return [];
  }
  if (el instanceof SVGSVGElement) {
    elementLayers.push(createSvgLayer(el));
    return elementLayers;
  } else if (el instanceof SVGElement) {
    return [];
  }

  if (
    (el.parentElement instanceof HTMLPictureElement &&
      el instanceof HTMLSourceElement) ||
    el instanceof HTMLPictureElement
  ) {
    return [];
  }

  const appliedStyles = getAppliedComputedStyles(el);
  const computedStyle = getComputedStyle(el);

  if (
    (size(appliedStyles) ||
      el instanceof HTMLImageElement ||
      el instanceof HTMLVideoElement) &&
    computedStyle.display !== "none"
  ) {
    const rect = getBoundingClientRect(el);

    if (rect.width >= 1 && rect.height >= 1) {
      const fills: Paint[] = [];

      const color = getRgb(computedStyle.backgroundColor);

      if (color) {
        const solidPaint: SolidPaint = {
          type: "SOLID",
          color: {
            r: color.r,
            g: color.g,
            b: color.b,
          },
          opacity: color.a || 1,
        };
        fills.push(solidPaint);
      }

      const rectNode: WithRef<RectangleNode> = {
        type: "RECTANGLE",
        ref: el,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        fills,
      };

      const strokes = addStrokesFromBorder({ computedStyle });

      if (strokes) {
        Object.assign(rectNode, strokes);
      }

      if (!rectNode.strokes) {
        for (const dir of ["top", "left", "right", "bottom"] as const) {
          const strokesLayer = getStrokesRectangle({
            dir,
            rect,
            computedStyle,
            el,
          });

          if (strokesLayer) {
            elementLayers.push(strokesLayer);
          }
        }
      }
      const imagePaint = getImagePaintWithUrl({ computedStyle, el });

      if (imagePaint) {
        fills.push(imagePaint);
        rectNode.name = "IMAGE";
      }

      const shadowEffects = getShadowEffects({ computedStyle });

      if (shadowEffects) {
        rectNode.effects = shadowEffects;
      }

      const borderRadii = getBorderRadii({ computedStyle });
      Object.assign(rectNode, borderRadii);

      elementLayers.push(rectNode);
    }
  }

  return elementLayers;
};

export function isHidden(element: Element) {
  element;
  // TODO: Uncomment this for the html to penpot plugin
  // let el: Element | null = element;
  // do {
  //   const computed = getComputedStyle(el);
  //   if (
  //     // computed.opacity === '0' ||
  //     computed.display === "none" ||
  //     computed.visibility === "hidden"
  //   ) {
  //     return true;
  //   }
  //   // Some sites hide things by having overflow: hidden and height: 0, e.g. dropdown menus that animate height in
  //   if (
  //     computed.overflow !== "visible" &&
  //     el.getBoundingClientRect().height < 1
  //   ) {
  //     return true;
  //   }
  // } while ((el = el.parentElement));
  return false;
}

export const createSvgLayer = (el: SVGSVGElement) => {
  const rect = el.getBoundingClientRect();

  const layer: LayerNode = {
    type: "SVG",
    ref: el,
    svg: el.outerHTML,
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };

  return layer;
};

export function getAppliedComputedStyles(
  element: Element,
  pseudo?: string,
): { [key: string]: string } {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    return {};
  }

  const styles = getComputedStyle(element, pseudo);

  const color = styles.color;

  const defaults: any = {
    transform: "none",
    opacity: "1",
    borderRadius: "0px",
    backgroundImage: "none",
    backgroundPosition: "0% 0%",
    backgroundSize: "auto",
    backgroundColor: "rgba(0, 0, 0, 0)",
    backgroundAttachment: "scroll",
    border: "0px none " + color,
    borderTop: "0px none " + color,
    borderBottom: "0px none " + color,
    borderLeft: "0px none " + color,
    borderRight: "0px none " + color,
    borderWidth: "0px",
    borderColor: color,
    borderStyle: "none",
    boxShadow: "none",
    fontWeight: "400",
    textAlign: "start",
    justifyContent: "normal",
    alignItems: "normal",
    alignSelf: "auto",
    flexGrow: "0",
    textDecoration: "none solid " + color,
    lineHeight: "normal",
    letterSpacing: "normal",
    backgroundRepeat: "repeat",
    zIndex: "auto", // TODO
  };

  function pick<T extends { [key: string]: V }, V = any>(
    object: T,
    paths: (keyof T)[],
  ) {
    const newObject: Partial<T> = {};
    paths.forEach((path) => {
      if (object[path]) {
        if (object[path] !== defaults[path]) {
          newObject[path] = object[path];
        }
      }
    });
    return newObject;
  }

  return pick(styles, list as any) as any;
}

const list: (keyof React.CSSProperties)[] = [
  "opacity",
  "backgroundColor",
  "border",
  "borderTop",
  "borderLeft",
  "borderRight",
  "borderBottom",
  "borderRadius",
  "backgroundImage",
  "borderColor",
  "boxShadow",
];

export function size(obj: object) {
  return Object.keys(obj).length;
}

export const fastClone = (data: any) =>
  typeof data === "symbol" ? null : JSON.parse(JSON.stringify(data));

export function getBoundingClientRect(el: Element): Dimensions {
  const computed = getComputedStyle(el);
  const display = computed.display;
  if (display.includes("inline") && el.children.length) {
    const elRect = el.getBoundingClientRect();
    const aggregateRect = getAggregateRectOfElements(Array.from(el.children))!;

    if (elRect.width > aggregateRect.width) {
      return {
        ...aggregateRect,
        width: elRect.width,
        left: elRect.left,
        right: elRect.right,
      };
    }
    return aggregateRect;
  }

  return el.getBoundingClientRect();
}

export interface Dimensions
  extends Pick<
    DOMRect,
    "top" | "left" | "bottom" | "width" | "right" | "height"
  > {}

function getAggregateRectOfElements(elements: Element[]) {
  if (!elements.length) {
    return null;
  }

  const { top } = getBoundingClientRect(
    getDirectionMostOfElements("top", elements),
  );
  const { left } = getBoundingClientRect(
    getDirectionMostOfElements("left", elements),
  );
  const { bottom } = getBoundingClientRect(
    getDirectionMostOfElements("bottom", elements),
  );
  const { right } = getBoundingClientRect(
    getDirectionMostOfElements("right", elements),
  );
  const width = right - left;
  const height = bottom - top;
  return {
    top,
    left,
    bottom,
    right,
    width,
    height,
  };
}

export type Direction = "left" | "right" | "top" | "bottom";
function getDirectionMostOfElements(direction: Direction, elements: Element[]) {
  if (elements.length === 1) {
    return elements[0];
  }
  return elements.reduce(
    (memo, value) => {
      if (!memo) {
        return value;
      }

      const valueDirection = getBoundingClientRect(value)[direction];
      const memoDirection = getBoundingClientRect(memo)[direction];

      if (direction === "left" || direction === "top") {
        if (valueDirection < memoDirection) {
          return value;
        }
      } else {
        if (valueDirection > memoDirection) {
          return value;
        }
      }
      return memo;
    },
    null as Element | null,
  ) as Element;
}

export function getRgb(colorString?: string | null) {
  if (!colorString) {
    return null;
  }
  const [_1, r, g, b, _2, a] = (colorString!.match(
    /rgba?\(([\d\.]+), ([\d\.]+), ([\d\.]+)(, ([\d\.]+))?\)/,
  )! || []) as string[];

  const none = a && parseFloat(a) === 0;

  if (r && g && b && !none) {
    return {
      r: parseInt(r) / 255,
      g: parseInt(g) / 255,
      b: parseInt(b) / 255,
      a: a ? parseFloat(a) : 1,
    };
  }
  return null;
}

export const addStrokesFromBorder = ({
  computedStyle: { border },
}: {
  computedStyle: CSSStyleDeclaration;
}): Pick<RectangleNode, "strokes" | "strokeWeight"> | undefined => {
  if (border) {
    const parsed = border.match(/^([\d\.]+)px\s*(\w+)\s*(.*)$/);
    if (parsed) {
      const [_match, borderWidth, borderType, borderColor] = parsed;
      if (hasBorder({ borderWidth, borderType, borderColor })) {
        const rgb = getRgb(borderColor);
        if (rgb) {
          return {
            strokes: [
              {
                type: "SOLID",
                color: { r: rgb.r, b: rgb.b, g: rgb.g },
                opacity: rgb.a || 1,
              },
            ],
            strokeWeight: Math.round(parseFloat(borderWidth)),
          };
        }
      }
    }
  }
  return undefined;
};

const hasBorder = ({
  borderWidth,
  borderType,
  borderColor,
}: {
  borderWidth: string;
  borderType: string;
  borderColor: string;
}) =>
  borderWidth && borderWidth !== "0" && borderType !== "none" && borderColor;

export function getStrokesRectangle({
  dir,
  rect,
  computedStyle,
  el,
}: {
  dir: Direction;
  rect: Dimensions;
  computedStyle: CSSStyleDeclaration;
  el: Element;
}): WithRef<RectangleNode> | undefined {
  const computed = computedStyle[("border" + capitalize(dir)) as any];
  if (computed) {
    const parsed = computed.match(/^([\d\.]+)px\s*(\w+)\s*(.*)$/);
    if (parsed) {
      const [_match, borderWidth, borderType, borderColor] = parsed;
      if (hasBorder({ borderWidth, borderType, borderColor })) {
        const rgb = getRgb(borderColor);
        if (rgb) {
          const width = ["top", "bottom"].includes(dir)
            ? rect.width
            : parseFloat(borderWidth);
          const height = ["left", "right"].includes(dir)
            ? rect.height
            : parseFloat(borderWidth);
          const fill: SolidPaint = {
            type: "SOLID",
            color: { r: rgb.r, b: rgb.b, g: rgb.g },
            opacity: rgb.a || 1,
          };
          const layer: WithRef<RectangleNode> = {
            ref: el,
            type: "RECTANGLE",
            x:
              dir === "left"
                ? rect.left - width
                : dir === "right"
                  ? rect.right
                  : rect.left,
            y:
              dir === "top"
                ? rect.top - height
                : dir === "bottom"
                  ? rect.bottom
                  : rect.top,
            width,
            height,
            fills: [fill],
          };

          return layer;
        }
      }
    }
  }

  return undefined;
}

const capitalize = (str: string) => str[0].toUpperCase() + str.substring(1);

interface ImagePaint {
  url?: string;
  type: "IMAGE";
  scaleMode: "FILL" | "FIT";
  imageHash: null;
}
export const getImagePaintWithUrl = ({
  computedStyle,
  el,
}: {
  computedStyle: CSSStyleDeclaration;
  el: Element;
}): ImagePaint | undefined => {
  if (el instanceof SVGSVGElement) {
    const url = `data:image/svg+xml,${encodeURIComponent(
      el.outerHTML.replace(/\s+/g, " "),
    )}`;
    return {
      url,
      type: "IMAGE",
      scaleMode: "FILL",
      imageHash: null,
    };
  } else {
    const baseImagePaint: ImagePaint = {
      type: "IMAGE",
      scaleMode: computedStyle.objectFit === "contain" ? "FIT" : "FILL",
      imageHash: null,
    };

    if (el instanceof HTMLImageElement) {
      const url = el.currentSrc;
      if (url) {
        return {
          url,
          ...baseImagePaint,
        };
      }
    } else if (el instanceof HTMLVideoElement) {
      const url = el.poster;
      if (url) {
        return {
          url,
          ...baseImagePaint,
        };
      }
    }
  }

  if (
    computedStyle.backgroundImage &&
    computedStyle.backgroundImage !== "none"
  ) {
    const urlMatch = computedStyle.backgroundImage.match(
      /url\(['"]?(.*?)['"]?\)/,
    );
    const url = urlMatch?.[1];
    if (url) {
      return {
        url,
        type: "IMAGE",
        scaleMode: computedStyle.backgroundSize === "contain" ? "FIT" : "FILL",
        imageHash: null,
      };
    }
  }

  return undefined;
};

export const getShadowEffects = ({
  computedStyle: { boxShadow },
}: {
  computedStyle: CSSStyleDeclaration;
}): ShadowEffect[] | undefined => {
  if (boxShadow && boxShadow !== "none") {
    const parsed = parseBoxShadowStr(boxShadow);
    const color = getRgb(parsed.color);
    if (color) {
      const shadowEffect: ShadowEffect = {
        color,
        type: "DROP_SHADOW",
        blur_radius: parsed.blurRadius,
        spread_radius: parsed.spreadRadius,
        blendMode: "NORMAL",
        visible: true,
        offset: {
          x: parsed.offsetX,
          y: parsed.offsetY,
        },
      };
      return [shadowEffect];
    }
  }

  return undefined;
};

const LENGTH_REG = /^[0-9]+[a-zA-Z%]+?$/;
const isLength = (v: string) => v === "0" || LENGTH_REG.test(v);
const toNum = (v: string): number => {
  // if (!/px$/.test(v) && v !== '0') return v;
  if (!/px$/.test(v) && v !== "0") return 0;
  const n = parseFloat(v);
  // return !isNaN(n) ? n : v;
  return !isNaN(n) ? n : 0;
};
export const parseBoxShadowStr = (str: string): ParsedBoxShadow => {
  if (str.startsWith("rgb")) {
    // Werid computed style thing that puts the color in the front not back
    const colorMatch = str.match(/(rgba?\(.+?\))(.+)/);
    if (colorMatch) {
      str = (colorMatch[2] + " " + colorMatch[1]).trim();
    }
  }

  const PARTS_REG = /\s(?![^(]*\))/;
  const parts = str.split(PARTS_REG);
  const inset = parts.includes("inset");
  const last = parts.slice(-1)[0];
  const color = !isLength(last) ? last : "rgba(0, 0, 0, 1)";

  const nums = parts
    .filter((n) => n !== "inset")
    .filter((n) => n !== color)
    .map(toNum);

  const [offsetX, offsetY, blurRadius, spreadRadius] = nums;

  return {
    inset,
    offsetX,
    offsetY,
    blurRadius,
    spreadRadius,
    color,
  };
};

export const getBorderRadii = ({
  computedStyle,
}: {
  computedStyle: CSSStyleDeclaration;
}): Partial<
  Pick<
    RectangleNode,
    | "topLeftRadius"
    | "topRightRadius"
    | "bottomLeftRadius"
    | "bottomRightRadius"
  >
> => {
  const topLeft = parseUnits(computedStyle.borderTopLeftRadius);
  const topRight = parseUnits(computedStyle.borderTopRightRadius);
  const bottomRight = parseUnits(computedStyle.borderBottomRightRadius);
  const bottomLeft = parseUnits(computedStyle.borderBottomLeftRadius);

  const borderRadii = {
    ...(topLeft ? { topLeftRadius: topLeft.value } : {}),
    ...(topRight ? { topRightRadius: topRight.value } : {}),
    ...(bottomRight ? { bottomRightRadius: bottomRight.value } : {}),
    ...(bottomLeft ? { bottomLeftRadius: bottomLeft.value } : {}),
  };
  return borderRadii;
};

export interface Unit {
  unit: "PIXELS";
  value: number;
}
export const parseUnits = (str?: string | null): null | Unit => {
  if (!str) {
    return null;
  }
  const match = str.match(/([\d\.]+)px/);
  const val = match?.[1];
  if (val) {
    return {
      unit: "PIXELS",
      value: parseFloat(val),
    };
  }
  return null;
};

export function textNodesUnder(el: Element) {
  let n: Node | null = null;
  const a: Node[] = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);

  while ((n = walk.nextNode())) {
    a.push(n);
  }
  return a;
}

export const buildTextNode = ({
  node,
}: {
  node: Node;
}): WithRef<TextNode> | undefined => {
  const trimmedText = node.textContent?.trim() || "";

  if (!trimmedText.length) {
    return undefined;
  }

  const parent = node.parentElement;
  if (parent) {
    if (isHidden(parent)) {
      return undefined;
    }
    const computedStyles = getComputedStyle(parent);
    const range = document.createRange();
    range.selectNode(node);
    const rect = fastClone(range.getBoundingClientRect());
    const lineHeight = parseUnits(computedStyles.lineHeight);
    range.detach();
    if (lineHeight && rect.height < lineHeight.value) {
      const delta = lineHeight.value - rect.height;
      rect.top -= delta / 2;
      rect.height = lineHeight.value;
    }
    if (rect.height < 1 || rect.width < 1) {
      return undefined;
    }

    const textNode: WithRef<TextNode> = {
      x: Math.round(rect.left),
      ref: node,
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      type: "TEXT",
      characters: trimmedText.replace(/\s+/g, " "),
    };

    const fills: SolidPaint[] = [];
    const rgb = getRgb(computedStyles.color);

    if (rgb) {
      fills.push({
        type: "SOLID",
        color: {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
        },
        opacity: rgb.a || 1,
      } as SolidPaint);
    }

    if (fills.length) {
      textNode.fills = fills;
    }
    const letterSpacing = parseUnits(computedStyles.letterSpacing);
    if (letterSpacing) {
      textNode.letterSpacing = letterSpacing;
    }

    if (lineHeight) {
      textNode.lineHeight = lineHeight;
    }

    const { textTransform } = computedStyles;
    switch (textTransform) {
      case "uppercase": {
        textNode.textCase = "UPPER";
        break;
      }
      case "lowercase": {
        textNode.textCase = "LOWER";
        break;
      }
      case "capitalize": {
        textNode.textCase = "TITLE";
        break;
      }
    }

    const fontSize = parseUnits(computedStyles.fontSize);
    if (fontSize) {
      textNode.fontSize = Math.round(fontSize.value);
    }
    if (computedStyles.fontFamily) {
      // const font = computedStyles.fontFamily.split(/\s*,\s*/);
      (textNode as any).fontFamily = computedStyles.fontFamily;
    }

    if (
      ["underline", "strikethrough"].includes(computedStyles.textDecoration)
    ) {
      textNode.textDecoration =
        computedStyles.textDecoration.toUpperCase() as any;
    }

    if (
      ["left", "center", "right", "justified"].includes(
        computedStyles.textAlign,
      )
    ) {
      textNode.textAlignHorizontal =
        computedStyles.textAlign.toUpperCase() as any;
    }

    return textNode;
  }
};

export const getLayersForFrames = ({
  root,
  layers,
}: {
  root: WithRef<FrameNode>;
  layers: LayerNode[];
}) => {
  (root as any).children = layers.slice(1);
  makeTree({ root, layers });
  const framesLayers = [root];
  addConstraints(framesLayers);

  return framesLayers;
};

const makeTree = ({
  root,
  layers,
}: {
  root: WithRef<FrameNode>;
  layers: LayerNode[];
}) => {
  const refMap = new WeakMap<Element | Node, LayerNode>();
  layers.forEach((layer) => {
    if (layer.ref) {
      refMap.set(layer.ref, layer);
    }
  });

  let updated = true;
  let iterations = 0;
  while (updated) {
    updated = false;
    if (iterations++ > 10000) {
      console.error("Too many tree iterations 1");
      break;
    }

    traverse(root, (layer, originalParent) => {
      // const node = layer.ref!;
      const node = layer.ref;
      let parentElement: Element | null =
        (node && (node as Element).parentElement) || null;
      do {
        if (parentElement === document.body) {
          break;
        }
        if (parentElement && parentElement !== document.body) {
          // Get least common demoninator shared parent and make a group
          const parentLayer = refMap.get(parentElement);
          if (parentLayer === originalParent) {
            break;
          }
          if (parentLayer && parentLayer !== root) {
            if (hasChildren(parentLayer)) {
              if (originalParent) {
                const index = (originalParent as any).children.indexOf(layer);
                (originalParent as any).children.splice(index, 1);
                (parentLayer.children as Array<any>).push(layer);
                updated = true;
                return;
              }
            } else {
              let parentRef = parentLayer.ref;
              if (
                parentRef &&
                parentRef instanceof Node &&
                parentRef.nodeType === Node.TEXT_NODE
              ) {
                parentRef = parentRef.parentElement as Element;
              }
              const overflowHidden =
                parentRef instanceof Element &&
                getComputedStyle(parentRef).overflow !== "visible";
              const newParent: LayerNode = {
                type: "FRAME",
                clipsContent: !!overflowHidden,
                // type: 'GROUP',
                x: parentLayer.x,
                y: parentLayer.y,
                width: parentLayer.width,
                height: parentLayer.height,
                ref: parentLayer.ref,
                backgrounds: [] as any,
                children: [parentLayer, layer] as any[],
              };

              const parent = getParent({ layer: parentLayer, root });
              if (!parent) {
                console.warn(
                  "\n\nCANT FIND PARENT\n",
                  JSON.stringify({ ...parentLayer, ref: null }),
                );
                continue;
              }
              if (originalParent) {
                const index = (originalParent as any).children.indexOf(layer);
                (originalParent as any).children.splice(index, 1);
              }
              delete parentLayer.ref;
              const newIndex = (parent as any).children.indexOf(parentLayer);
              refMap.set(parentElement, newParent);
              (parent as any).children.splice(newIndex, 1, newParent);
              updated = true;
              return;
            }
          }
        }
      } while (parentElement && (parentElement = parentElement.parentElement));
    });
  }
  // Collect tree of depeest common parents and make groups
  let secondUpdate = true;
  let secondIterations = 0;
  while (secondUpdate) {
    if (secondIterations++ > 10000) {
      console.error("Too many tree iterations 2");
      break;
    }
    secondUpdate = false;

    traverse(root, (layer) => {
      if (secondUpdate) {
        return;
      }
      if (layer.type === "FRAME" && "children" in layer) {
        // Final all child elements with layers, and add groups around  any with a shared parent not shared by another
        // const ref = layer.ref as Element;
        if (layer.children && layer.children.length > 2) {
          const childRefs =
            layer.children &&
            (layer.children as LayerNode[]).map((child) => child.ref!);

          let lowestCommonDenominator = layer.ref!;
          let lowestCommonDenominatorDepth = getDepth(lowestCommonDenominator);

          // Find lowest common demoninator with greatest depth
          for (const childRef of childRefs) {
            const otherChildRefs = childRefs.filter(
              (item: any) => item !== childRef,
            );
            const childParents = getParents(childRef);
            for (const otherChildRef of otherChildRefs) {
              const otherParents = getParents(otherChildRef);
              for (const parent of otherParents) {
                if (
                  childParents.includes(parent) &&
                  layer.ref!.contains(parent)
                ) {
                  const depth = getDepth(parent);
                  if (depth > lowestCommonDenominatorDepth) {
                    lowestCommonDenominator = parent;
                    lowestCommonDenominatorDepth = depth;
                  }
                }
              }
            }
          }
          if (
            lowestCommonDenominator &&
            lowestCommonDenominator !== layer.ref
          ) {
            // Make a group around all children elements
            const newChildren = layer.children!.filter((item: any) =>
              lowestCommonDenominator.contains(item.ref),
            );

            if (newChildren.length !== layer.children.length) {
              const lcdRect = getBoundingClientRect(
                lowestCommonDenominator as Element,
              );

              const overflowHidden =
                lowestCommonDenominator instanceof Element &&
                getComputedStyle(lowestCommonDenominator).overflow !==
                  "visible";

              const newParent: LayerNode = {
                type: "FRAME",
                clipsContent: !!overflowHidden,
                ref: lowestCommonDenominator as Element,
                x: lcdRect.left,
                y: lcdRect.top,
                width: lcdRect.width,
                height: lcdRect.height,
                backgrounds: [] as any,
                children: newChildren as any,
              };
              refMap.set(lowestCommonDenominator, newParent);
              let firstIndex = layer.children.length - 1;
              for (const child of newChildren) {
                const childIndex = layer.children.indexOf(child as any);
                if (childIndex > -1 && childIndex < firstIndex) {
                  firstIndex = childIndex;
                }
              }
              (layer.children as any).splice(firstIndex, 0, newParent);
              for (const child of newChildren) {
                const index = layer.children.indexOf(child);
                if (index > -1) {
                  (layer.children as any).splice(index, 1);
                }
              }
              secondUpdate = true;
            }
          }
        }
      }
    });
  }
  // Update all positions
  traverse(root, (layer) => {
    if (layer.type === "FRAME" || (layer as any).type === "GROUP") {
      const { x, y } = layer;
      if (x || y) {
        traverse(layer, (child) => {
          if (child === layer) {
            return;
          }
          child.x = child.x! - x!;
          child.y = child.y! - y!;
        });
      }
    }
  });
};

export function traverse(
  layer: LayerNode,
  cb: (layer: LayerNode, parent?: LayerNode | null) => void,
  parent?: LayerNode | null,
) {
  if (layer) {
    cb(layer, parent);
    if (hasChildren(layer)) {
      layer.children.forEach((child: any) =>
        traverse(child as LayerNode, cb, layer),
      );
    }
  }
}

export type ChildrenMixin = LayerNode & {
  children: LayerNode[];
};
export const hasChildren = (node: LayerNode): node is ChildrenMixin =>
  node && Array.isArray((node as ChildrenMixin).children);

const getParent = ({
  layer,
  root,
}: {
  layer: LayerNode;
  root: WithRef<FrameNode>;
}) => {
  let response: LayerNode | null = null;
  try {
    traverse(root, (child) => {
      if (
        child &&
        (child as any).children &&
        (child as any).children.includes(layer)
      ) {
        response = child;
        // Deep traverse short circuit hack
        throw "DONE";
      }
    });
  } catch (err) {
    if (err === "DONE") {
      // Do nothing
    } else {
      console.error(err instanceof Error ? err.message : err);
    }
  }
  return response;
};

export function getParents(node: Element | Node): Element[] {
  let el: Element | null =
    node instanceof Node && node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : (node as Element);

  const parents: Element[] = [];
  while (el && (el = el.parentElement)) {
    parents.push(el);
  }
  return parents;
}

export function getDepth(node: Element | Node) {
  return getParents(node).length;
}

function removeRefs({
  layers,
  root,
}: {
  layers: LayerNode[];
  root: WithRef<FrameNode>;
}) {
  layers.concat([root]).forEach((layer) => {
    traverse(layer, (child) => {
      delete child.ref;
    });
  });
}

export function addConstraints(layers: LayerNode[]) {
  layers.forEach((layer) => {
    traverse(layer, (child) => {
      if (child.type === "SVG") {
        child.constraints = {
          horizontal: "center",
          vertical: "top",
        };
      } else {
        const ref = child.ref;
        if (ref) {
          const el = ref instanceof HTMLElement ? ref : ref.parentElement;
          const parent = el?.parentElement;
          if (el && parent) {
            const currentDisplay = el.style.display;
            el.style.setProperty("display", "none", "!important");
            let computed = getComputedStyle(el);
            const hasFixedWidth = computed?.width.trim().endsWith("px");
            const hasFixedHeight = computed?.height.trim().endsWith("px");
            el.style.display = currentDisplay;
            const parentStyle = getComputedStyle(parent);
            let hasAutoMarginLeft = computed.marginLeft === "auto";
            let hasAutoMarginRight = computed.marginRight === "auto";
            let hasAutoMarginTop = computed.marginTop === "auto";
            let hasAutoMarginBottom = computed.marginBottom === "auto";

            computed = getComputedStyle(el);

            if (["absolute", "fixed"].includes(computed.position!)) {
              setData(child, "position", computed.position!);
            }

            if (hasFixedHeight) {
              setData(child, "heightType", "fixed");
            }
            if (hasFixedWidth) {
              setData(child, "widthType", "fixed");
            }

            const isInline =
              computed.display && computed.display.includes("inline");

            if (isInline) {
              const parentTextAlign = parentStyle.textAlign;
              if (parentTextAlign === "center") {
                hasAutoMarginLeft = true;
                hasAutoMarginRight = true;
              } else if (parentTextAlign === "right") {
                hasAutoMarginLeft = true;
              }

              if (computed.verticalAlign === "middle") {
                hasAutoMarginTop = true;
                hasAutoMarginBottom = true;
              } else if (computed.verticalAlign === "bottom") {
                hasAutoMarginTop = true;
                hasAutoMarginBottom = false;
              }

              setData(child, "widthType", "shrink");
            }
            const parentJustifyContent =
              parentStyle.display === "flex" &&
              ((parentStyle.flexDirection === "row" &&
                parentStyle.justifyContent) ||
                (parentStyle.flexDirection === "column" &&
                  parentStyle.alignItems));

            if (parentJustifyContent === "center") {
              hasAutoMarginLeft = true;
              hasAutoMarginRight = true;
            } else if (
              parentJustifyContent &&
              (parentJustifyContent.includes("end") ||
                parentJustifyContent.includes("right"))
            ) {
              hasAutoMarginLeft = true;
              hasAutoMarginRight = false;
            }

            const parentAlignItems =
              parentStyle.display === "flex" &&
              ((parentStyle.flexDirection === "column" &&
                parentStyle.justifyContent) ||
                (parentStyle.flexDirection === "row" &&
                  parentStyle.alignItems));
            if (parentAlignItems === "center") {
              hasAutoMarginTop = true;
              hasAutoMarginBottom = true;
            } else if (
              parentAlignItems &&
              (parentAlignItems.includes("end") ||
                parentAlignItems.includes("bottom"))
            ) {
              hasAutoMarginTop = true;
              hasAutoMarginBottom = false;
            }

            if (child.type === "TEXT") {
              if (computed.textAlign === "center") {
                hasAutoMarginLeft = true;
                hasAutoMarginRight = true;
              } else if (computed.textAlign === "right") {
                hasAutoMarginLeft = true;
                hasAutoMarginRight = false;
              }
            }

            child.constraints = {
              horizontal:
                hasAutoMarginLeft && hasAutoMarginRight
                  ? "center"
                  : hasAutoMarginLeft
                    ? "right"
                    : "scale",
              vertical:
                hasAutoMarginBottom && hasAutoMarginTop
                  ? "center"
                  : hasAutoMarginTop
                    ? "bottom"
                    : "top",
            };
          }
        } else {
          child.constraints = {
            horizontal: "scale",
            vertical: "top",
          };
        }
      }
    });
  });
}

function setData(
  node: LayerNode & { data?: { [index: string]: string } },
  key: string,
  value: string,
) {
  if (!node.data) {
    node.data = {};
  }
  node.data[key] = value;
}

import {
  Board,
  Fill,
  Shape,
  Stroke as PenpotStroke,
  Shadow,
  Color as PenpotColor,
} from "@penpot/plugin-types";
import rgbHex from "rgb-hex";

type BLEND_MODE = "NORMAL";
export type WithRef<T> = Partial<T> & { ref?: Element | Node };
type SHADOW_EFFECT_TYPE = "DROP_SHADOW";
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
interface Unit {
  unit: "PIXELS";
  value: number;
}
type STROKE_TYPE = "SOLID";
type StrokeWeight = number;
type Stroke = {
  type: STROKE_TYPE;
  color: Color;
  opacity: number;
};
type Color = {
  r: number;
  g: number;
  b: number;
};
type Effect = WithRef<ShadowEffect>;
type SolidPaint = {
  type: "SOLID";
  color: Color;
  opacity: number;
};
interface ImagePaint {
  url?: string;
  type: "IMAGE";
  scaleMode: "FILL" | "FIT";
  imageHash: null;
}
type Paint = Partial<SolidPaint | ImagePaint>;

type Constraints = {
  horizontal: "center" | "right" | "left" | "center" | "scale";
  vertical: "center" | "bottom" | "top" | "scale";
};

export type PenpotNode = {
  type: "SVG" | "RECTANGLE" | "TEXT" | "FRAME";
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  clipsContent?: boolean;
  backgrounds?: unknown[];
  fills?: Paint[];
  strokes?: Stroke[];

  strokeWeight: StrokeWeight;
  effects: Effect[];

  children?: PenpotNode[];
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomRightRadius?: number;
  bottomLeftRadius?: number;
  constraints?: Constraints;
  characters?: string;
  letterSpacing?: Unit;
  lineHeight?: Unit;
  textCase?: "UPPER" | "LOWER" | "TITLE";
  fontSize?: number;
  fontFamily?: string;
  data?: {
    heightType?: string;
    widthType?: string;
  };
  opacity?: number;
  color?: {
    r: number;
    g: number;
    b: number;
  };
  textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textDecoration: "underline" | "strikethrough";
  svg: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PenpotComponent = PenpotNode[];
export type TMessage_CreateComponent = {
  message: "create_component";
  componentTree: PenpotComponent;
};
type TMessage_IDRequest = {
  message: "id_request";
};
//
penpot.ui.open("Penpot copilot", `?theme=${penpot.theme},`, {
  width: 430,
  height: 465,
});
//
penpot.ui.onMessage<TMessage_IDRequest | TMessage_CreateComponent>(
  async (message) => {
    const type = message.message;
    if (type == "id_request") {
      //TODO: Current fix till id starts working again
      penpot.ui.sendMessage({
        type: "user_id_response",
        userId: "0987654321",
      });
    }
    if (type == "create_component") {
      const componentTree = message.componentTree;
      componentTree.forEach((root) => {
        createTree(root);
      });
    }
  },
);
function createTree(root: PenpotNode, parent?: Board) {
  let board: Board;
  switch (root.type) {
    case "FRAME": {
      board = penpot.createBoard();
      if (root.x) board.x = root.x!;
      if (root.y) board.y = root.y!;
      if (root.width && root.height) board.resize(root.width!, root.height!);
      if (parent) parent.appendChild(board);
      if (root.constraints)
        board.constraintsVertical = root.constraints!.vertical;
      if (root.constraints)
        board.constraintsHorizontal = root.constraints!.horizontal;
      if (!root.children || !(root.children.length != 0)) return;
      for (let i = root.children.length - 1; i > -1; i--) {
        const innerchild = root.children[i];
        createTree(innerchild, board);
      }
      break;
    }
    case "RECTANGLE": {
      const rectangle = penpot.createRectangle();
      if (root.x) rectangle.x = root.x!;
      if (root.y) rectangle.y = root.y!;
      if (root.width && root.height)
        rectangle.resize(root.width!, root.height!);
      if (root.fills) applyFill(root.fills, rectangle);
      if (root.strokes) {
        const strokes = root.strokes!.map((stroke) => {
          const strokeColr = rgbToHex(
            stroke.color.r,
            stroke.color.g,
            stroke.color.b,
          );
          const stroke_unit: PenpotStroke = {
            strokeColor: strokeColr,
            strokeOpacity: stroke.opacity,
            strokeStyle: "solid",
            strokeWidth: root.strokeWeight,
          };
          return stroke_unit;
        });

        rectangle.strokes = strokes;
      }
      if (root.effects) {
        const shadows = root.effects!.map((effect) => {
          const effectColor = effect.color!;
          const shadowColor = rgbToHex(
            effectColor.r,
            effectColor.g,
            effectColor.b,
          );
          const penpotColor: PenpotColor = {
            color: shadowColor,
          };
          const shadow: Shadow = {
            style: "drop-shadow",
            offsetX: effect.offset!.x,
            offsetY: effect.offset!.y,
            spread: effect.spread_radius!,
            blur: effect.blur_radius!,
            hidden: !effect.visible!,
            color: penpotColor,
          };
          return shadow;
        });
        rectangle.shadows = shadows;
      }
      parent?.appendChild(rectangle);
      applyConstraints(root, rectangle);
      break;
    }

    case "TEXT": {
      const text = penpot.createText(root.characters!);
      if (!text) break;
      if (root.x) text.x = root.x!;
      if (root.y) text.y = root.y!;
      if (root.width && root.height) text.resize(root.width!, root.height!);
      if (root.fills) applyFill(root.fills!, text);
      if (root.letterSpacing) text.letterSpacing = `${root.letterSpacing}`;
      if (root.fontSize) text.fontSize = `${root.fontSize}`;
      if (root.textCase) {
        switch (root.textCase) {
          case "UPPER":
            text.textTransform = "uppercase";
            break;
          case "LOWER":
            text.textTransform = "lowercase";
            break;
          case "TITLE":
            text.textTransform = "capitalize";
            break;
        }
      }
      if (root.textAlignHorizontal) {
        console.log("if (root.textAlignHorizontal) {");
        console.log(root.textAlignHorizontal);
        switch (root.textAlignHorizontal) {
          case "LEFT":
            text.align = "left";
            break;
          case "CENTER":
            console.log("case 'center':");
            text.align = "center";
            break;
          case "RIGHT":
            text.align = "right";
            break;
          case "JUSTIFIED":
            text.align = "justify";
            break;
        }
      }
      if (root.textDecoration) {
        switch (root.textDecoration) {
          case "underline":
            text.textDecoration = "underline";
            break;
          case "strikethrough":
            text.textDecoration = "line-through";
            break;
        }
      }
      //TODO: fontId??
      // if (root.fontFamily) text.fontFamily = root.fontFamily;
      parent?.appendChild(text);
      applyConstraints(root, text);
      break;
    }

    case "SVG": {
      const svg = penpot.createShapeFromSvg(root.svg!);
      if (!svg) break;
      if (root.x) svg.x = root.x!;
      if (root.y) svg.y = root.y!;
      if (root.width && root.height) svg.resize(root.width!, root.height!);
      parent?.appendChild(svg);
      applyConstraints(root, svg);
      break;
    }
    default: {
      break;
    }
  }

  // root.children.forEach((innerchild) => {
  //   createTree(innerchild, board);
  // });
}

function applyConstraints(root: PenpotNode, shape: Shape) {
  if (root.topLeftRadius) shape.borderRadiusTopLeft = root.topLeftRadius;
  if (root.topRightRadius) shape.borderRadiusTopRight = root.topRightRadius;
  if (root.bottomLeftRadius)
    shape.borderRadiusBottomLeft = root.bottomLeftRadius;
  if (root.bottomRightRadius)
    shape.borderRadiusBottomRight = root.bottomRightRadius;
  if (root.constraints)
    shape.constraintsHorizontal = root.constraints!.horizontal;
  if (root.constraints) shape.constraintsVertical = root.constraints!.vertical;
}

function applyFill(fills: Paint[] | undefined, penpotNode: Shape) {
  if (!fills || fills.length == 0) {
    penpotNode.fills = [
      {
        fillOpacity: 0,
      },
    ];
    return;
  }
  Promise.all(
    fills.map(async (value) => {
      if (value.type == "SOLID") {
        const color = value.color!;
        const hexColor = rgbToHex(color.r, color.g, color.b);

        const fill: Fill = {
          fillColor: hexColor,
          fillOpacity: value.opacity,
        };
        return fill;
      } else {
        if (value.type != "IMAGE" || !value.url)
          return { fillOpacity: 1, fillColor: "#000000" };
        const imageData = await penpot.uploadMediaUrl("IMAGE", value.url);
        const fill: Fill = {
          fillOpacity: 1,
          fillImage: imageData,
        };
        return fill;
      }
    }),
  ).then((fills) => {
    penpotNode.fills = fills;
  });
}

function rgbToHex(r: number, g: number, b: number) {
  const rgbString = `rgb(${r}, ${g}, ${b})`;
  return `#${rgbHex(rgbString)}`;
}

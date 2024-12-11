import {
  Board,
  Fill,
  Shape,
  Stroke as PenpotStroke,
  Shadow,
  Color as PenpotColor,
} from "@penpot/plugin-types";
import {
  Color,
  Effect,
  Stroke,
  StrokeWeight,
  Unit,
} from "./lib/html-to-penpot2";

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

type PenpotNode = {
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
  textAlignHorizontal: "left" | "center" | "right" | "justified";
  textDecoration: "underline" | "strikethrough";
  svg: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PenpotComponent = PenpotNode[];
type TMessage_CreateComponent = {
  message: "create_component";
  componentTree: PenpotComponent;
};
type TMessage_IDRequest = {
  message: "id_request";
};

penpot.ui.open("Activity Tracker", `?theme=${penpot.theme},`, {
  width: 320,
  height: 445,
});

penpot.ui.onMessage<TMessage_IDRequest | TMessage_CreateComponent>(
  async (message) => {
    const type = message.message;
    if (type == "id_request") {
      penpot.ui.sendMessage({
        type: "user_id_response",
        userId: penpot.currentUser.id,
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
      board.x = root.x!;
      board.y = root.y!;
      board.resize(root.width!, root.height!);
      board.constraintsVertical = root.constraints!.vertical;
      board.constraintsHorizontal = root.constraints!.horizontal;
      if (parent) parent.appendChild(board);
      break;
    }
    case "RECTANGLE": {
      const rectangle = penpot.createRectangle();
      rectangle.x = root.x!;
      rectangle.y = root.y!;
      rectangle.resize(root.width!, root.height!);
      applyFill(root.fills, rectangle);
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
      applyConstraints(root, rectangle);
      parent?.appendChild(rectangle);
      break;
    }

    case "TEXT": {
      const text = penpot.createText(root.characters!);
      if (!text) break;
      text.x = root.x!;
      text.y = root.y!;
      text.resize(root.width!, root.height!);
      applyFill(root.fills!, text);
      applyConstraints(root, text);
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
        switch (root.textAlignHorizontal) {
          case "left":
            text.align = "left";
            break;
          case "center":
            text.align = "center";
            break;
          case "right":
            text.align = "right";
            break;
          case "justified":
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
      break;
    }

    case "SVG": {
      const svg = penpot.createShapeFromSvg(root.svg!);
      if (!svg) break;
      svg.x = root.x!;
      svg.y = root.y!;
      svg.resize(root.width!, root.height!);
      applyConstraints(root, svg);
      parent?.appendChild(svg);
      break;
    }
    default: {
      break;
    }
  }

  if (!root.children || !(root.children.length != 0)) return;
  root.children.forEach((innerchild) => {
    createTree(innerchild, board);
  });
}

function applyConstraints(root: PenpotNode, shape: Shape) {
  if (root.topLeftRadius) shape.borderRadiusTopLeft = root.topLeftRadius;
  if (root.topRightRadius) shape.borderRadiusTopRight = root.topRightRadius;
  if (root.bottomLeftRadius)
    shape.borderRadiusBottomLeft = root.bottomLeftRadius;
  if (root.bottomRightRadius)
    shape.borderRadiusBottomRight = root.bottomRightRadius;
  shape.constraintsHorizontal = root.constraints!.horizontal;
  shape.constraintsVertical = root.constraints!.vertical;
}

function applyFill(fills: Paint[] | undefined, penpotNode: Shape) {
  if (!fills || fills.length == 0) return;
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
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error("RGB values must be in the range 0-255");
  }
  const toHex = (value: number) =>
    value.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Example usage
console.log(rgbToHex(255, 99, 71)); // Outputs: #FF6347

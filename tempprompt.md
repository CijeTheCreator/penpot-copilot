You are to complete this function

function compareValuesAndReturnChange(
oldShapeState: Shape,
newShapeState: Shape,
): { type: string; oldValue: string; newValue: string } {
throw new Error("Function not implemented.");
}

The function takes in two objects. Then compares the objects to find the changes in field values between the 2 objects.

I want you to ignore all the methods. Just compare the properties.
Also there is a parent property, just compare the ids, because the parent is also a shape.

Hence this is the structure of shape excluding the methods:
interface ShapeBase {
id: string;
name: string;
parent: null | Shape;
x: number;
y: number;
width: number;
height: number;
bounds: Bounds;
center: Point;
blocked: boolean;
hidden: boolean;
visible: boolean;
proportionLock: boolean;
constraintsHorizontal: "center" | "left" | "right" | "leftright" | "scale";
constraintsVertical: "center" | "top" | "bottom" | "scale" | "topbottom";
borderRadius: number;
borderRadiusTopLeft: number;
borderRadiusTopRight: number;
borderRadiusBottomRight: number;
borderRadiusBottomLeft: number;
opacity: number;
blendMode:
| "difference"
| "normal"
| "darken"
| "multiply"
| "color-burn"
| "lighten"
| "screen"
| "color-dodge"
| "overlay"
| "soft-light"
| "hard-light"
| "exclusion"
| "hue"
| "saturation"
| "color"
| "luminosity";
shadows: Shadow[];
blur?: Blur;
exports: Export[];
boardX: number;
boardY: number;
parentX: number;
parentY: number;
flipX: boolean;
flipY: boolean;
rotation: number;
fills: Fill[] | "mixed";
strokes: Stroke[];
}

interface Bounds {
x: number;
y: number;
width: number;
height: number;
}

interface Point {
x: number;
y: number;
}

interface Shadow {
id?: string;
style?: "drop-shadow" | "inner-shadow";
offsetX?: number;
offsetY?: number;
blur?: number;
spread?: number;
hidden?: boolean;
color?: Color;
}

interface Blur {
id?: string;
type?: "layer-blur";
value?: number;
hidden?: boolean;
}

interface Export {
type: "svg" | "png" | "jpeg" | "pdf";
scale?: number;
suffix?: string;
}

interface Fill {
fillColor?: string;
fillOpacity?: number;
fillColorGradient?: Gradient;
fillColorRefFile?: string;
fillColorRefId?: string;
fillImage?: ImageData;
}

interface Gradient {
type: "linear" | "radial";
startX: number;
startY: number;
endX: number;
endY: number;
width: number;
stops: {
color: string;
opacity?: number;
offset: number;
}[];
}

interface ImageData {
name?: string;
width: number;
height: number;
mtype?: string;
id: string;
keepApectRatio?: boolean;
}

interface Stroke {
strokeColor?: string;
strokeColorRefFile?: string;
strokeColorRefId?: string;
strokeOpacity?: number;
strokeStyle?: "svg" | "none" | "mixed" | "solid" | "dotted" | "dashed";
strokeWidth?: number;
strokeAlignment?: "center" | "inner" | "outer";
strokeCapStart?: StrokeCap;
strokeCapEnd?: StrokeCap;
strokeColorGradient?: Gradient;
}

type StrokeCap =
| "round"
| "square"
| "line-arrow"
| "triangle-arrow"
| "square-marker"
| "circle-marker"
| "diamond-marker";

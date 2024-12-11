import { Board, Rectangle, Shape, Shape, Text } from "@penpot/plugin-types";

export type LayerNode = WithRef<Rectangle | Text | Board | SvgNode>;
export interface SvgNode extends Shape {
  type: "SVG";
  svg: string;
}
export type WithRef<T> = Partial<T> & { ref?: Element | Node };

export function htmlToFigma(
  selector: HTMLElement,
  useFrames = true,
  time = true,
) {
  if (time) {
    console.time("Parse dom");
  }
  const layers: LayerNode[] = [];
  const el = selector;
}

import { PRIMARY_COLOR_HEX } from "@/processing";
import PulseLoader from "react-spinners/ClipLoader";
export function Loader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <PulseLoader color={PRIMARY_COLOR_HEX} />
    </div>
  );
}

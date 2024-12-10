import React from "react";

interface SeparatorProps {
  text?: string; // Optional text for customization
}

const Separator: React.FC<SeparatorProps> = ({ text = "OR" }) => {
  return (
    <div className="flex items-center justify-center my-4 px-4 w-full">
      <div className="border-t border-gray-300 flex-grow"></div>
      <span className="px-4 text-sm font-medium text-gray-500">{text}</span>
      <div className="border-t border-gray-300 flex-grow"></div>
    </div>
  );
};

export default Separator;

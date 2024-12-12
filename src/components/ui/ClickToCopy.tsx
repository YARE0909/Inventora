// components/ClickToCopy.tsx
import React from "react";
import { useToast } from "./Toast/ToastProvider";
import Tooltip from "./ToolTip";

interface ClickToCopyProps {
  children: React.ReactNode; // The content to be copied
  className?: string; // Optional className for additional styling
}

const ClickToCopy: React.FC<ClickToCopyProps> = ({
  children,
  className = "",
}) => {
  const { toast } = useToast();
  // Function to extract text from the children
  const extractText = (children: React.ReactNode): string => {
    if (typeof children === "string") {
      return children; // If it's plain text, return it
    }

    if (
      React.isValidElement<{ children?: React.ReactNode }>(children) &&
      children.props?.children
    ) {
      // If the child is a valid React element, extract the text from its children
      return extractText(children.props.children);
    }

    return ""; // Return an empty string if no text found
  };

  const handleClick = async () => {
    const textToCopy = extractText(children);
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast("Copied to clipboard", "top-right", "success");
      } catch {
        toast("Failed to copy to clipboard", "top-right", "error");
      }
    }
  };

  return (
    <Tooltip tooltip="Click to copy" position="top">
      <div className={`relative ${className}`} onClick={handleClick}>
        <span className="cursor-pointer">
          {children}
        </span>
      </div>
    </Tooltip>
  );
};

export default ClickToCopy;

import { CircleCheck, CircleX, Info, OctagonAlert } from "lucide-react";
import React, { useState, useEffect } from "react";

type ToastProps = {
  content: React.ReactNode;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left"; // Updated position type
  variant: "success" | "info" | "warning" | "error"; // Toast variant
  id: string; // Added id to uniquely identify the toast
  removeToast: (id: string) => void; // Function to remove the toast
};

const Toast: React.FC<ToastProps> = ({
  content,
  position,
  variant,
  id,
  removeToast,
}) => {
  const [isExiting, setIsExiting] = useState(false); // State for managing the exit animation

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true); // Start exit animation after 2.5 seconds (before removal)
    }, 2500); // Wait for 2.5 seconds before initiating exit animation

    const removeTimer = setTimeout(() => {
      if (isExiting) {
        removeToast(id); // Remove toast from the list after animation
      }
    }, 3000); // Remove after exit animation finishes (total of 3 seconds)

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [id, isExiting, removeToast]);

  // Tailwind classes for each variant
  const variantClasses = {
    success: "border border-green-600 bg-green-600/10 text-text",
    info: "border border-blue-600 bg-blue-600/10 text-text",
    warning: "border border-yellow-600 bg-yellow-600/10 text-text",
    error: "border border-red-600 bg-red-600/10 text-text",
  };

  const variantIcons = {
    success: <CircleCheck className="w-5 h-5 text-green-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <OctagonAlert className="w-5 h-5 text-yellow-600" />,
    error: <CircleX className="w-5 h-5 text-red-600" />,
  };

  // Tailwind classes for positioning based on updated position prop
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Tailwind translate directions based on position
  const translateClasses = {
    "top-right": isExiting ? "-translate-y-5" : "translate-y-0",
    "top-left": isExiting ? "-translate-y-5" : "translate-y-0",
    "bottom-right": isExiting ? "translate-y-5" : "translate-y-0",
    "bottom-left": isExiting ? "translate-y-5" : "translate-y-0",
  };

  return (
    <div
      className={`fixed ${
        positionClasses[position]
      } rounded-md transition-all transform z-50 bg-background ${
        isExiting ? "opacity-0" : "opacity-100"
      } ${translateClasses[position]}`}
    >
      <div
        className={`p-2 rounded-md flex items-center gap-1 text-sm ${variantClasses[variant]}`}
      >
        {variantIcons[variant]}
        {content}
      </div>
    </div>
  );
};

export default Toast;

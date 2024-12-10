import React, { createContext, useState, useContext, ReactNode } from "react";
import Toast from "./Toast"; // Import the Toast component
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

type ToastType = {
  id: string;
  content: ReactNode;
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left"; // Updated position type
  variant: "success" | "info" | "warning" | "error"; // Toast variant
};

type ToastContextType = {
  toasts: ToastType[];
  toast: (
    content: ReactNode,
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left",
    variant?: "success" | "info" | "warning" | "error"
  ) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const toast = (
    content: ReactNode,
    position:
      | "top-right"
      | "top-left"
      | "bottom-right"
      | "bottom-left" = "top-right",
    variant: "success" | "info" | "warning" | "error" = "info"
  ) => {
    const id = uuidv4();
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, content, position, variant },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            content={toast.content}
            position={toast.position}
            variant={toast.variant}
            removeToast={removeToast} // Pass the removeToast function to Toast
            id={toast.id} // Pass the id to Toast
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

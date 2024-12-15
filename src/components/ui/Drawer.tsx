// components/Drawer.tsx
import { X } from "lucide-react";
import { useState, forwardRef, useImperativeHandle, ReactNode } from "react";

type DrawerProps = {
  children: ReactNode;
  header?: ReactNode;
  size?: "small" | "medium" | "large" | string; // Predefined sizes or custom width
};

export type DrawerHandle = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

const Drawer = forwardRef<DrawerHandle, DrawerProps>(
  ({ children, header, size = "medium" }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const openDrawer = () => setIsOpen(true);
    const closeDrawer = () => setIsOpen(false);

    useImperativeHandle(ref, () => ({
      openDrawer,
      closeDrawer,
    }));

    const getWidth = () => {
      switch (size) {
        case "small":
          return "w-96";
        case "medium":
          return "w-1/2";
        case "large":
          return "w-2/3";
        default:
          return size; // Allow custom width classes like 'w-96' or 'w-[300px]'
      }
    };

    return (
      <div>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={closeDrawer}
        ></div>

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full bg-foreground shadow-lg z-50 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } ${getWidth()}`}
        >
          <div className="w-full h-14 border-b border-b-border p-4 z-10 bg-foreground flex justify-between items-center gap-5 lg:gap-0">
            {header ? (
              <div className="font-bold text-lg">{header}</div>
            ) : (
              <h2 className="text-lg font-semibold">Drawer</h2>
            )}
            <button
              onClick={closeDrawer}
              className="text-text hover:text-textAlt duration-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer content */}
          <div
            className="p-4 w-full h-full overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 80px)" }} // Adjust height to fit within the screen
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Drawer.displayName = "Drawer";

export default Drawer;

import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <button
      className="w-full bg-background border border-border rounded-md p-2 text-sm font-bold text-textAlt whitespace-nowrap flex items-center justify-center gap-1 hover:text-text hover:bg-foreground duration-500"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;

import React from "react";

const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      className="bg-background border border-border rounded-md p-2 text-xs font-bold text-textAlt whitespace-nowrap flex items-center gap-1 hover:text-text hover:bg-foreground duration-500"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

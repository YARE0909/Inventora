import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  classname
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  classname?: string;
}) => {
  return (
    <button
      className={classname ? `w-full bg-highlight border rounded-md p-2 text-sm font-bold whitespace-nowrap flex items-center justify-center gap-1 duration-500 ${classname}` :
        `w-full bg-highlight border border-border rounded-md p-2 text-sm font-bold text-textAlt whitespace-nowrap flex items-center justify-center gap-1 hover:text-text hover:bg-foreground duration-500`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;

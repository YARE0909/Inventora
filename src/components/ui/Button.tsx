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
      className={classname ? `w-full border-2 rounded-md p-2 text-sm font-bold whitespace-nowrap flex items-center justify-center gap-1 duration-500 ${classname}` :
        `w-full bg-button border-2 border-button rounded-md p-2 text-sm font-bold text-text whitespace-nowrap flex items-center justify-center gap-1 hover:bg-transparent duration-500`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;

// components/Input.tsx
import React from "react";

interface CustomTextInputProps {
  id?: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

const Input: React.FC<CustomTextInputProps> = ({
  id,
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="block text-sm text-textAlt font-semibold"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full flex-1 p-2 bg-background rounded-md border border-border outline-none focus:outline-none text-sm"
      />
    </div>
  );
};

export default Input;

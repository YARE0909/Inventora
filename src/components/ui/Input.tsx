// components/Input.tsx
import React from "react";

type CustomTextInputProps = {
  id?: string;
  label?: string;
  name: string;
  type?: "text" | "number" | "checkbox" | "email" | "tel" | "date" | "textArea";
  placeholder?: string;
  value?: string | number | boolean | Date | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
};

const Input: React.FC<CustomTextInputProps> = ({
  id,
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) => {
  const renderInput = () => {
    switch (type) {
      case "checkbox":
        return (
          <input
            id={id || name}
            type="checkbox"
            name={name}
            checked={!!value}
            onChange={onChange}
            className="h-5 w-5 border-2 border-border rounded-md bg-background cursor-pointer"
          />
        );
      case "number":
        return (
          <input
            id={id || name}
            type="number"
            name={name}
            value={value as number | ""}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 bg-background rounded-md border-2 border-border outline-none focus:outline-none text-sm"
          />
        );
      case "email":
        return (
          <input
            id={id || name}
            type="email"
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 bg-background rounded-md border-2 border-border outline-none focus:outline-none text-sm"
          />
        );
      case "tel":
        return (
          <input
            id={id || name}
            type="tel"
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 bg-background rounded-md border-2 border-border outline-none focus:outline-none text-sm"
          />
        );
      case "date":
        return (
          <input
            id={id || name}
            type="date"
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-[0.44rem] bg-background rounded-md border-2 border-border outline-none focus:outline-none text-sm"
          />
        );
      case "textArea":
        return (
          <textarea
            id={id || name}
            name={name}
            value={value as string}
            // @ts-expect-error - Fix this later
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 bg-background rounded-md border-2 border-border outline-none focus:outline-none text-sm"
          />
        );
      default:
        return (
          <input
            id={id || name}
            type="text"
            name={name}
            value={value as string}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full p-2 bg-background rounded-md border-2 border-border outline-none focus:outline-none text-sm"
          />
        );
    }
  };

  return (
    <div className="w-full relative">
      <label
        htmlFor={id || name}
        className="block text-sm text-textAlt font-semibold mb-1"
      >
        {label}
      </label>
      {renderInput()}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;

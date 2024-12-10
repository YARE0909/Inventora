import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  type: "text" | "number" | "email"; // Input type for validation
  placeholder?: string; // Placeholder text
  value?: string; // Controlled value for the input
  onChange?: (value: string) => void; // Callback for value changes
  onEnter?: (value: string) => void; // Callback when Enter is pressed
  validate?: (value: string) => string | null; // Validation function (optional)
}

const SearchBar = ({
  type,
  placeholder = "Search...",
  value = "",
  onChange,
  onEnter,
  validate,
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Update the input value
    setInputValue(newValue);

    // Perform validation if a validation function is provided
    if (validate) {
      const validationError = validate(newValue);
      setError(validationError);
    } else {
      setError(null);
    }

    // Call the onChange callback if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnter && !error) {
      onEnter(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col min-w-64 max-w-96 w-full">
      <div className="flex items-center border border-border rounded-md bg-background focus-within:ring-2 focus-within:ring-highlight">
        <div className="pl-3">
          <Search className="h-5 w-5 text-textAlt" />
        </div>
        <input
          type={type}
          value={inputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 bg-transparent focus:outline-none text-sm text-text"
        />
      </div>
      {/* Display error if validation fails */}
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default SearchBar;

import React, { useEffect, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  label: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
  showLabel?: boolean; // Prop to control label visibility
};

const Select: React.FC<SelectProps> = ({
  options,
  label,
  placeholder = "Search...",
  value = "",
  onChange,
  showLabel = true, // Default to show label
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setSelectedValue(selectedOption.label);
    }
  }, [value, options]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionSelect = (value: string, label: string) => {
    setSelectedValue(label);
    onChange(value);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full">
      {showLabel && (
        <label className="block text-sm text-textAlt font-semibold mb-1">
          {label}
        </label>
      )}
      <div
        className="border border-border rounded-md p-2 bg-background cursor-pointer text-sm"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        {showLabel ? selectedValue || "Select an option" : label}
      </div>
      {isDropdownOpen && (
        <div className="absolute z-10 bg-background border border-border rounded-md mt-1 w-full">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background rounded-md border-b border-border p-2 focus:outline-none"
          />
          <ul className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value, option.label)}
                  className="p-2 hover:bg-highlight cursor-pointer"
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No options found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Select;

import React, { useState } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  options: SelectOption[];
  label: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

const Select: React.FC<SelectProps> = ({
  options,
  label,
  placeholder = "Search...",
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

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
      <label className="block text-sm text-textAlt font-semibold">
        {label}
      </label>
      <div
        className="border border-border rounded-md p-[0.37rem] bg-background cursor-pointer"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        {selectedValue || "Select an option"}
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

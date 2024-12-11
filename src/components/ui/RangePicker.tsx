import React, { useState } from "react";

interface RangePickerProps {
  onChange: (startDate: string, endDate: string) => void; // Function to pass the selected date range
  placeholder?: string; // Placeholder for the text input
}

const RangePicker: React.FC<RangePickerProps> = ({
  onChange,
  placeholder = "Select Date Range",
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }
  };

  const handleBlur = () => {
    // If both dates are selected, update the parent component and close the picker
    if (startDate && endDate) {
      onChange(startDate, endDate);
      setIsOpen(false);
    }
  };

  const handleClick = () => {
    setIsOpen(!isOpen); // Toggle the date picker visibility
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-md"
        value={startDate && endDate ? `${startDate} to ${endDate}` : ""}
        onClick={handleClick}
        placeholder={placeholder}
        readOnly
      />
      {isOpen && (
        <div className="absolute z-10 bg-white p-4 border border-gray-300 shadow-lg rounded-md mt-2">
          <div className="flex space-x-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm text-gray-700"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
                onBlur={handleBlur}
                className="mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
                onBlur={handleBlur}
                className="mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RangePicker;

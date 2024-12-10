import React, { Dispatch, SetStateAction, ReactNode, useState } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

const Tabs = ({
  tabs,
  setActiveTab,
}: {
  tabs: Tab[];
  setActiveTab: Dispatch<
    SetStateAction<"Active" | "OnHold" | "Completed" | "Cancelled">
  >; // Accept `setActiveTab` as a prop
}) => {
  const [activeTab, localSetActiveTab] = useState(0);

  const handleTabChange = (index: number, label: string) => {
    // Remove spaces and capitalize the first letter of each word
    const formattedLabel = label
      .replace(/\s+/g, "") // Remove all spaces
      .replace(/(^[a-z])|(\s[a-z])/g, (match) => match.toUpperCase()) as
      | "Active"
      | "OnHold"
      | "Completed"
      | "Cancelled"; // Capitalize the first letter of each word and cast to allowed types

    localSetActiveTab(index);
    setActiveTab(formattedLabel); // Update the active tab in the parent component
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tab Switcher */}
      <div className="w-fit flex items-center justify-center md:gap-3 bg-foreground p-1 md:p-4 rounded-md mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(index, tab.label)}
            className={`px-4 py-1 text-xs md:text-sm font-semibold ${
              activeTab === index
                ? "bg-background rounded-md border-white text-white"
                : "text-textAlt hover:text-white"
            } transition duration-300`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full p-4 border border-border rounded-lg bg-foreground">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;

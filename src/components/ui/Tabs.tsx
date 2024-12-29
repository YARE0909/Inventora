import React, { Dispatch, SetStateAction, ReactNode, useState } from "react";

interface Tab {
  label: string;
  content: ReactNode;
}

const Tabs = <T extends string>({
  tabs,
  setActiveTab,
}: {
  tabs: Tab[];
  setActiveTab: Dispatch<SetStateAction<T>>;
}) => {
  const [activeTab, localSetActiveTab] = useState(0);

  const handleTabChange = (index: number, label: string) => {
    // Format label based on input and cast to generic type T
    const formattedLabel = label as T;

    localSetActiveTab(index);
    setActiveTab(formattedLabel); // Update the active tab in the parent component
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tab Switcher */}
      <div className="w-fit flex items-center justify-center md:gap-3 bg-foreground border border-border p-1 md:p-3 rounded-md mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(index, tab.label)}
            className={`px-4 py-1 text-xs md:text-sm font-semibold ${activeTab === index
                ? "bg-background rounded-md border border-border"
                : "text-textAlt hover:text-text"
              } transition duration-300`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full p-4 border border-border rounded-md bg-foreground">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;

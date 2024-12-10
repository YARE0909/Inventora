import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggler: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    const lightTheme = {
      "--background": "#f5f5f5",
      "--foreground": "#e6e6e3",
      "--default-text": "#000000",
      "--border-color": "#d9d9d6",
      "--alt-text": "#4c4c54",
      "--highlight": "#d9d9d6",
    };

    const darkTheme = {
      "--background": "#0a0a0a",
      "--foreground": "#19191c",
      "--default-text": "#ffffff",
      "--border-color": "#262629",
      "--alt-text": "#b3b3ab",
      "--highlight": "#262629",
    };

    const themeVariables = theme === "light" ? lightTheme : darkTheme;

    for (const [key, value] of Object.entries(themeVariables)) {
      root.style.setProperty(key, value);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      onClick={toggleTheme}
      className="flex items-center justify-between w-20 h-10 p-1 rounded-full cursor-pointer bg-foreground"
      style={{
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        transition: "background-color 0.5s",
      }}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          theme === "light" ? "bg-highlight text-default-text" : "text-alt-text"
        }`}
      >
        <Sun className="w-5 h-5" />
      </div>
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${
          theme === "dark" ? "bg-highlight text-default-text" : "text-alt-text"
        }`}
      >
        <Moon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default ThemeToggler;

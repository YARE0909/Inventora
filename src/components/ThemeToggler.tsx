import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import Tooltip from "./ui/ToolTip";

const ThemeToggler: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark"); // Default to dark during SSR
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensure component is mounted before applying theme logic

    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "dark";
    setTheme(savedTheme);

    const root = document.documentElement;

    const lightTheme = {
      "--background": "#ffffff",
      "--backgroundAlt": "#f2f0ff",
      "--foreground": "#E3DFFD30",
      "--default-text": "#000000",
      "--border-color": "#d7d1fd",
      "--alt-text": "#4c4c54",
      "--highlight": "#d7d1fd",
      "--button": "#d7d1fd",
    };

    const darkTheme = {
      "--background": "#1a1a1c",
      "--backgroundAlt": "#151517",
      "--foreground": "#151517",
      "--default-text": "#ffffff",
      "--border-color": "#3b3b3b",
      "--alt-text": "#b3b3ab",
      "--highlight": "#262629",
      "--button": "#262629",
    };

    const themeVariables = savedTheme === "light" ? lightTheme : darkTheme;

    for (const [key, value] of Object.entries(themeVariables)) {
      root.style.setProperty(key, value);
    }

    localStorage.setItem("theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    const themeVariables =
      newTheme === "light"
        ? {
          "--background": "#ffffff",
          "--backgroundAlt": "#f2f0ff",
          "--foreground": "#E3DFFD30",
          "--default-text": "#000000",
          "--border-color": "#d7d1fd",
          "--alt-text": "#4c4c54",
          "--highlight": "#d7d1fd",
          "--button": "#d7d1fd",
        }
        : {
          "--background": "#1a1a1c",
          "--backgroundAlt": "#151517",
          "--foreground": "#151517",
          "--default-text": "#ffffff",
          "--border-color": "#3b3b3b",
          "--alt-text": "#b3b3ab",
          "--highlight": "#262629",
          "--button": "#262629",
        };

    for (const [key, value] of Object.entries(themeVariables)) {
      root.style.setProperty(key, value);
    }
  };

  if (!mounted) {
    // Avoid mismatched rendering during SSR
    return null;
  }

  return (
    <div
      onClick={toggleTheme}
      className={`flex items-center justify-between w-fit h-fit p-1 rounded-full cursor-pointer ${theme === "light" ? "bg-sky-600/10" : "bg-yellow-100/10"}`}>
      {theme !== "light" ? (
        <Tooltip tooltip="Light Mode" position="left">
          <Sun className="w-6 h-6 text-yellow-400" />
        </Tooltip>
      ) : (
        <Tooltip tooltip="Dark Mode" position="left">
          <Moon className="w-6 h-6 text-sky-700" />
        </Tooltip>
      )}
    </div>
  );
};

export default ThemeToggler;

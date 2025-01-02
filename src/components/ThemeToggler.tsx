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
      "--foreground": "#f5f5f5",
      "--default-text": "#000000",
      "--border-color": "#dbdbdb",
      "--alt-text": "#4c4c54",
      "--highlight": "#E6E7E7",
      "--button": "#659BF8",
    };

    const darkTheme = {
      "--background": "#1a1a1c",
      "--backgroundAlt": "#151517",
      "--foreground": "#151517",
      "--default-text": "#ffffff",
      "--border-color": "#2b2b2b",
      "--alt-text": "#DEDEDF",
      "--highlight": "#262629",
      "--button": "#4b51fa",
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
          "--foreground": "#f5f5f5",
          "--default-text": "#000000",
          "--border-color": "#dbdbdb",
          "--alt-text": "#4c4c54",
          "--highlight": "#E6E7E7",
          "--button": "#659BF8",
        }
        : {
          "--background": "#1a1a1c",
          "--backgroundAlt": "#151517",
          "--foreground": "#151517",
          "--default-text": "#ffffff",
          "--border-color": "#2b2b2b",
          "--alt-text": "#DEDEDF",
          "--highlight": "#262629",
          "--button": "#4b51fa",
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
      className={`flex items-center justify-between w-fit h-fit p-1 rounded-full cursor-pointer border-2 border-transparent duration-300 ${theme === "light" ? "bg-sky-600/10 hover:border-sky-700 hover:bg-transparent" : "bg-yellow-100/10 hover:border-yellow-400 hover:bg-transparent"}`}>
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

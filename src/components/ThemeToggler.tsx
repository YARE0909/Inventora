import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

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
      "--background": "#e5e5e3",
      "--foreground": "#eaeae8",
      "--default-text": "#000000",
      "--border-color": "#c4c4c4",
      "--alt-text": "#4c4c54",
      "--highlight": "#D5D2F6",
    };

    const darkTheme = {
      "--background": "#1a1a1c",
      "--foreground": "#151517",
      "--default-text": "#ffffff",
      "--border-color": "#3b3b3b",
      "--alt-text": "#b3b3ab",
      "--highlight": "#262629",
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
          "--background": "#e5e5e3",
          "--foreground": "#eaeae8",
          "--default-text": "#000000",
          "--border-color": "#c4c4c4",
          "--alt-text": "#4c4c54",
          "--highlight": "#D5D2F6",
        }
        : {
          "--background": "#1a1a1c",
          "--foreground": "#151517",
          "--default-text": "#ffffff",
          "--border-color": "#3b3b3b",
          "--alt-text": "#b3b3ab",
          "--highlight": "#262629",
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
      className="flex items-center justify-between w-fit h-fit p-1 rounded-full cursor-pointer bg-foreground"
      style={{
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        transition: "background-color 0.5s",
      }}
    >
      {theme === "light" ? (
        <Sun className="w-6 h-6 text-textAlt" />
      ) : (
        <Moon className="w-6 h-6 text-textAlt" />
      )}
    </div>
  );
};

export default ThemeToggler;

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
      "--background": "#ffffff",
      "--foreground": "#fafafa",
      "--default-text": "#000000",
      "--border-color": "#d9d9d6",
      "--alt-text": "#4c4c54",
      "--highlight": "#f5f5f5",
    };

    const darkTheme = {
      "--background": "#0a0a0a",
      "--foreground": "#19191c",
      "--default-text": "#ffffff",
      "--border-color": "#262629",
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
          "--background": "#ffffff",
          "--foreground": "#fafafa",
          "--default-text": "#000000",
          "--border-color": "#d9d9d6",
          "--alt-text": "#4c4c54",
          "--highlight": "#f5f5f5",
        }
        : {
          "--background": "#0a0a0a",
          "--foreground": "#19191c",
          "--default-text": "#ffffff",
          "--border-color": "#262629",
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

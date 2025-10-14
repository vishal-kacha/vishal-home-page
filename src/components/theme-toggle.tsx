import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function Theme() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vishal-home-page") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", darkMode);
      localStorage.setItem("vishal-home-page", darkMode ? "dark" : "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed bottom-8 right-8 p-3 rounded-full dark:bg-zinc-200 bg-zinc-800  text-zinc-200  dark:text-zinc-800 shadow-lg focus:outline-none cursor-pointer"
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

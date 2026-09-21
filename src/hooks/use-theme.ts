import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    
    // @ts-ignore - View Transitions API
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const className = newTheme === "dark" ? "transition-to-dark" : "transition-to-light";
    document.documentElement.classList.add(className);

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove(className);
    });
  };

  return {
    theme,
    toggle,
    setTheme,
  };
}

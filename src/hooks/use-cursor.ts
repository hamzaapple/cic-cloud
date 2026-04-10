import { useState, useEffect } from "react";

const CURSOR_KEY = "cic_cursor_enabled";

export const useCursorToggle = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(CURSOR_KEY) !== "false");

  useEffect(() => {
    localStorage.setItem(CURSOR_KEY, String(enabled));
    // Toggle the CSS that hides the default cursor
    if (enabled) {
      document.documentElement.classList.add("custom-cursor-active");
    } else {
      document.documentElement.classList.remove("custom-cursor-active");
    }
  }, [enabled]);

  const toggle = () => setEnabled(p => !p);

  return { cursorEnabled: enabled, toggleCursor: toggle };
};

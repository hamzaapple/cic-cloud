import { useEffect, useState } from "react";
import { getStoredYear, onYearChange, setStoredYear, clearStoredYear } from "@/lib/year-context";

/** Reactive access to the visitor's saved academic year. */
export const useYear = () => {
  const [year, setYear] = useState<string | null>(() => getStoredYear());

  useEffect(() => onYearChange(setYear), []);

  return {
    year,
    setYear: (y: string) => setStoredYear(y),
    clearYear: () => clearStoredYear(),
  };
};

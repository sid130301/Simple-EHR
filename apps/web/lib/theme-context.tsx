"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ehr.theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextIsDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
  }, []);

  function toggleTheme() {
    setIsDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("ehr.theme", next ? "dark" : "light");
      return next;
    });
  }

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }

  return context;
}

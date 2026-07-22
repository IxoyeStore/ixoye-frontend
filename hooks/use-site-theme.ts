"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "site-theme";

export function useSiteTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem(THEME_KEY) === "dark");
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggleTheme };
}

"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "site-theme";

export function useSiteTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(localStorage.getItem(THEME_KEY) === "dark");
  }, []);

  // html/body live outside the per-route wrapper div, so their own
  // bg-background (declared in globals.css) never sees the nested
  // .dark class. Toggle it on <html> too so the real page background
  // (visible on overscroll, margins, etc.) follows the theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggleTheme };
}

"use client";

import { Sun, Moon } from "lucide-react";

export function AdminThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

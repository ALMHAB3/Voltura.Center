"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // Ignore blocked storage.
    }
  }
  return (
    <button type="button" onClick={toggle} aria-label="تبديل الوضع الداكن" className={className}>
      <Moon size={20} className="dark:hidden" aria-hidden />
      <Sun size={20} className="hidden dark:block" aria-hidden />
    </button>
  );
}

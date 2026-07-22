"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useSiteTheme } from "@/hooks/use-site-theme";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, toggleTheme } = useSiteTheme();

  return (
    <div className={isDark ? "dark" : ""}>
      <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
      <main className="bg-white dark:bg-slate-900">{children}</main>
      <Footer />
    </div>
  );
}

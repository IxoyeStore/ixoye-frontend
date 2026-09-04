"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteTheme } from "@/hooks/use-site-theme";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark } = useSiteTheme();

  return (
    <div className={`${isDark ? "dark" : ""} text-foreground`}>
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/50 dark:bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/50 dark:bg-blue-500/10 blur-3xl" />

        {/* HOME */}
        <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        {/* AUTH */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
          {children}
        </div>
      </div>
    </div>
  );
}

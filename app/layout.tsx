import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";
import { Toaster } from "sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ixoye",
  description: "Refacciones Diesel y Agricola Ixoye",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script
          src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://openpay.s3.amazonaws.com/openpay.v1.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://openpay.s3.amazonaws.com/openpay-data.v1.min.js"
          strategy="beforeInteractive"
        />
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "group relative flex w-full items-stretch bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[60px] shadow-2xl transition-all duration-300",
              content: "p-4 flex flex-col justify-center",
              title:
                "text-[11px] font-bold uppercase tracking-widest text-sky-950 leading-none mb-1 italic",
              description:
                "text-[10px] font-medium text-slate-500 uppercase tracking-tighter leading-none opacity-70",

              success: [
                "before:content-[''] before:w-2 before:bg-emerald-500",
                "shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)]",
              ].join(" "),

              error: [
                "before:content-[''] before:w-2 before:bg-red-600",
                "shadow-[0_10px_40px_-10px_rgba(220,38,38,0.25)]",
              ].join(" "),

              info: [
                "before:content-[''] before:w-2 before:bg-sky-500",
                "shadow-[0_10px_40px_-10px_rgba(14,165,233,0.25)]",
              ].join(" "),
            },
          }}
          icons={{
            success: <div />,
            error: <div />,
            info: <div />,
            warning: <div />,
            loading: <div />,
          }}
        />
      </body>
    </html>
  );
}

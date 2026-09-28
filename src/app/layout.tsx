import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleTasks - Task Manager",
  description: "A simple task management web application built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

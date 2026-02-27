import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RETRONET v2.1 - Online Information System",
  description: "A DOS-like retro terminal web experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black overflow-hidden">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YU Travel ERP",
  description: "YU Travel reservation and operation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import TopMenu from "@/components/TopMenu";

export const metadata: Metadata = {
  title: "YU Travel ERP",
  description: "Incoming Agency Reservation & Operation System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <TopMenu />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}

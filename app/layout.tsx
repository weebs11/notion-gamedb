import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameDB - Notion Game Backlog",
  description: "Search games and add them to your Notion backlog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

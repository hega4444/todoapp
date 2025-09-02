import type { Metadata } from "next";
import "./globals.css";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { ConnectionBadge } from "@/components/ConnectionBadge";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConnectionProvider>
          {children}
          <ConnectionBadge />
        </ConnectionProvider>
      </body>
    </html>
  );
}

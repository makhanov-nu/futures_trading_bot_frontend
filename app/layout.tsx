import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from "@/context/WebSocketContext";

export const metadata: Metadata = {
  title: "AQQYL Dashboard",
  description: "AI-powered crypto paper trading dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        <WebSocketProvider>{children}</WebSocketProvider>
      </body>
    </html>
  );
}

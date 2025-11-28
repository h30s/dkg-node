import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeritasOS - Decentralized Reputation Layer",
  description: "Decentralized reputation oracle for trusted AI agents. Built on OriginTrail DKG Node.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

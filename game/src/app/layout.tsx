import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founding of Rome - Complete Edition",
  description: "Build an empire from the seven hills. A turn-based Roman empire simulation game.",
  keywords: ["Rome", "Empire", "Strategy", "Simulation", "Turn-based", "Game"],
  authors: [{ name: "Rome.Life" }],
  openGraph: {
    title: "Founding of Rome - Complete Edition",
    description: "Build an empire from the seven hills. Conquer, trade, and lead Rome to eternal glory.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-bg text-ink min-h-screen">
        {children}
        <a
          href="https://www.vecteezy.com/free-vector/isometric-rome"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-1 right-2 text-[10px] text-white/30 hover:text-white/50 transition-colors z-50"
        >
          Isometric Rome Vectors by Vecteezy
        </a>
      </body>
    </html>
  );
}

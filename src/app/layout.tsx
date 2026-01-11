import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

const openSans = Open_Sans({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pheydrus Tools - Astrology, Numerology, Feng Shui",
  description: "Pheydrus Tools for Astrology, Numerology and Feng Shui",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={openSans.className}>
        <>
          <nav className="text-center text-xs bg-cyan-50 dark:bg-cyan-800 flex flex-row justify-center p-1 ">
            <p className="my-auto"> Pheydrus Tools </p>
          </nav>
          <div className="w-full m-auto p-4 min-h-screen">{children}</div>
        </>
      </body>
      <GoogleAnalytics gaId="G-S4DN9BVZ37" />
    </html>
  );
}

import type { Metadata } from "next";
import { Space_Grotesk, Orbitron } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { UserStatusCompact } from "@/components/Navbar";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proof Somnia DApp",
  description: "Decentralized education platform with blockchain-verified certificates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${orbitron.variable} ${jetbrainsMono.variable} antialiased bg-[#4B5320] font-sans`}
      >
        <Providers>
          <UserStatusCompact/>
          {children}
        </Providers>
      </body>
    </html>
  );
}
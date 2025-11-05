import type { Metadata } from "next";
import { Space_Grotesk, Orbitron } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { UserStatusCompact } from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import { ConfigProvider } from "antd";


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
  title: "Proof Somnia",
  description: "Decentralized education platform with blockchain-verified certificates on somnia network.",
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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#3D441A',
              color: '#FFFDD0',
              borderRadius: '8px',
              fontSize: '14px',
              padding: '12px 16px',
              border: '2px solid #FFFDD0',
            },
            success: {
              duration: 3000,
              style: {
                background: '#4B5320', 
                color: '#FFFDD0',
                border: '2px solid #FFFDD0',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#3D441A', 
                color: '#FFFDD0',
                border: '2px solid #FFFDD0',
              },
            },
            loading: {
              style: {
                background: '#3D441A',
                color: '#FFFDD0',
                border: '2px solid #FFFDD0',
              },
            },
          }}
        />
        <ConfigProvider
          theme={{
        token: {
          colorPrimary: '#3D441A', 
          // colorPrimaryHover: '#14532d',
          // colorPrimaryActive: '#0f3d22',
        },
      }}
        >

        <Providers>
          <UserStatusCompact />
          {children}
        </Providers>

        </ConfigProvider>
      </body>
    </html>
  );
}
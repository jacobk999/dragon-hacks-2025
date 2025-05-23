import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import GradientBackground from "~/public/background.png";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-space-mono",
  weight: "400",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Schedulino",
  description: "Schedulino automatically generates all conflict-free timetables that meet a student’s preferences, and presents them in a clear, color-coded weekly view",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${dmMono.variable} antialiased h-screen relative`}
      >
        <div className="absolute inset-0 -z-5">
          <Image src={GradientBackground} alt="background" fill />
        </div>
        {children}
      </body>
    </html>
  );
}

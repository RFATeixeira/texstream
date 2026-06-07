import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Texstream",
  description: "Webapp do Texstream com deck virtual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={comfortaa.variable}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

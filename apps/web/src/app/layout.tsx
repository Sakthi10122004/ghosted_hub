import type { Metadata } from "next";
import { Inter, Outfit, Lora } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: "Ghosted Hub | The operating system for the Ghosted program",
  description: "Project Lifecycle Management Platform for Tech4Good Community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${lora.variable} antialiased min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

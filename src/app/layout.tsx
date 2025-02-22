import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { keywords } from "../../keywords";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://caimax.co.ke"), 
  title: "Caimax Properties",
  description: "Caimax Properties is a real estate listings company that brings home closer to you.",
  twitter:{
    card: "summary_large_image"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: "index, follow",
  authors: [{ name: "Caimax Properties" }],
  keywords: keywords,
  openGraph: {
    title: "Caimax Properties - Defined by Service and Expertise",
    description: "Browse the best real estate listings and properties for sale or rent",
    url: "https://caimax.co.ke",
    siteName: "Caimax Properties",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Caimax Properties",
      },
    ],
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon and other icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Providers>
            <Header />
            <main className="container mx-auto px-4 max-w-6xl flex-grow">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}

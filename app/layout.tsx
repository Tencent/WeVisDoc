import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://tencent.github.io/WeVisDoc";
const basePath = process.env.PAGES_BASE_PATH ?? "";
const title =
  "WeVisDoc: From Coverage to Capability for Robust End-to-End Document Parsing";
const description =
  "Document parsing converts document images into structured content and requires reliable performance across diverse layouts and acquisition conditions.";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: `${basePath}/wechat-icon.png`,
    shortcut: `${basePath}/wechat-icon.png`,
    apple: `${basePath}/wechat-icon.png`,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1731,
        height: 909,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@mysten/dapp-kit/dist/index.css";
import ClientProviders from "./components/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suilend | SEND Season 2 Airdrop",
  description: "Claim your allocated SEND.",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  icons: {
    icon: "/android-chrome-384x384.png",
  },
  openGraph: {
    description: "Claim your allocated SEND.",
    type: "website",
    title: "Suilend | SEND Season 2 Airdrop",
    images: [
      {
        url: "https://i.imgur.com/m7KPM4B.png",
        width: 1200,
        height: 675,
        alt: "Suilend Airdrop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@suilendprotocol",
    images: ["https://i.imgur.com/m7KPM4B.png"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

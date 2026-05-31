import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXORA | Cloud-Native SIEM Platform",
  description:
    "Real-time endpoint threat monitoring. Collect Windows event telemetry, stream logs into Elasticsearch, correlate suspicious activity, and visualize attacks through a SOC-style dashboard.",
  keywords: ["SIEM", "endpoint security", "threat detection", "Elasticsearch", "SOC"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Material Symbols icon font — not available via next/font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

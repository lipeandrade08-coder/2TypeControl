import type { Metadata } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = (
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000"
  )
    .split(",")[0]
    .trim();
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    .trim();
  const localHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  const protocol =
    localHost && forwardedProtocol !== "https" ? "http" : "https";

  let metadataBase: URL;
  try {
    metadataBase = new URL(`${protocol}://${host}`);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }

  return {
    metadataBase,
    title: "2Type Control — Central do restaurante",
    description: "Pedidos, WhatsApp, entregas e mesas em uma única central.",
    openGraph: {
      title: "2Type Control — Central do restaurante",
      description: "Operação fluida. Controle total.",
      type: "website",
      images: [
        {
          url: new URL("/og.png", metadataBase).href,
          width: 1536,
          height: 1024,
          alt: "2Type Control — Operação fluida. Controle total.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "2Type Control — Central do restaurante",
      description: "Operação fluida. Controle total.",
      images: [new URL("/og.png", metadataBase).href],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

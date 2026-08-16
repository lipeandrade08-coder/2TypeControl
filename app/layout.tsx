import type { Metadata } from "next";
import { headers } from "next/headers";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";


const outfit = Outfit({
  variable: "--font-outfit",
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('2type-theme');
                var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${outfit.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="2type-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config/site";
import { ToastsProvider } from "@/components/ui/Toasts";
import { PHProvider } from "@/components/analytics/PHProvider";
import { CookieConsent } from "@/components/marketing/CookieConsent";
import { PaddleInit } from "@/components/payments/PaddleInit";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-family",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: { default: SITE.name, template: `%s \u2014 ${SITE.name}` },
  description: SITE.tagline,
  openGraph: { type: "website", siteName: SITE.name },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.tagline,
  },
  icons: { icon: SITE.faviconPath, apple: SITE.faviconPath },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable} dark`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-foreground focus:text-background focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="lazyOnload" />
        <PaddleInit />
        <PHProvider />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <ToastsProvider>
            {children}
            <Toaster
              position="bottom-right"
              visibleToasts={3}
              duration={4000}
              toastOptions={{
                classNames: {
                  toast: "rounded-md font-sans text-sm border border-border shadow-lg",
                  success: "border-l-4 border-l-green-500",
                  error: "border-l-4 border-l-destructive",
                  info: "border-l-4 border-l-primary",
                },
              }}
              className="!bottom-4 sm:!right-4 max-sm:!left-1/2 max-sm:!-translate-x-1/2 max-sm:!right-auto"
            />
          </ToastsProvider>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}

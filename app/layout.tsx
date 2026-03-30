import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Inter, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/config/site";
import { ToastsProvider } from "@/components/ui/Toasts";
import { PHProvider } from "@/components/analytics/PHProvider";
import { CookieConsent } from "@/components/marketing/CookieConsent";

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
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
  openGraph: { type: "website", siteName: SITE.name },
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
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
        >
          Skip to main content
        </a>
        <PHProvider />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ToastsProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: "rounded-md font-sans text-sm border border-border shadow-lg",
                  success: "border-l-4 border-l-green-500",
                  error: "border-l-4 border-l-destructive",
                },
              }}
            />
          </ToastsProvider>
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}

export const revalidate = 3600; // 1 hour — marketing pages change infrequently
import { SITE } from "@/lib/config/site";
import { HomeContent } from "./home-content";

export const metadata = {
  title: SITE.name,
  description: "The ERP built for growing businesses. Invoicing, inventory, HR, CRM — with AI built in.",
  openGraph: {
    title: SITE.name,
    description: "The ERP built for growing businesses. Invoicing, inventory, HR, CRM — with AI built in.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Westbridge",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Enterprise resource planning for growing businesses",
  offers: {
    "@type": "Offer",
    price: "49.99",
    priceCurrency: "USD",
  },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeContent />
    </>
  );
}

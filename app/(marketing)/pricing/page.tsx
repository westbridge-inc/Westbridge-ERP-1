export const revalidate = 3600; // 1 hour -- marketing pages change infrequently
import { PricingContent } from "./pricing-content";

export const metadata = {
  title: "Pricing | Westbridge",
  description: "Simple, transparent pricing. Pick the plan that fits your business. Start with a 14-day free trial.",
  openGraph: {
    title: "Pricing | Westbridge",
    description: "Simple, transparent pricing. Pick the plan that fits your business. Start with a 14-day free trial.",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}

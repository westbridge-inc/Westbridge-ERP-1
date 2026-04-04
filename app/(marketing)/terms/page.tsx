export const revalidate = 3600;

import { TermsContent } from "./_components/TermsContent";

export const metadata = {
  title: "Terms of Service | Westbridge",
  description:
    "Terms of Service for Westbridge ERP. Read our terms governing use of the platform, billing, data processing, and more.",
  openGraph: {
    title: "Terms of Service | Westbridge",
    description:
      "Terms of Service for Westbridge ERP. Read our terms governing use of the platform, billing, data processing, and more.",
  },
};

export default function TermsPage() {
  return <TermsContent />;
}

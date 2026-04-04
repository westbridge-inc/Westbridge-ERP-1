export const revalidate = 3600;

import { PrivacyContent } from "./_components/PrivacyContent";

export const metadata = {
  title: "Privacy Policy | Westbridge",
  description:
    "How Westbridge Inc. collects, uses, stores, and protects your personal information when you use Westbridge ERP.",
  openGraph: {
    title: "Privacy Policy | Westbridge",
    description:
      "How Westbridge Inc. collects, uses, stores, and protects your personal information when you use Westbridge ERP.",
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}

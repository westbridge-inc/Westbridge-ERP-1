export const revalidate = 3600;

import { RefundPolicyContent } from "./_components/RefundPolicyContent";

export const metadata = {
  title: "Refund Policy | Westbridge",
  description:
    "Westbridge ERP refund policy: 14-day money-back guarantee, refund eligibility, processing times, and consumer rights.",
  openGraph: {
    title: "Refund Policy | Westbridge",
    description:
      "Westbridge ERP refund policy: 14-day money-back guarantee, refund eligibility, processing times, and consumer rights.",
  },
};

export default function RefundPolicyPage() {
  return <RefundPolicyContent />;
}

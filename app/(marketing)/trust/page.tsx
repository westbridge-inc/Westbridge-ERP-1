export const revalidate = 3600;

import { TrustContent } from "./_components/TrustContent";

export const metadata = {
  title: "Trust & Security | Westbridge",
  description:
    "How Westbridge protects your data: encryption, tenant isolation, audit logging, sub-processors, security policies, and the path to SOC 2 attestation.",
  openGraph: {
    title: "Trust & Security | Westbridge",
    description: "Security, compliance, and the controls Westbridge has in place to protect customer data.",
  },
};

export default function TrustPage() {
  return <TrustContent />;
}

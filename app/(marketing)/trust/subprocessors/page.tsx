export const revalidate = 3600;

import { SubprocessorsContent } from "./_components/SubprocessorsContent";

export const metadata = {
  title: "Sub-processors | Trust & Security | Westbridge",
  description:
    "The complete list of sub-processors that Westbridge uses to deliver its ERP service, including the data each one processes and the region they operate in.",
  openGraph: {
    title: "Sub-processors | Trust & Security | Westbridge",
    description: "Westbridge sub-processor list — required by GDPR Art. 28 and our DPA.",
  },
};

export default function SubprocessorsPage() {
  return <SubprocessorsContent />;
}

export const revalidate = 3600;

import { DPAContent } from "./_components/DPAContent";

export const metadata = {
  title: "Data Processing Agreement | Westbridge",
  description:
    "Westbridge ERP Data Processing Agreement (DPA): controller / processor roles, security measures, sub-processors, international transfers, audit rights, and breach notification under GDPR Art. 28.",
  openGraph: {
    title: "Data Processing Agreement | Westbridge",
    description: "Westbridge ERP Data Processing Agreement (DPA) for B2B customers under GDPR Art. 28.",
  },
};

export default function DPAPage() {
  return <DPAContent />;
}

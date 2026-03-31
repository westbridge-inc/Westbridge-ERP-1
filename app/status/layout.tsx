import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Westbridge Status",
  description: "Real-time system status for Westbridge platform services.",
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0a] text-white">{children}</div>;
}

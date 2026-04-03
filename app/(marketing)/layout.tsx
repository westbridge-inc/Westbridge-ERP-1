import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

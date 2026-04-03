export const revalidate = 3600; // 1 hour -- marketing pages change infrequently
import ModulesContent from "./modules-content";

export const metadata = {
  title: "Modules | Westbridge",
  description: "7 module bundles. 38 modules. One platform. Every bundle includes AI-powered insights.",
  openGraph: {
    title: "Modules | Westbridge",
    description: "7 module bundles. 38 modules. One platform. Every bundle includes AI-powered insights.",
  },
};

export default function ModulesPage() {
  return <ModulesContent />;
}

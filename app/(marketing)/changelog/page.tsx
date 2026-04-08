export const revalidate = 3600; // 1 hour -- marketing pages change infrequently
import Link from "next/link";
import { ROUTES } from "@/lib/config/site";

export const metadata = {
  title: "Changelog | Westbridge",
  description: "What's new in Westbridge. Release notes, new features, and platform improvements.",
  openGraph: {
    title: "Changelog | Westbridge",
    description: "What's new in Westbridge. Release notes, new features, and platform improvements.",
  },
};

const RELEASES = [
  {
    date: "March 2026",
    title: "Initial Launch",
    items: [
      "Full ERP platform with 38 modules across 7 bundles",
      "AI-powered assistant (Bridge) for data analysis",
      "OIDC single sign-on and TOTP two-factor authentication",
      "Paddle payment integration with 14-day free trial",
      "Real-time status page at status.westbridgetoday.com",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Changelog</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        What&apos;s New
      </h1>
      <p className="mt-3 text-base text-muted-foreground">Release notes and platform updates.</p>

      <div className="mt-12 space-y-12">
        {RELEASES.map((release) => (
          <section key={release.title} className="border-l-2 border-border pl-6">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{release.date}</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{release.title}</h2>
            <ul className="mt-4 space-y-2">
              {release.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-border/60 pt-8">
        <p className="text-sm text-muted-foreground">
          <Link href={ROUTES.home} className="text-foreground transition-colors hover:opacity-80">
            Back to home
          </Link>
          {" · "}
          <Link href={ROUTES.modules} className="text-foreground transition-colors hover:opacity-80">
            Modules
          </Link>
          {" · "}
          <Link href={ROUTES.pricing} className="text-foreground transition-colors hover:opacity-80">
            Pricing
          </Link>
        </p>
      </div>
    </div>
  );
}

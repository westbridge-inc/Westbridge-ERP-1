import Link from "next/link";
import { SITE, ROUTES } from "@/lib/config/site";
import { Logo } from "@/components/brand/Logo";

const productLinks = [
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.modules, label: "Modules" },
  { href: ROUTES.changelog, label: "Changelog" },
];

const companyLinks = [
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.docs, label: "Docs" },
  { href: "/status", label: "Status" },
];

const legalLinks = [
  { href: ROUTES.privacy, label: "Privacy" },
  { href: ROUTES.terms, label: "Terms" },
  { href: ROUTES.refundPolicy, label: "Refund Policy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo variant="full" size="sm" className="text-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">The enterprise ERP for growing businesses.</p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Product</p>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Company</p>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Legal</p>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-8 border-t border-border pt-8 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE.name} {SITE.legal}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

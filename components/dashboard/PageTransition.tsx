"use client";

/**
 * Subtle CSS-only opacity fade for page transitions.
 * No framer-motion — keeps the bundle small and follows reduced-motion preferences
 * via the global `prefers-reduced-motion` rule in globals.css.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-[pageIn_200ms_ease-out_both]">{children}</div>;
}

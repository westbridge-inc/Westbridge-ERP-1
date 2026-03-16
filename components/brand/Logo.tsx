import Link from "next/link";

interface LogoProps {
  variant?: "full" | "mark" | "text";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const textSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export function Logo({ variant = "full", className = "", size = "md" }: LogoProps) {
  if (variant === "mark" || variant === "text") {
    return (
      <span className={`font-semibold tracking-[0.2em] font-display uppercase ${textSizes[size]} ${className}`}>
        WESTBRIDGE
      </span>
    );
  }

  return (
    <span className={`font-semibold tracking-[0.2em] font-display uppercase ${textSizes[size]} ${className}`}>
      WESTBRIDGE
    </span>
  );
}

export function LogoLink({ variant = "full", size = "md", className = "" }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex ${className}`}>
      <Logo variant={variant} size={size} />
    </Link>
  );
}

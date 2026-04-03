"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Eye, EyeOff, Check, Circle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { ROUTES, TRIAL } from "@/lib/config/site";

export interface SignupStep1Props {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onNext: () => void;
}

interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(pw: string): PasswordCheck[] {
  return [
    { label: "At least 10 characters", met: pw.length >= 10 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pw) },
    { label: "One lowercase letter", met: /[a-z]/.test(pw) },
    { label: "One number", met: /[0-9]/.test(pw) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(pw) },
  ];
}

export function SignupStep1({ name, setName, email, setEmail, password, setPassword, onNext }: SignupStep1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const validateEmail = useCallback((value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }, []);

  const checks = getPasswordChecks(password);
  const allChecksMet = checks.every((c) => c.met);
  const emailValid = validateEmail(email);
  const formValid = name.trim().length > 0 && emailValid && allChecksMet && termsAccepted;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    // Just validate locally — actual signup API call happens in Step 3
    onNext();
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start your {TRIAL.days}-day free trial. No credit card required.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full name</Label>
          <Input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            autoFocus
            autoComplete="name"
          />
        </div>

        {/* Work email */}
        <div className="space-y-2">
          <Label htmlFor="signup-email">Work email</Label>
          <Input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="jane@acmecorp.com"
            autoComplete="email"
          />
          {emailTouched && email.trim() && !emailValid && (
            <p className="text-sm text-destructive" role="alert">
              Enter a valid email address
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  {c.met ? (
                    <Check className="h-3.5 w-3.5 text-foreground" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
                  <span className={c.met ? "text-foreground" : "text-muted-foreground/40"}>{c.label}</span>
                </li>
              ))}
              {allChecksMet && (
                <li className="mt-1 text-xs text-foreground font-medium">Password meets all requirements</li>
              )}
            </ul>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="signup-terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-sm border border-primary accent-foreground"
          />
          <label htmlFor="signup-terms" className="cursor-pointer text-sm text-muted-foreground leading-snug">
            I agree to the{" "}
            <Link
              href={ROUTES.terms}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href={ROUTES.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Errors will be shown in Step 3 when the API is called */}

        {/* Submit */}
        <Button variant="default" size="lg" type="submit" disabled={!formValid} className="w-full h-11">
          Continue
        </Button>
      </form>
    </div>
  );
}

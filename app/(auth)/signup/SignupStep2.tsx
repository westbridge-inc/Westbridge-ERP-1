"use client";

import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface SignupStep2Props {
  company: string;
  setCompany: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  companySize: string;
  setCompanySize: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  currency: string;
  setCurrency: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const INDUSTRIES = [
  "Accounting & Finance",
  "Agriculture",
  "Automotive",
  "Construction",
  "Consulting",
  "Education",
  "Energy & Utilities",
  "Engineering",
  "Food & Beverage",
  "Government",
  "Healthcare",
  "Hospitality & Tourism",
  "Information Technology",
  "Insurance",
  "Legal",
  "Logistics & Transportation",
  "Manufacturing",
  "Media & Entertainment",
  "Mining",
  "Non-Profit",
  "Pharmaceutical",
  "Real Estate",
  "Retail & E-commerce",
  "Telecommunications",
  "Other",
];

const COUNTRIES = [
  "Afghanistan",
  "Argentina",
  "Australia",
  "Austria",
  "Bahamas",
  "Bangladesh",
  "Barbados",
  "Belgium",
  "Belize",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guyana",
  "Haiti",
  "Honduras",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Trinidad and Tobago",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Venezuela",
  "Vietnam",
];

const COMPANY_SIZES = [
  "Just me (1)",
  "2-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const TIMEZONES = [
  "Pacific/Honolulu (HST, UTC-10)",
  "America/Anchorage (AKST, UTC-9)",
  "America/Los_Angeles (PST, UTC-8)",
  "America/Denver (MST, UTC-7)",
  "America/Chicago (CST, UTC-6)",
  "America/New_York (EST, UTC-5)",
  "America/Guyana (GYT, UTC-4)",
  "America/Halifax (AST, UTC-4)",
  "America/Sao_Paulo (BRT, UTC-3)",
  "Atlantic/South_Georgia (GST, UTC-2)",
  "Atlantic/Azores (AZOT, UTC-1)",
  "Europe/London (GMT, UTC+0)",
  "Europe/Paris (CET, UTC+1)",
  "Europe/Helsinki (EET, UTC+2)",
  "Europe/Moscow (MSK, UTC+3)",
  "Asia/Dubai (GST, UTC+4)",
  "Asia/Kolkata (IST, UTC+5:30)",
  "Asia/Dhaka (BST, UTC+6)",
  "Asia/Bangkok (ICT, UTC+7)",
  "Asia/Singapore (SGT, UTC+8)",
  "Asia/Tokyo (JST, UTC+9)",
  "Australia/Sydney (AEST, UTC+10)",
  "Pacific/Auckland (NZST, UTC+12)",
];

const CURRENCIES = [
  { code: "USD", label: "USD - US Dollar" },
  { code: "EUR", label: "EUR - Euro" },
  { code: "GBP", label: "GBP - British Pound" },
  { code: "CAD", label: "CAD - Canadian Dollar" },
  { code: "AUD", label: "AUD - Australian Dollar" },
  { code: "GYD", label: "GYD - Guyanese Dollar" },
  { code: "TTD", label: "TTD - Trinidad & Tobago Dollar" },
  { code: "INR", label: "INR - Indian Rupee" },
  { code: "SGD", label: "SGD - Singapore Dollar" },
  { code: "JPY", label: "JPY - Japanese Yen" },
  { code: "CNY", label: "CNY - Chinese Yuan" },
  { code: "KRW", label: "KRW - South Korean Won" },
  { code: "BRL", label: "BRL - Brazilian Real" },
  { code: "MXN", label: "MXN - Mexican Peso" },
  { code: "ZAR", label: "ZAR - South African Rand" },
  { code: "CHF", label: "CHF - Swiss Franc" },
  { code: "SEK", label: "SEK - Swedish Krona" },
  { code: "NZD", label: "NZD - New Zealand Dollar" },
  { code: "AED", label: "AED - UAE Dirham" },
  { code: "PHP", label: "PHP - Philippine Peso" },
];

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  Canada: "CAD",
  Australia: "AUD",
  "New Zealand": "NZD",
  Guyana: "GYD",
  "Trinidad and Tobago": "TTD",
  India: "INR",
  Singapore: "SGD",
  Japan: "JPY",
  China: "CNY",
  "South Korea": "KRW",
  Brazil: "BRL",
  Mexico: "MXN",
  "South Africa": "ZAR",
  Switzerland: "CHF",
  Sweden: "SEK",
  "United Arab Emirates": "AED",
  Philippines: "PHP",
  France: "EUR",
  Germany: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  Netherlands: "EUR",
  Belgium: "EUR",
  Austria: "EUR",
  Finland: "EUR",
  Ireland: "EUR",
  Portugal: "EUR",
  Greece: "EUR",
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function detectCountry(): string {
  if (typeof navigator === "undefined") return "United States";
  const lang = navigator.language || "";
  const region = lang.split("-")[1]?.toUpperCase();
  const regionMap: Record<string, string> = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    IN: "India",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    BR: "Brazil",
    MX: "Mexico",
    GY: "Guyana",
    TT: "Trinidad and Tobago",
    SG: "Singapore",
    NZ: "New Zealand",
  };
  return region ? (regionMap[region] ?? "United States") : "United States";
}

function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = TIMEZONES.find((t) => t.startsWith(tz));
    return match ?? TIMEZONES.find((t) => t.startsWith("America/New_York")) ?? TIMEZONES[5];
  } catch {
    return TIMEZONES[5];
  }
}

export function SignupStep2({
  company,
  setCompany,
  industry,
  setIndustry,
  country,
  setCountry,
  companySize,
  setCompanySize,
  timezone,
  setTimezone,
  currency,
  setCurrency,
  onBack,
  onNext,
}: SignupStep2Props) {
  // Set defaults on mount
  useEffect(() => {
    if (!country) {
      const detected = detectCountry();
      setCountry(detected);
      if (!currency) {
        setCurrency(COUNTRY_CURRENCY_MAP[detected] ?? "USD");
      }
    }
    if (!companySize) setCompanySize("2-10 employees");
    if (!timezone) setTimezone(detectTimezone());
    if (!currency && country) {
      setCurrency(COUNTRY_CURRENCY_MAP[country] ?? "USD");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update currency when country changes
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const mapped = COUNTRY_CURRENCY_MAP[newCountry];
    if (mapped) setCurrency(mapped);
  };

  const canContinue = company.trim().length > 0 && industry && country && companySize && timezone && currency;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinue) onNext();
  };

  const handleSkip = () => {
    if (!company.trim()) return;
    onNext();
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-foreground">Tell us about your business</h1>
      <p className="mt-2 text-sm text-muted-foreground">This helps us set up your workspace.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {/* Company name */}
        <div className="space-y-2">
          <Label htmlFor="signup-company">
            Company name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signup-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your company or organization name"
            autoFocus
            autoComplete="organization"
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label htmlFor="signup-industry">
            Industry <span className="text-destructive">*</span>
          </Label>
          <select
            id="signup-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select your industry</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="signup-country">
            Country <span className="text-destructive">*</span>
          </Label>
          <select
            id="signup-country"
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Company size */}
        <div className="space-y-2">
          <Label htmlFor="signup-company-size">
            Company size <span className="text-destructive">*</span>
          </Label>
          <select
            id="signup-company-size"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select company size</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="signup-timezone">
            Timezone <span className="text-destructive">*</span>
          </Label>
          <select
            id="signup-timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select your timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Default currency */}
        <div className="space-y-2">
          <Label htmlFor="signup-currency">
            Default currency <span className="text-destructive">*</span>
          </Label>
          <select
            id="signup-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={selectClassName}
          >
            <option value="">Select currency</option>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button type="button" variant="ghost" size="default" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button type="submit" variant="default" size="default" disabled={!canContinue}>
            Continue
          </Button>
        </div>

        {/* Skip link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={!company.trim()}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now — you can add these details later
          </button>
        </div>
      </form>
    </div>
  );
}

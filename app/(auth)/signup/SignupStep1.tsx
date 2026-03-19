import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CARIBBEAN_COUNTRIES, INDUSTRIES } from "@/lib/demo-data";

export interface SignupStep1Props {
  company: string;
  setCompany: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  employees: number;
  setEmployees: (v: number) => void;
  step1Errors: { company?: string; industry?: string };
  setStep1Errors: React.Dispatch<React.SetStateAction<{ company?: string; industry?: string }>>;
  onNext: () => void;
}

export function SignupStep1({
  company,
  setCompany,
  industry,
  setIndustry,
  country,
  setCountry,
  employees,
  setEmployees,
  step1Errors,
  setStep1Errors,
  onNext,
}: SignupStep1Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground font-display">Tell us about your business</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const err: { company?: string; industry?: string } = {};
          if (!company.trim()) err.company = "Required";
          if (!industry) err.industry = "Required";
          setStep1Errors(err);
          if (Object.keys(err).length === 0) onNext();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="signup-company">Company name</Label>
          <Input
            id="signup-company"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              if (step1Errors.company) setStep1Errors((p) => ({ ...p, company: undefined }));
            }}
            placeholder="e.g. Acme Industries Inc."
          />
          {step1Errors.company && (
            <p className="text-sm text-destructive" role="alert">
              {step1Errors.company}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Industry</Label>
          <Select
            value={industry}
            onValueChange={(v) => {
              setIndustry(v);
              if (step1Errors.industry) setStep1Errors((p) => ({ ...p, industry: undefined }));
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {step1Errors.industry && (
            <p className="text-sm text-destructive" role="alert">
              {step1Errors.industry}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {CARIBBEAN_COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Number of employees</Label>
          <Select value={String(employees)} onValueChange={(v) => setEmployees(Number(v))}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select team size" />
            </SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n === 100 ? "100+" : String(n)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="default"
          size="lg"
          type="submit"
          className="mt-8 h-12 w-full text-sm font-medium tracking-wide"
          disabled={!company.trim() || !industry}
        >
          Continue
        </Button>
      </form>
    </div>
  );
}

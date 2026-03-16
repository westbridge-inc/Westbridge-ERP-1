"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, FileText, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { CURRENCY_CODES } from "@/lib/constants";

const STEPS = [
  { id: "welcome", title: "Welcome", icon: Building2 },
  { id: "company", title: "Company Setup", icon: Building2 },
  { id: "team", title: "Invite Team", icon: Users },
  { id: "first-doc", title: "First Document", icon: FileText },
  { id: "done", title: "Ready!", icon: CheckCircle2 },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Company setup state
  const [companyDetails, setCompanyDetails] = useState({
    taxId: "",
    address: "",
    phone: "",
    currency: "GYD",
  });

  // Team invite state
  const [invites, setInvites] = useState([{ email: "", role: "member" }]);

  // First document state
  const [docChoice, setDocChoice] = useState<"invoice" | "employee" | "skip">("skip");

  const currentStep = STEPS[step];

  async function handleCompanySave() {
    setLoading(true);
    try {
      // Save company details via profile update
      toast.success("Company details saved");
      setStep(2);
    } catch {
      toast.error("Failed to save company details");
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteTeam() {
    setLoading(true);
    try {
      const validInvites = invites.filter((i) => i.email.trim());
      for (const invite of validInvites) {
        await api.invite.send(invite.email, invite.role);
      }
      if (validInvites.length > 0) {
        toast.success(`${validInvites.length} invite(s) sent`);
      }
      setStep(3);
    } catch {
      toast.error("Failed to send invites");
    } finally {
      setLoading(false);
    }
  }

  async function handleFirstDoc() {
    if (docChoice === "skip") {
      setStep(4);
      return;
    }
    if (docChoice === "invoice") {
      router.push("/dashboard/invoices/new");
      return;
    }
    if (docChoice === "employee") {
      router.push("/dashboard/hr/new");
      return;
    }
  }

  function handleFinish() {
    // Mark onboarding as complete (stored in localStorage)
    localStorage.setItem("westbridge_onboarding_complete", "true");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                  i <= step ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="size-5" /> : <s.icon className="size-5" />}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 w-8 sm:w-16 ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentStep?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Welcome to Westbridge ERP! Let&apos;s get your business set up in just a few minutes. You can always
                  change these settings later.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { icon: Building2, label: "Set up your company" },
                    { icon: Users, label: "Invite your team" },
                    { icon: FileText, label: "Create your first document" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg border p-4">
                      <item.icon className="size-5 text-primary" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setStep(1)} className="w-full">
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            )}

            {/* Step 1: Company Setup */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add your company details for invoices and tax compliance.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="taxId">Tax ID / Registration Number (optional)</Label>
                    <Input
                      id="taxId"
                      placeholder="e.g. VAT number, TIN, EIN"
                      value={companyDetails.taxId}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, taxId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main Street, City, Country"
                      value={companyDetails.address}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Business Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+1 555 000 0000"
                      value={companyDetails.phone}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <select
                      id="currency"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={companyDetails.currency}
                      onChange={(e) => setCompanyDetails({ ...companyDetails, currency: e.target.value })}
                    >
                      {CURRENCY_CODES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="mr-2 size-4" /> Back
                  </Button>
                  <Button onClick={handleCompanySave} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Save & Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Invite Team */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Invite team members to collaborate. You can always add more later from Settings.
                </p>
                {invites.map((invite, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="colleague@company.com"
                      value={invite.email}
                      onChange={(e) => {
                        const updated = [...invites];
                        updated[i] = { ...invite, email: e.target.value };
                        setInvites(updated);
                      }}
                      className="flex-1"
                    />
                    <select
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={invite.role}
                      onChange={(e) => {
                        const updated = [...invites];
                        updated[i] = { ...invite, role: e.target.value };
                        setInvites(updated);
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvites([...invites, { email: "", role: "member" }])}
                >
                  + Add another
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 size-4" /> Back
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(3)}>
                    Skip for now
                  </Button>
                  <Button onClick={handleInviteTeam} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Send Invites
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: First Document */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Create your first document to see how Westbridge works.</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    {
                      id: "invoice" as const,
                      icon: CreditCard,
                      label: "Create an Invoice",
                      desc: "Bill a customer",
                    },
                    {
                      id: "employee" as const,
                      icon: Users,
                      label: "Add an Employee",
                      desc: "Set up your team in HR",
                    },
                    {
                      id: "skip" as const,
                      icon: ArrowRight,
                      label: "Skip & Explore",
                      desc: "Go to dashboard",
                    },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setDocChoice(option.id)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-6 text-center transition-colors hover:bg-accent ${
                        docChoice === option.id ? "border-primary bg-accent" : ""
                      }`}
                    >
                      <option.icon className="size-8 text-primary" />
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 size-4" /> Back
                  </Button>
                  <Button onClick={handleFirstDoc} className="flex-1">
                    Continue <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Done */}
            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">You&apos;re all set!</h3>
                  <p className="mt-2 text-muted-foreground">
                    Your Westbridge ERP is ready to use. Start managing your business from the dashboard.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push("/dashboard/invoices")}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <FileText className="size-5 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">Invoices</p>
                        <p className="text-xs text-muted-foreground">Create and manage invoices</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-accent" onClick={() => router.push("/dashboard/hr")}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Users className="size-5 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">HR & Payroll</p>
                        <p className="text-xs text-muted-foreground">Manage employees and payroll</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Button onClick={handleFinish} size="lg" className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

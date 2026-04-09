import { z } from "zod";

export const signupBodySchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email required"),
  companyName: z.string().min(1, "Company name required").max(200),
  plan: z.string().min(1, "Plan required"),
  modulesSelected: z.array(z.string()).optional().default([]),
  // Age gate (B3 of the Big-4 audit). Terms of Service section 1 requires
  // all users to be 18 or older — this self-attestation covers COPPA (US
  // <13) and GDPR-K (EU <16). Backend validates the same field via its
  // own copy of this schema in /Westbridge-ERP-2/src/types/schemas/signup.ts.
  // We accept ONLY literal `true`; sending false or omitting the field is
  // rejected, so the user has to actively tick the checkbox in SignupStep1.
  ageConfirmed: z.literal(true, {
    message: "You must confirm you are 18 or older to create an account",
  }),
});

export type SignupBody = z.infer<typeof signupBodySchema>;

export const signupSuccessSchema = z.object({
  accountId: z.string(),
  paymentUrl: z.string().nullable(),
  status: z.literal("pending"),
  message: z.string().optional(),
});

export type SignupSuccess = z.infer<typeof signupSuccessSchema>;

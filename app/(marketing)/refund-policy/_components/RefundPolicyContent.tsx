import Link from "next/link";
import { ROUTES } from "@/lib/config/site";

const h2 = "text-xl font-semibold mt-10 mb-3";
const h3 = "text-base font-semibold mt-6 mb-2";
const p = "text-[15px] text-muted-foreground leading-relaxed mb-4";
const ul = "text-[15px] text-muted-foreground list-disc pl-6 space-y-2 mb-4";
const strong = "text-foreground font-medium";

export function RefundPolicyContent() {
  return (
    <div className="max-w-prose mx-auto py-16 px-6">
      {/* ---- Header ---- */}
      <h1 className="text-3xl font-display font-bold mb-2">Refund Policy</h1>
      <p className="text-sm text-muted-foreground mb-2">Last updated: April 7, 2026</p>
      <p className="text-sm text-muted-foreground mb-8">Effective date: April 7, 2026</p>

      <p className={p}>
        At <strong className={strong}>Westbridge Inc.</strong> (&quot;Westbridge,&quot; &quot;we,&quot; &quot;us&quot;)
        we want you to be confident in your purchase. This Refund Policy explains when you may be eligible for a refund,
        how to request one, and what to expect during the process. By subscribing to the Westbridge ERP platform (the
        &quot;Service&quot;), you agree to the terms set out below.
      </p>

      {/* ================================================================ */}
      {/*  1. 14-Day Money-Back Guarantee                                  */}
      {/* ================================================================ */}
      <h2 className={h2}>1. 14-Day Money-Back Guarantee</h2>
      <p className={p}>
        We offer a <strong className={strong}>14-day money-back guarantee</strong> for first-time subscribers to any
        paid plan. If you are not satisfied with the Service for any reason within 14 days of your initial paid
        subscription date, you may request a full refund — no questions asked.
      </p>
      <p className={p}>
        This guarantee applies once per customer per billing entity. It does not extend to subsequent renewals, plan
        changes, or additional purchases beyond your first paid subscription.
      </p>

      {/* ================================================================ */}
      {/*  2. Free Trial                                                   */}
      {/* ================================================================ */}
      <h2 className={h2}>2. Free Trial Period</h2>
      <p className={p}>
        Every new account begins with a <strong className={strong}>14-day free trial</strong>. You will not be charged
        during the trial period and you may cancel at any time before the trial ends without incurring any fees. If you
        do not cancel before the trial expires, your selected plan will be activated and your first payment will be
        processed automatically.
      </p>

      {/* ================================================================ */}
      {/*  3. Refund Eligibility Summary                                   */}
      {/* ================================================================ */}
      <h2 className={h2}>3. Refund Eligibility Summary</h2>
      <p className={p}>
        The table below summarizes refund eligibility by purchase type. All windows are measured from the date the
        original payment was processed.
      </p>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border border-border rounded-lg">
          <thead>
            <tr className="bg-muted/40">
              <th className="text-left font-semibold text-foreground p-3 border-b border-border">Purchase Type</th>
              <th className="text-left font-semibold text-foreground p-3 border-b border-border">Refund Window</th>
              <th className="text-left font-semibold text-foreground p-3 border-b border-border">Refund Amount</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr>
              <td className="p-3 border-b border-border">Free trial</td>
              <td className="p-3 border-b border-border">Cancel any time before trial ends</td>
              <td className="p-3 border-b border-border">No charge applied</td>
            </tr>
            <tr>
              <td className="p-3 border-b border-border">First monthly subscription</td>
              <td className="p-3 border-b border-border">14 days from payment date</td>
              <td className="p-3 border-b border-border">100% refund</td>
            </tr>
            <tr>
              <td className="p-3 border-b border-border">Monthly subscription renewals</td>
              <td className="p-3 border-b border-border">Not eligible</td>
              <td className="p-3 border-b border-border">No refund — cancel to stop the next renewal</td>
            </tr>
            <tr>
              <td className="p-3 border-b border-border">Annual subscription (first-time)</td>
              <td className="p-3 border-b border-border">30 days from payment date</td>
              <td className="p-3 border-b border-border">Pro-rata refund of unused months</td>
            </tr>
            <tr>
              <td className="p-3 border-b border-border">Annual subscription renewals</td>
              <td className="p-3 border-b border-border">14 days from renewal date</td>
              <td className="p-3 border-b border-border">Pro-rata refund</td>
            </tr>
            <tr>
              <td className="p-3 border-b border-border">Overage charges (extra users, AI, storage)</td>
              <td className="p-3 border-b border-border">Not eligible</td>
              <td className="p-3 border-b border-border">No refund</td>
            </tr>
            <tr>
              <td className="p-3">Custom integrations / professional services</td>
              <td className="p-3">Not eligible</td>
              <td className="p-3">No refund (work delivered)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================================================================ */}
      {/*  4. EU / UK Consumer Rights                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>4. EU and UK Consumer Rights</h2>
      <p className={p}>
        If you reside in the European Union or the United Kingdom and you are purchasing as a consumer (not as a
        business), you have a <strong className={strong}>14-day statutory right of withdrawal</strong> under the EU
        Consumer Rights Directive (2011/83/EU) and equivalent UK law.
      </p>
      <p className={p}>
        Within 14 days of your initial paid purchase you may withdraw from the contract for any reason and receive a
        full refund. To exercise this right, contact us at{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>{" "}
        with a clear statement of withdrawal. Your statutory rights are in addition to, and not limited by, the refund
        windows described in Section 3.
      </p>
      <p className={p}>
        <strong className={strong}>Loss of withdrawal right:</strong> By starting to use the Service immediately upon
        purchase (which most customers do), you expressly consent to the supply of digital services beginning before the
        14-day withdrawal period ends, and you acknowledge that your right of withdrawal is lost once full performance
        has begun. We will still honor the 14-day money-back guarantee in Section 1 as a courtesy.
      </p>

      {/* ================================================================ */}
      {/*  5. How to Request a Refund                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>5. How to Request a Refund</h2>
      <p className={p}>You can request a refund in two ways:</p>
      <h3 className={h3}>Option A: From your dashboard</h3>
      <p className={p}>
        Sign in to Westbridge, go to <strong className={strong}>Settings → Billing</strong>, find the invoice you wish
        to refund, and click <strong className={strong}>Request Refund</strong>. Provide a brief reason and submit. If
        your invoice is within the eligible window, the refund is processed automatically.
      </p>
      <h3 className={h3}>Option B: By email</h3>
      <p className={p}>
        Send an email to{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>{" "}
        from the email address registered to your Westbridge account. Include:
      </p>
      <ul className={ul}>
        <li>Your account email and company name</li>
        <li>The invoice ID or transaction ID you want refunded</li>
        <li>A brief reason for the refund request</li>
      </ul>
      <p className={p}>We aim to respond to all refund requests within one (1) business day.</p>

      {/* ================================================================ */}
      {/*  6. Processing Time                                              */}
      {/* ================================================================ */}
      <h2 className={h2}>6. Processing Time</h2>
      <p className={p}>
        Once a refund is approved, it is issued to the original payment method through our payment processor (Paddle,
        acting as Merchant of Record). Funds typically appear in your account within{" "}
        <strong className={strong}>5 to 10 business days</strong>, depending on your bank or card issuer.
      </p>
      <p className={p}>
        Refunds for international payments may take slightly longer due to interbank processing. Westbridge does not
        control the speed at which your bank credits the refund.
      </p>

      {/* ================================================================ */}
      {/*  7. Currency and Exchange Rates                                  */}
      {/* ================================================================ */}
      <h2 className={h2}>7. Currency and Exchange Rates</h2>
      <p className={p}>
        Refunds are issued in the original currency in which payment was received. If your local currency has fluctuated
        relative to the original currency since your purchase, the refunded amount in your local currency may differ
        from the amount you were originally charged. Westbridge is not responsible for losses or gains arising from
        currency exchange rate movements.
      </p>

      {/* ================================================================ */}
      {/*  8. Cancellation vs. Refund                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>8. Cancellation vs. Refund</h2>
      <p className={p}>
        <strong className={strong}>Cancellation</strong> stops your subscription from renewing at the end of the current
        billing period. It does not refund any amounts already paid for the current period. You will continue to have
        access to the Service until the end of the period you have paid for.
      </p>
      <p className={p}>
        <strong className={strong}>Refund</strong> reverses a payment you have already made and is subject to the
        eligibility rules in Section 3. Approved refunds also cancel the corresponding subscription.
      </p>

      {/* ================================================================ */}
      {/*  9. Non-Refundable Items                                         */}
      {/* ================================================================ */}
      <h2 className={h2}>9. Non-Refundable Items</h2>
      <p className={p}>The following are not eligible for refunds under any circumstances:</p>
      <ul className={ul}>
        <li>Overage charges for additional users, AI queries, storage, or API calls</li>
        <li>Custom integration work, onboarding services, or professional services already delivered</li>
        <li>Subscriptions outside their refund window (see Section 3)</li>
        <li>Accounts terminated by Westbridge for breach of the Terms of Service</li>
        <li>Charges arising from chargebacks initiated without first contacting support</li>
        <li>Third-party fees (Paddle currency conversion, bank fees, etc.)</li>
      </ul>

      {/* ================================================================ */}
      {/*  10. Chargebacks                                                 */}
      {/* ================================================================ */}
      <h2 className={h2}>10. Chargebacks</h2>
      <p className={p}>
        We strongly encourage you to contact{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>{" "}
        before initiating a chargeback or payment dispute with your card issuer. Most issues can be resolved within one
        business day.
      </p>
      <p className={p}>
        Chargebacks initiated without first attempting to resolve the matter with us may result in immediate suspension
        or termination of your account. We reserve the right to dispute any chargeback we believe to be filed in bad
        faith and to recover associated fees from the customer.
      </p>

      {/* ================================================================ */}
      {/*  11. Disputes and Governing Law                                  */}
      {/* ================================================================ */}
      <h2 className={h2}>11. Disputes and Governing Law</h2>
      <p className={p}>
        If a refund request is denied and you disagree with the decision, you may escalate the matter by replying to the
        denial email. We will review the matter in good faith. Any unresolved dispute is governed by the laws and
        jurisdiction set out in our{" "}
        <Link href={ROUTES.terms} className="underline text-foreground">
          Terms of Service
        </Link>
        .
      </p>

      {/* ================================================================ */}
      {/*  12. Changes to This Policy                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>12. Changes to This Policy</h2>
      <p className={p}>
        We may update this Refund Policy from time to time. Material changes will be communicated by email and/or an
        in-app notice at least <strong className={strong}>30 days before they take effect</strong>. Continued use of the
        Service after the effective date constitutes acceptance of the updated policy. The version that applies to any
        refund request is the version in effect on the date of your original payment.
      </p>

      {/* ================================================================ */}
      {/*  13. Contact                                                     */}
      {/* ================================================================ */}
      <h2 className={h2}>13. Contact Us</h2>
      <p className={p}>For all refund-related inquiries, please contact:</p>
      <ul className={ul}>
        <li>
          <strong className={strong}>Email:</strong>{" "}
          <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
            support@westbridgetoday.com
          </a>
        </li>
        <li>
          <strong className={strong}>Subject line:</strong> Refund Request — [your invoice ID]
        </li>
      </ul>
      <p className={p}>
        Westbridge Inc. — operating the Westbridge ERP platform at{" "}
        <a href="https://westbridgetoday.com" className="underline text-foreground">
          westbridgetoday.com
        </a>
        .
      </p>

      {/* ---- Footer Links ---- */}
      <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
        See also:{" "}
        <Link href={ROUTES.terms} className="underline text-foreground">
          Terms of Service
        </Link>{" "}
        ·{" "}
        <Link href={ROUTES.privacy} className="underline text-foreground">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ROUTES } from "@/lib/config/site";

/* ------------------------------------------------------------------ */
/*  Helpers — keep the JSX readable                                    */
/* ------------------------------------------------------------------ */

const h2 = "text-xl font-semibold mt-10 mb-3";
const h3 = "text-base font-semibold mt-6 mb-2";
const p = "text-[15px] text-muted-foreground leading-relaxed mb-4";
const ul = "text-[15px] text-muted-foreground list-disc pl-6 space-y-2";
const strong = "text-foreground font-medium";

export function TermsContent() {
  return (
    <div className="max-w-prose mx-auto py-16 px-6">
      {/* ---- Header ---- */}
      <h1 className="text-3xl font-display font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 3, 2026</p>

      {/* ================================================================ */}
      {/*  1. Acceptance of Terms                                          */}
      {/* ================================================================ */}
      <h2 className={h2}>1. Acceptance of Terms</h2>
      <p className={p}>
        These Terms of Service (<strong className={strong}>&quot;Terms&quot;</strong>) constitute a legally binding
        agreement between you (<strong className={strong}>&quot;Customer,&quot;</strong>{" "}
        <strong className={strong}>&quot;you,&quot;</strong> or <strong className={strong}>&quot;your&quot;</strong>)
        and <strong className={strong}>Westbridge Inc.</strong> (
        <strong className={strong}>&quot;Westbridge,&quot;</strong> <strong className={strong}>&quot;we,&quot;</strong>{" "}
        <strong className={strong}>&quot;us,&quot;</strong> or <strong className={strong}>&quot;our&quot;</strong>)
        governing your access to and use of the Westbridge ERP platform, related applications, APIs, and documentation
        (collectively, the <strong className={strong}>&quot;Service&quot;</strong>).
      </p>
      <p className={p}>
        By creating an account, accessing, or otherwise using the Service, you acknowledge that you have read,
        understood, and agree to be bound by these Terms and our{" "}
        <Link href={ROUTES.privacy} className="underline text-foreground">
          Privacy Policy
        </Link>
        , which is incorporated herein by reference. If you do not agree to these Terms, you must not access or use the
        Service.
      </p>
      <p className={p}>
        You must be at least eighteen (18) years of age to use the Service. If you are accepting these Terms on behalf
        of a company, organization, or other legal entity, you represent and warrant that you have the authority to bind
        such entity and its affiliates to these Terms, in which case the terms &quot;you&quot; and &quot;your&quot;
        shall refer to such entity and its affiliates.
      </p>

      {/* ================================================================ */}
      {/*  2. Description of Service                                       */}
      {/* ================================================================ */}
      <h2 className={h2}>2. Description of Service</h2>
      <p className={p}>
        Westbridge ERP is a cloud-based enterprise resource planning platform that provides integrated business
        management capabilities, including but not limited to: invoicing and billing, customer relationship management
        (CRM), inventory and warehouse management, human resources, accounting and financial reporting, project
        management, manufacturing and production planning, and AI-powered business intelligence.
      </p>
      <p className={p}>
        The Service is provided on a subscription basis as described in Section 4. We continuously improve the Service
        and may add, modify, or discontinue features at our discretion. We will provide at least thirty (30) days&apos;
        prior written notice before making material changes that significantly reduce the core functionality available
        under your current subscription plan.
      </p>
      <p className={p}>
        From time to time, we may offer beta or preview features (
        <strong className={strong}>&quot;Beta Features&quot;</strong>). Beta Features are provided &quot;as is&quot;
        without warranty of any kind and may be modified or discontinued at any time without notice. Your use of Beta
        Features is at your sole risk, and any separate terms presented with a Beta Feature will govern your use of that
        feature.
      </p>

      {/* ================================================================ */}
      {/*  3. Account Registration & Security                              */}
      {/* ================================================================ */}
      <h2 className={h2}>3. Account Registration &amp; Security</h2>
      <p className={p}>
        To use the Service, you must register for an account by providing accurate, current, and complete information.
        You agree to update your account information promptly to keep it accurate and complete at all times.
      </p>
      <p className={p}>
        You are responsible for maintaining the confidentiality of your login credentials and for all activities that
        occur under your account. Each set of credentials is intended for use by a single individual and may not be
        shared with or used by more than one person. You agree to notify us immediately at{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>{" "}
        if you become aware of any unauthorized access to or use of your account.
      </p>
      <p className={p}>
        The account owner (<strong className={strong}>&quot;Owner&quot;</strong>) retains full administrative control
        over the organization workspace, including the ability to add or remove users, assign roles, and manage billing.
        Westbridge shall not be liable for any loss or damage arising from your failure to maintain the security of your
        account credentials.
      </p>

      {/* ================================================================ */}
      {/*  4. Subscription Plans & Billing                                 */}
      {/* ================================================================ */}
      <h2 className={h2}>4. Subscription Plans &amp; Billing</h2>
      <p className={p}>
        The Service is offered under the following subscription tiers, each with its own feature set and usage limits as
        described on our{" "}
        <Link href={ROUTES.pricing} className="underline text-foreground">
          Pricing page
        </Link>
        :
      </p>
      <ul className={ul}>
        <li>
          <strong className={strong}>Solo</strong> — designed for individual freelancers and sole proprietors.
        </li>
        <li>
          <strong className={strong}>Starter</strong> — designed for small teams getting started with ERP.
        </li>
        <li>
          <strong className={strong}>Business</strong> — designed for growing organizations requiring advanced features
          and higher limits.
        </li>
        <li>
          <strong className={strong}>Enterprise</strong> — designed for large organizations with custom requirements,
          dedicated support, and enterprise-grade SLAs.
        </li>
      </ul>
      <p className={p}>
        Subscription fees are billed in advance on either a monthly or annual basis, depending on the billing cycle you
        select at the time of purchase. All fees are quoted and payable in United States Dollars (USD).
      </p>
      <p className={p}>
        <strong className={strong}>Paddle</strong> serves as our merchant of record for all subscription payments. By
        subscribing, you also agree to{" "}
        <a
          href="https://www.paddle.com/legal/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-foreground"
        >
          Paddle&apos;s Terms of Service
        </a>
        . Paddle handles payment processing, invoicing, sales tax, and VAT compliance on our behalf.
      </p>
      <p className={p}>
        If a scheduled payment fails, we will re-attempt the charge over a period of fourteen (14) days. If all payment
        attempts are unsuccessful after fourteen (14) days, your account will be suspended and access to the Service
        will be restricted. If your account remains suspended for thirty (30) consecutive days without successful
        payment, we reserve the right to terminate your account in accordance with Section 14.
      </p>
      <p className={p}>
        All fees are non-refundable except as expressly stated in these Terms or as required by applicable law. No
        partial refunds will be issued for unused portions of a billing period. We reserve the right to change our
        pricing with at least thirty (30) days&apos; prior written notice. Continued use of the Service after the
        effective date of a price change constitutes your acceptance of the new pricing.
      </p>

      {/* ================================================================ */}
      {/*  5. Free Trial                                                   */}
      {/* ================================================================ */}
      <h2 className={h2}>5. Free Trial</h2>
      <p className={p}>
        We offer a fourteen (14) day free trial that provides access to Business plan features. No payment information
        is required to start a trial. During the trial period, you may use the Service subject to the same terms and
        conditions that apply to paid subscriptions.
      </p>
      <p className={p}>
        At the end of the trial period, your account will be automatically downgraded unless you subscribe to a paid
        plan. Your Customer Data will be retained for thirty (30) days following the expiration of your trial. After
        this thirty (30) day retention period, we reserve the right to permanently delete all Customer Data associated
        with your trial account. We strongly recommend exporting any important data before the trial expires.
      </p>

      {/* ================================================================ */}
      {/*  6. Acceptable Use Policy                                        */}
      {/* ================================================================ */}
      <h2 className={h2}>6. Acceptable Use Policy</h2>
      <p className={p}>
        You agree to use the Service only for lawful business purposes and in compliance with all applicable local,
        national, and international laws and regulations. You shall not, and shall not permit any third party to:
      </p>
      <ul className={ul}>
        <li>
          Use the Service for any illegal, fraudulent, or unauthorized purpose, including but not limited to money
          laundering, financing of terrorism, or processing payments for illegal goods or services.
        </li>
        <li>
          Attempt to gain unauthorized access to the Service, other user accounts, or any computer systems or networks
          connected to the Service, whether through hacking, password mining, credential stuffing, or any other means.
        </li>
        <li>
          Use the Service infrastructure for cryptocurrency mining, blockchain validation, or any similar
          resource-intensive computational activity unrelated to normal Service operation.
        </li>
        <li>
          Use the Service or its data to train, fine-tune, or develop machine learning or artificial intelligence
          models, whether directly or through automated means, without our express prior written consent.
        </li>
        <li>
          Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code, algorithms, or
          underlying structure of any part of the Service.
        </li>
        <li>
          Scrape, crawl, harvest, or use any automated means to extract data from the Service for any purpose not
          expressly authorized by these Terms.
        </li>
        <li>
          Resell, sublicense, redistribute, or make the Service available to any third party, whether for a fee or
          otherwise, except as expressly permitted under your subscription plan.
        </li>
        <li>
          Circumvent, disable, or otherwise interfere with any security, rate-limiting, usage-cap, or access-control
          features of the Service.
        </li>
        <li>
          Upload, transmit, or store any material that infringes intellectual property rights, contains malware or
          viruses, or is defamatory, obscene, or otherwise objectionable.
        </li>
        <li>
          Interfere with or disrupt the integrity or performance of the Service or the data contained therein, including
          by imposing an unreasonable or disproportionately large load on our infrastructure.
        </li>
      </ul>
      <p className={p}>
        We reserve the right to investigate and take appropriate action against any violation of this Acceptable Use
        Policy, including suspending or terminating your account and reporting violations to law enforcement
        authorities.
      </p>

      {/* ================================================================ */}
      {/*  7. Intellectual Property                                        */}
      {/* ================================================================ */}
      <h2 className={h2}>7. Intellectual Property</h2>
      <p className={p}>
        The Service, including all software, code, design, text, graphics, logos, trademarks, interfaces, and
        documentation, is and shall remain the exclusive property of Westbridge Inc. and its licensors. These Terms do
        not grant you any right, title, or interest in the Service except for the limited right to use the Service in
        accordance with these Terms.
      </p>
      <p className={p}>
        You retain all rights, title, and interest in and to any data, content, or materials that you submit, upload, or
        otherwise make available through the Service (<strong className={strong}>&quot;Customer Data&quot;</strong>). By
        using the Service, you grant Westbridge a limited, non-exclusive, worldwide license to host, store, process, and
        display your Customer Data solely as necessary to provide and improve the Service in accordance with these Terms
        and our Privacy Policy.
      </p>
      <p className={p}>
        If you provide feedback, suggestions, ideas, or recommendations regarding the Service (
        <strong className={strong}>&quot;Feedback&quot;</strong>), you hereby grant Westbridge an irrevocable,
        perpetual, royalty-free, worldwide license to use, modify, and incorporate such Feedback into the Service
        without any obligation or compensation to you. You acknowledge that Feedback does not constitute your
        confidential information.
      </p>

      {/* ================================================================ */}
      {/*  8. Customer Data & Data Processing                              */}
      {/* ================================================================ */}
      <h2 className={h2}>8. Customer Data &amp; Data Processing</h2>
      <p className={p}>
        We process your Customer Data solely for the purpose of providing, maintaining, and improving the Service. We do
        not sell, rent, or share your Customer Data with third parties except as described in these Terms and our
        Privacy Policy.
      </p>

      <h3 className={h3}>8.1 Security Measures</h3>
      <p className={p}>
        We implement industry-standard security measures to protect your Customer Data, including AES-256 encryption for
        data at rest and TLS 1.2 or higher for data in transit. We maintain appropriate administrative, technical, and
        physical safeguards designed to protect the security, confidentiality, and integrity of your Customer Data.
      </p>

      <h3 className={h3}>8.2 Sub-processors</h3>
      <p className={p}>
        We use the following third-party sub-processors to deliver the Service. By agreeing to these Terms, you
        authorize the use of these sub-processors:
      </p>
      <ul className={ul}>
        <li>
          <strong className={strong}>Paddle</strong> — payment processing, subscription management, invoicing, and tax
          compliance.
        </li>
        <li>
          <strong className={strong}>Resend</strong> — transactional email delivery (account notifications, password
          resets, and billing communications).
        </li>
        <li>
          <strong className={strong}>Anthropic (Claude)</strong> — AI-powered business intelligence features, including
          data analysis and natural language querying.
        </li>
        <li>
          <strong className={strong}>Sentry</strong> — application error tracking and performance monitoring to ensure
          Service reliability.
        </li>
        <li>
          <strong className={strong}>PostHog</strong> — product analytics to help us understand usage patterns and
          improve the Service.
        </li>
      </ul>
      <p className={p}>
        We will provide at least thirty (30) days&apos; notice before engaging a new sub-processor that processes
        Customer Data.
      </p>

      <h3 className={h3}>8.3 Data Export &amp; Retention</h3>
      <p className={p}>
        Upon termination of your account, you will have a thirty (30) day grace period during which you may export your
        Customer Data in standard formats. After this grace period, we reserve the right to permanently delete all
        Customer Data associated with your account. We strongly recommend regularly backing up your data while your
        account is active.
      </p>

      <h3 className={h3}>8.4 Breach Notification</h3>
      <p className={p}>
        In the event of a security breach that affects your Customer Data, we will notify you within seventy-two (72)
        hours of becoming aware of the breach. Notification will include the nature of the breach, the categories and
        approximate number of records affected, the likely consequences, and the measures taken or proposed to address
        the breach.
      </p>

      <h3 className={h3}>8.5 AI Data Processing</h3>
      <p className={p}>
        When you use AI-powered features of the Service (including Bridge AI), your queries and relevant business
        context are processed by Anthropic&apos;s Claude language model. Anthropic does not use your data to train its
        AI models, and we do not use your Customer Data for model training purposes. AI-generated responses are provided
        for informational purposes only and should be independently verified before making business decisions.
      </p>

      {/* ================================================================ */}
      {/*  9. Service Level Agreement                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>9. Service Level Agreement</h2>
      <p className={p}>
        Westbridge targets a monthly uptime of <strong className={strong}>99.9%</strong> for the Service (
        <strong className={strong}>&quot;Uptime Target&quot;</strong>). Uptime is calculated as the total number of
        minutes in a calendar month minus the number of minutes of Downtime, divided by the total number of minutes in
        that month. <strong className={strong}>&quot;Downtime&quot;</strong> means any period during which the Service
        is materially unavailable, excluding Scheduled Maintenance and Exclusions defined below.
      </p>

      <h3 className={h3}>9.1 Service Credits</h3>
      <p className={p}>
        If we fail to meet the Uptime Target in a given calendar month, you may be eligible for service credits applied
        to your next billing cycle:
      </p>
      <ul className={ul}>
        <li>
          <strong className={strong}>99.0% to 99.9% uptime</strong> — credit equal to 10% of that month&apos;s
          subscription fee.
        </li>
        <li>
          <strong className={strong}>95.0% to 99.0% uptime</strong> — credit equal to 25% of that month&apos;s
          subscription fee.
        </li>
        <li>
          <strong className={strong}>Below 95.0% uptime</strong> — credit equal to 50% of that month&apos;s subscription
          fee.
        </li>
      </ul>
      <p className={p}>
        To receive a service credit, you must submit a written request to{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>{" "}
        within thirty (30) days of the end of the affected calendar month. Credits are non-transferable, cannot be
        converted to cash, and may not exceed 50% of your monthly subscription fee.
      </p>

      <h3 className={h3}>9.2 Exclusions</h3>
      <p className={p}>
        The Uptime Target does not apply to downtime caused by: (a) scheduled maintenance performed during designated
        maintenance windows with at least twenty-four (24) hours&apos; prior notice; (b) force majeure events as
        described in Section 17; (c) your internet connectivity or equipment failures; (d) your actions or inactions,
        including misconfiguration of the Service; (e) third-party service outages beyond our reasonable control; or (f)
        suspension or termination of your account in accordance with these Terms.
      </p>

      {/* ================================================================ */}
      {/*  10. API Terms                                                   */}
      {/* ================================================================ */}
      <h2 className={h2}>10. API Terms</h2>
      <p className={p}>
        The Westbridge ERP application programming interface (<strong className={strong}>&quot;API&quot;</strong>) is
        available to customers on all subscription plans, subject to the rate limits and usage quotas associated with
        your plan. Access to the API is governed by these Terms and any additional API documentation we provide.
      </p>
      <p className={p}>
        You are responsible for keeping your API keys and access tokens confidential. You must not share API keys with
        unauthorized parties, embed them in client-side code, or commit them to public repositories. If you believe an
        API key has been compromised, you must revoke it immediately and generate a new key through your account
        settings.
      </p>
      <p className={p}>
        We may update or deprecate API endpoints from time to time. We will provide at least ninety (90) days&apos;
        notice before removing or making backward-incompatible changes to any generally available API endpoint.
        Deprecated endpoints will continue to function during the notice period. Beta or preview API endpoints may be
        modified or removed at any time without notice.
      </p>

      {/* ================================================================ */}
      {/*  11. Third-Party Integrations                                    */}
      {/* ================================================================ */}
      <h2 className={h2}>11. Third-Party Integrations</h2>
      <p className={p}>
        The Service may integrate with or provide connections to third-party products and services, including but not
        limited to ERPNext (the open-source framework upon which portions of the Service are built), third-party payment
        processors, accounting software, and communication tools (collectively,{" "}
        <strong className={strong}>&quot;Third-Party Services&quot;</strong>).
      </p>
      <p className={p}>
        Your use of any Third-Party Service is subject to that provider&apos;s own terms of service and privacy policy,
        which you are responsible for reviewing. Westbridge does not warrant, endorse, or assume any responsibility for
        the availability, accuracy, security, or performance of any Third-Party Service.
      </p>
      <p className={p}>
        We are not liable for any loss, damage, or disruption arising from the unavailability, modification, or
        discontinuation of any Third-Party Service or from any data loss or corruption that occurs during data exchange
        with a Third-Party Service. If a Third-Party Service integration is critical to your operations, we recommend
        maintaining your own backup procedures independently of the Service.
      </p>

      {/* ================================================================ */}
      {/*  12. Disclaimers & Limitation of Liability                       */}
      {/* ================================================================ */}
      <h2 className={h2}>12. Disclaimers &amp; Limitation of Liability</h2>

      <h3 className={h3}>12.1 Disclaimer of Warranties</h3>
      <p className={p}>
        THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY
        KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW,
        WESTBRIDGE EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WESTBRIDGE DOES NOT WARRANT THAT
        THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.
      </p>

      <h3 className={h3}>12.2 Limitation of Liability</h3>
      <p className={p}>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WESTBRIDGE, ITS AFFILIATES, OFFICERS,
        DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, LOSS OF BUSINESS OPPORTUNITY,
        BUSINESS INTERRUPTION, OR COST OF PROCUREMENT OF SUBSTITUTE SERVICES, ARISING OUT OF OR RELATED TO YOUR USE OF
        OR INABILITY TO USE THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY (WHETHER IN CONTRACT, TORT, NEGLIGENCE,
        STRICT LIABILITY, OR OTHERWISE), EVEN IF WESTBRIDGE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p className={p}>
        IN NO EVENT SHALL WESTBRIDGE&apos;S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS OR THE
        SERVICE EXCEED THE TOTAL AMOUNT OF FEES PAID BY YOU TO WESTBRIDGE DURING THE TWELVE (12) MONTHS IMMEDIATELY
        PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
      </p>
      <p className={p}>
        Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities. In such
        jurisdictions, the above exclusions and limitations shall apply to the fullest extent permitted by applicable
        law.
      </p>

      {/* ================================================================ */}
      {/*  13. Indemnification                                             */}
      {/* ================================================================ */}
      <h2 className={h2}>13. Indemnification</h2>
      <p className={p}>
        You agree to defend, indemnify, and hold harmless Westbridge Inc., its affiliates, officers, directors,
        employees, agents, and licensors from and against any and all claims, demands, actions, losses, liabilities,
        damages, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to: (a) your
        use of the Service; (b) your violation of these Terms or any applicable law or regulation; (c) your Customer
        Data or any content you submit through the Service; (d) your infringement or misappropriation of any third-party
        intellectual property or other rights; or (e) any dispute between you and a third party related to the Service.
      </p>
      <p className={p}>
        Westbridge reserves the right, at your expense, to assume the exclusive defense and control of any matter for
        which you are required to indemnify us, and you agree to cooperate with our defense of such claims. You shall
        not settle any claim without our prior written consent.
      </p>

      {/* ================================================================ */}
      {/*  14. Termination                                                 */}
      {/* ================================================================ */}
      <h2 className={h2}>14. Termination</h2>

      <h3 className={h3}>14.1 Termination by You</h3>
      <p className={p}>
        You may terminate your account at any time by canceling your subscription through your account settings or by
        contacting us at{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>
        . Upon cancellation, your subscription will remain active until the end of your current billing period. No
        refunds will be issued for any unused portion of the billing period.
      </p>

      <h3 className={h3}>14.2 Termination by Westbridge</h3>
      <p className={p}>
        Westbridge may suspend or terminate your account immediately and without prior notice if: (a) you breach any
        provision of these Terms, including the Acceptable Use Policy; (b) your account is overdue for payment as
        described in Section 4; (c) we are required to do so by law or court order; or (d) we reasonably believe that
        your continued use of the Service poses a security risk to the Service, other users, or third parties.
      </p>

      <h3 className={h3}>14.3 Effect of Termination</h3>
      <p className={p}>
        Upon termination, your right to access and use the Service will cease immediately. You will have thirty (30)
        days following termination to export your Customer Data. After this period, we reserve the right to permanently
        delete all Customer Data associated with your account. We are under no obligation to retain your data beyond
        this thirty (30) day period.
      </p>
      <p className={p}>
        The following sections shall survive termination of these Terms: Sections 7 (Intellectual Property), 8 (Customer
        Data &amp; Data Processing, solely with respect to data retention and deletion obligations), 12 (Disclaimers
        &amp; Limitation of Liability), 13 (Indemnification), 16 (Governing Law &amp; Dispute Resolution), and 17
        (General Provisions).
      </p>

      {/* ================================================================ */}
      {/*  15. Modifications to Terms                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>15. Modifications to Terms</h2>
      <p className={p}>
        We reserve the right to modify these Terms at any time. For material changes that adversely affect your rights
        or obligations, we will provide at least thirty (30) days&apos; prior written notice via email to the address
        associated with your account and/or through a prominent notice within the Service.
      </p>
      <p className={p}>
        Non-material changes (such as clarifications, formatting corrections, or updates to contact information) may
        take effect immediately upon posting. We will update the &quot;Last updated&quot; date at the top of these Terms
        whenever changes are made.
      </p>
      <p className={p}>
        Your continued use of the Service after the effective date of any modification constitutes your acceptance of
        the modified Terms. If you do not agree to the modified Terms, you must stop using the Service and terminate
        your account before the changes take effect.
      </p>

      {/* ================================================================ */}
      {/*  16. Governing Law & Dispute Resolution                          */}
      {/* ================================================================ */}
      <h2 className={h2}>16. Governing Law &amp; Dispute Resolution</h2>

      <h3 className={h3}>16.1 Governing Law</h3>
      <p className={p}>
        These Terms shall be governed by and construed in accordance with the laws of the Co-operative Republic of
        Guyana, without regard to its conflict of law principles.
      </p>

      <h3 className={h3}>16.2 Informal Resolution</h3>
      <p className={p}>
        Before initiating any formal dispute resolution proceeding, you agree to first attempt to resolve any dispute,
        claim, or controversy arising out of or relating to these Terms or the Service through good-faith negotiation.
        You must send a written notice of the dispute to{" "}
        <a href="mailto:legal@westbridgetoday.com" className="underline text-foreground">
          legal@westbridgetoday.com
        </a>
        , describing the nature of the dispute and the relief sought. Both parties agree to negotiate in good faith for
        a period of at least thirty (30) days from the date the notice is received.
      </p>

      <h3 className={h3}>16.3 Binding Arbitration</h3>
      <p className={p}>
        If the parties are unable to resolve the dispute through informal negotiation within the thirty (30) day period,
        either party may submit the dispute to final and binding arbitration. The arbitration shall be conducted in
        Georgetown, Guyana, in accordance with the applicable arbitration rules and laws of the Co-operative Republic of
        Guyana. The arbitration shall be conducted by a single arbitrator mutually agreed upon by both parties. The
        arbitrator&apos;s decision shall be final and binding, and judgment upon the award may be entered in any court
        of competent jurisdiction.
      </p>

      <h3 className={h3}>16.4 Class Action Waiver</h3>
      <p className={p}>
        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, YOU AND WESTBRIDGE AGREE THAT EACH PARTY MAY BRING CLAIMS
        AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY
        PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION OR PROCEEDING. UNLESS BOTH PARTIES AGREE OTHERWISE IN
        WRITING, THE ARBITRATOR MAY NOT CONSOLIDATE MORE THAN ONE PERSON&apos;S CLAIMS AND MAY NOT OTHERWISE PRESIDE
        OVER ANY FORM OF A CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.
      </p>

      {/* ================================================================ */}
      {/*  17. General Provisions                                          */}
      {/* ================================================================ */}
      <h2 className={h2}>17. General Provisions</h2>

      <h3 className={h3}>17.1 Entire Agreement</h3>
      <p className={p}>
        These Terms, together with the Privacy Policy and any other agreements expressly incorporated by reference
        herein, constitute the entire agreement between you and Westbridge with respect to the subject matter hereof and
        supersede all prior or contemporaneous communications, representations, or agreements, whether oral or written.
      </p>

      <h3 className={h3}>17.2 Severability</h3>
      <p className={p}>
        If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent
        jurisdiction, the remaining provisions shall continue in full force and effect. The invalid or unenforceable
        provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving
        the original intent of the parties.
      </p>

      <h3 className={h3}>17.3 Waiver</h3>
      <p className={p}>
        The failure of Westbridge to enforce any right or provision of these Terms shall not constitute a waiver of such
        right or provision. Any waiver of any provision of these Terms shall be effective only if made in writing and
        signed by an authorized representative of Westbridge.
      </p>

      <h3 className={h3}>17.4 Assignment</h3>
      <p className={p}>
        You may not assign or transfer these Terms or any rights or obligations hereunder without the prior written
        consent of Westbridge. Westbridge may assign these Terms without restriction, including in connection with a
        merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets. Any purported
        assignment in violation of this section shall be null and void. Subject to the foregoing, these Terms shall bind
        and inure to the benefit of the parties and their respective successors and permitted assigns.
      </p>

      <h3 className={h3}>17.5 Force Majeure</h3>
      <p className={p}>
        Neither party shall be liable for any delay or failure in performance resulting from causes beyond its
        reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots,
        embargoes, acts of civil or military authorities, fire, floods, epidemics, pandemics, strikes,
        telecommunications or internet failures, power outages, or government-imposed sanctions or restrictions. The
        affected party shall provide prompt notice to the other party and shall use reasonable efforts to mitigate the
        impact of the force majeure event.
      </p>

      <h3 className={h3}>17.6 Notices</h3>
      <p className={p}>
        All notices required or permitted under these Terms shall be in writing. Notices to Westbridge must be sent to{" "}
        <a href="mailto:legal@westbridgetoday.com" className="underline text-foreground">
          legal@westbridgetoday.com
        </a>
        . Notices to you will be sent to the email address associated with your account. Notices shall be deemed
        received when delivered by email, provided that the sending party does not receive a delivery failure
        notification.
      </p>

      {/* ================================================================ */}
      {/*  18. Contact Information                                         */}
      {/* ================================================================ */}
      <h2 className={h2}>18. Contact Information</h2>
      <p className={p}>
        If you have questions, concerns, or requests regarding these Terms of Service, please contact us using the
        appropriate channel below:
      </p>
      <ul className={ul}>
        <li>
          <strong className={strong}>Legal inquiries:</strong>{" "}
          <a href="mailto:legal@westbridgetoday.com" className="underline text-foreground">
            legal@westbridgetoday.com
          </a>
        </li>
        <li>
          <strong className={strong}>General support:</strong>{" "}
          <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
            support@westbridgetoday.com
          </a>
        </li>
        <li>
          <strong className={strong}>Security concerns:</strong>{" "}
          <a href="mailto:security@westbridgetoday.com" className="underline text-foreground">
            security@westbridgetoday.com
          </a>
        </li>
      </ul>
      <p className={p}>
        Westbridge Inc.
        <br />
        Website:{" "}
        <a
          href="https://westbridgetoday.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-foreground"
        >
          westbridgetoday.com
        </a>
      </p>

      {/* ---- Footer nav ---- */}
      <p className="text-sm text-muted-foreground mt-12">
        <Link href={ROUTES.home} className="text-foreground transition-colors hover:opacity-100">
          Back to home
        </Link>
        {" · "}
        <Link href={ROUTES.privacy} className="text-foreground transition-colors hover:opacity-100">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

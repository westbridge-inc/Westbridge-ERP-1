export const revalidate = 3600;
import Link from "next/link";
import { ROUTES } from "@/lib/config/site";

export const metadata = {
  title: "Privacy Policy | Westbridge",
  description:
    "How Westbridge Inc. collects, uses, stores, and protects your personal information when you use Westbridge ERP.",
  openGraph: {
    title: "Privacy Policy | Westbridge",
    description:
      "How Westbridge Inc. collects, uses, stores, and protects your personal information when you use Westbridge ERP.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-prose mx-auto py-16 px-6">
      <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 3, 2026</p>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Introduction & Scope                                            */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">1. Introduction &amp; Scope</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        Westbridge Inc. (<strong className="text-foreground font-medium">&quot;Westbridge,&quot;</strong>{" "}
        <strong className="text-foreground font-medium">&quot;we,&quot;</strong>{" "}
        <strong className="text-foreground font-medium">&quot;us,&quot;</strong> or{" "}
        <strong className="text-foreground font-medium">&quot;our&quot;</strong>) is the data controller responsible for
        the personal data processed through Westbridge ERP (the{" "}
        <strong className="text-foreground font-medium">&quot;Service&quot;</strong>), our website at{" "}
        <Link href="https://westbridgetoday.com" className="underline text-foreground">
          westbridgetoday.com
        </Link>
        , and any related communications, applications, or services we operate.
      </p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        This Privacy Policy explains how we collect, use, disclose, retain, and protect your personal information. It
        applies to all individuals who visit our website, create an account, subscribe to the Service, or otherwise
        interact with us. By accessing or using the Service, you acknowledge that you have read and understood this
        Privacy Policy.
      </p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        This Privacy Policy does not apply to any third-party websites, applications, or services that may be linked
        from or integrated with the Service. We encourage you to review the privacy practices of any third-party service
        before providing your personal information.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Information We Collect                                          */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">2. Information We Collect</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We collect personal information through three primary channels: directly from you, automatically through your
        use of the Service, and from third parties.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">2a. Information You Provide Directly</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Account Information:</strong> When you create an account, we
          collect your name, email address, company name, job title, phone number, country, and time zone.
        </li>
        <li>
          <strong className="text-foreground font-medium">Billing Information:</strong> Payment details (such as credit
          card number, billing address, and VAT identification number) are collected and processed by our payment
          provider, Paddle. We do not directly store your full payment card details on our servers.
        </li>
        <li>
          <strong className="text-foreground font-medium">Customer Data:</strong> Any business data you enter, upload,
          or generate within the Service, including but not limited to invoices, purchase orders, inventory records,
          employee records, accounting entries, and customer relationship management data (collectively,{" "}
          <strong className="text-foreground font-medium">&quot;Customer Data&quot;</strong>
          ). You are the data controller of your Customer Data; we process it on your behalf as a data processor.
        </li>
        <li>
          <strong className="text-foreground font-medium">Communications:</strong> When you contact our support team,
          submit feedback, participate in surveys, or otherwise communicate with us, we collect the content of those
          communications along with associated metadata.
        </li>
        <li>
          <strong className="text-foreground font-medium">Team Member Information:</strong> If you invite team members
          to your organization within the Service, we collect their name, email address, and assigned role as provided
          by the account administrator.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">2b. Information Collected Automatically</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Usage Data:</strong> We collect anonymized and aggregated
          product usage analytics through PostHog, including pages visited, features used, click paths, session
          duration, and interaction patterns. This data helps us improve the Service.
        </li>
        <li>
          <strong className="text-foreground font-medium">Device &amp; Browser Information:</strong> We automatically
          collect your IP address, browser type and version, operating system, screen resolution, language preference,
          and referring URL.
        </li>
        <li>
          <strong className="text-foreground font-medium">Log Data:</strong> Our servers automatically record
          information about each request, including timestamps, request method, endpoint accessed, response status code,
          and request duration.
        </li>
        <li>
          <strong className="text-foreground font-medium">Cookies &amp; Similar Technologies:</strong> We use essential
          cookies and similar technologies to authenticate sessions, prevent cross-site request forgery, and remember
          your preferences. See Section 10 for full details.
        </li>
        <li>
          <strong className="text-foreground font-medium">Performance &amp; Error Monitoring:</strong> We use Sentry to
          collect error reports and performance data, which may include stack traces, browser environment details, and
          the sequence of user actions leading to an error.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">2c. Information From Third Parties</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Paddle:</strong> Our payment provider may share transaction
          confirmation, subscription status, billing country, and tax identifiers with us to manage your subscription.
        </li>
        <li>
          <strong className="text-foreground font-medium">Single Sign-On (SSO) Providers:</strong> If you choose to
          authenticate through a third-party SSO provider, we receive your name, email address, and profile picture as
          authorized by your SSO settings.
        </li>
        <li>
          <strong className="text-foreground font-medium">ERPNext:</strong> If you connect an existing ERPNext instance
          to the Service, we may receive data from that instance as necessary to provide the integration functionality
          you have configured.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 3. How We Use Your Information                                     */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">3. How We Use Your Information</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We use the information we collect for the following purposes:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Providing the Service:</strong> To create and manage your
          account, authenticate your identity, deliver the features and functionality of the Service, and provide
          technical support.
        </li>
        <li>
          <strong className="text-foreground font-medium">Processing Payments:</strong> To process subscription
          payments, issue invoices, manage billing cycles, handle refunds, and comply with tax obligations through our
          payment provider, Paddle.
        </li>
        <li>
          <strong className="text-foreground font-medium">Communications:</strong> To send you transactional emails
          (such as account verification, password resets, billing receipts, and service alerts), respond to support
          requests, and provide product updates.
        </li>
        <li>
          <strong className="text-foreground font-medium">Improvement &amp; Analytics:</strong> To analyze usage
          patterns, diagnose technical issues, measure feature adoption, conduct A/B testing, and improve the
          performance, reliability, and usability of the Service.
        </li>
        <li>
          <strong className="text-foreground font-medium">Security:</strong> To detect, prevent, and respond to fraud,
          abuse, security incidents, and technical issues. This includes monitoring for unauthorized access, enforcing
          rate limits, and maintaining audit logs.
        </li>
        <li>
          <strong className="text-foreground font-medium">AI Features:</strong> The Service includes AI-powered features
          (such as Bridge AI) that process your queries and relevant business context to generate responses. Your data
          processed by AI features is used solely to provide the requested functionality and is{" "}
          <strong className="text-foreground font-medium">
            not used to train, fine-tune, or improve any machine learning models
          </strong>
          , whether by Westbridge or by our AI sub-processor (Anthropic).
        </li>
        <li>
          <strong className="text-foreground font-medium">Legal Obligations:</strong> To comply with applicable laws,
          regulations, legal processes, or enforceable governmental requests, including tax reporting, data protection
          obligations, and responding to lawful subpoenas or court orders.
        </li>
        <li>
          <strong className="text-foreground font-medium">Marketing:</strong> To send you marketing communications about
          new features, product updates, promotions, or events{" "}
          <strong className="text-foreground font-medium">only with your prior opt-in consent</strong>. You may withdraw
          your consent at any time by clicking the unsubscribe link in any marketing email or by contacting us.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Legal Bases for Processing (GDPR)                               */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">4. Legal Bases for Processing (GDPR)</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        If you are located in the European Economic Area (EEA), the United Kingdom (UK), or Switzerland, we rely on the
        following legal bases under the General Data Protection Regulation (GDPR) to process your personal data:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Performance of a Contract:</strong> Processing is necessary to
          perform our contract with you, including providing the Service, managing your account, processing payments,
          and delivering customer support.
        </li>
        <li>
          <strong className="text-foreground font-medium">Legitimate Interests:</strong> Processing is necessary for our
          legitimate interests, provided those interests are not overridden by your data protection rights. Our
          legitimate interests include improving the Service, ensuring security, preventing fraud, conducting analytics,
          and communicating with you about your account.
        </li>
        <li>
          <strong className="text-foreground font-medium">Consent:</strong> Where we rely on your consent (for example,
          for marketing communications or optional analytics), you have the right to withdraw your consent at any time.
          Withdrawal of consent does not affect the lawfulness of processing that occurred before the withdrawal.
        </li>
        <li>
          <strong className="text-foreground font-medium">Legal Obligation:</strong> Processing is necessary to comply
          with a legal obligation to which we are subject, such as tax reporting, regulatory compliance, and responding
          to lawful requests from public authorities.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 5. How We Share Your Information                                   */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">5. How We Share Your Information</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We share your personal information only in the following circumstances and only to the extent necessary:
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Sub-Processors</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We engage the following categories of sub-processors to deliver the Service:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Paddle</strong> &mdash; Payment processing, subscription
          management, tax compliance, and invoicing.
        </li>
        <li>
          <strong className="text-foreground font-medium">Resend</strong> &mdash; Transactional and marketing email
          delivery.
        </li>
        <li>
          <strong className="text-foreground font-medium">Anthropic</strong> &mdash; AI query processing for Bridge AI
          features. Anthropic processes data under a zero-retention API agreement and does not use your data for model
          training.
        </li>
        <li>
          <strong className="text-foreground font-medium">Sentry</strong> &mdash; Application error monitoring and
          performance tracking.
        </li>
        <li>
          <strong className="text-foreground font-medium">PostHog</strong> &mdash; Product analytics and feature usage
          tracking.
        </li>
        <li>
          <strong className="text-foreground font-medium">Cloud Infrastructure Providers</strong> &mdash; Hosting,
          storage, database management, and content delivery. All infrastructure providers maintain SOC 2 Type II or
          equivalent certifications.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">Legal Requirements</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We may disclose your personal information if required to do so by law or in good faith belief that such
        disclosure is necessary to comply with a legal obligation, protect and defend our rights or property, prevent
        fraud, protect the personal safety of users or the public, or respond to a lawful request by public authorities
        (including national security or law enforcement).
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Business Transfers</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets,
        your personal information may be transferred as part of that transaction. We will notify you via email and/or a
        prominent notice on our website of any change in ownership or uses of your personal information, as well as any
        choices you may have regarding your personal information.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">What We Do Not Do</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">To be clear about our practices:</p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          We do <strong className="text-foreground font-medium">not sell</strong> your personal data to any third party,
          for any purpose, under any circumstance.
        </li>
        <li>
          We do <strong className="text-foreground font-medium">not share your data with advertisers</strong> or ad
          networks.
        </li>
        <li>
          We do{" "}
          <strong className="text-foreground font-medium">
            not use your data to train AI or machine learning models
          </strong>
          .
        </li>
        <li>
          We do{" "}
          <strong className="text-foreground font-medium">not share Customer Data between different customers</strong>.
          Each organization&apos;s data is logically isolated.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 6. Data Retention                                                  */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">6. Data Retention</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We retain your personal information only for as long as necessary to fulfill the purposes described in this
        Privacy Policy, unless a longer retention period is required or permitted by law. The following retention
        periods apply:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Account Data:</strong> Retained for the duration of your
          active subscription plus 30 days after cancellation or termination to allow for reactivation and to resolve
          any outstanding matters.
        </li>
        <li>
          <strong className="text-foreground font-medium">Customer Data:</strong> Upon account cancellation or
          termination, your Customer Data is available for self-service export for 30 days. After the 30-day period,
          Customer Data is permanently deleted from our production systems and purged from backups within 90 days.
        </li>
        <li>
          <strong className="text-foreground font-medium">Billing Records:</strong> Retained for 7 years in accordance
          with applicable tax and accounting regulations.
        </li>
        <li>
          <strong className="text-foreground font-medium">Audit Logs:</strong> System and security audit logs are
          retained for 2 years to support security investigations, compliance requirements, and dispute resolution.
        </li>
        <li>
          <strong className="text-foreground font-medium">Analytics Data:</strong> Aggregated and anonymized analytics
          data (which cannot be used to identify any individual) may be retained indefinitely to inform long-term
          product development.
        </li>
        <li>
          <strong className="text-foreground font-medium">Support Communications:</strong> Records of support
          interactions are retained for 3 years after the last communication to provide consistent support and for
          quality assurance.
        </li>
        <li>
          <strong className="text-foreground font-medium">Marketing Consent Records:</strong> Records of your marketing
          consent (or withdrawal thereof) are retained for the period your consent is valid plus 3 years to demonstrate
          compliance with applicable consent requirements.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 7. Data Security                                                   */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">7. Data Security</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We implement and maintain appropriate technical and organizational measures to protect the confidentiality,
        integrity, and availability of your personal information. These measures include, but are not limited to:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Encryption at Rest:</strong> All data at rest is encrypted
          using AES-256 encryption.
        </li>
        <li>
          <strong className="text-foreground font-medium">Encryption in Transit:</strong> All data transmitted between
          your device and our servers is encrypted using TLS 1.2 or higher.
        </li>
        <li>
          <strong className="text-foreground font-medium">Password Security:</strong> User passwords are hashed using
          bcrypt with a minimum of 12 salt rounds. We never store passwords in plaintext.
        </li>
        <li>
          <strong className="text-foreground font-medium">Access Control:</strong> We enforce role-based access control
          (RBAC) throughout the Service. Access to production systems is restricted to authorized personnel on a
          need-to-know basis.
        </li>
        <li>
          <strong className="text-foreground font-medium">Multi-Factor Authentication:</strong> MFA is available for all
          user accounts and is required for administrative access to production systems.
        </li>
        <li>
          <strong className="text-foreground font-medium">Infrastructure Security:</strong> Our infrastructure is hosted
          in SOC 2 Type II certified data centers with physical access controls, redundant power, and network security
          measures.
        </li>
        <li>
          <strong className="text-foreground font-medium">Continuous Monitoring:</strong> We employ continuous
          monitoring of our systems for security anomalies, unauthorized access attempts, and potential vulnerabilities.
        </li>
        <li>
          <strong className="text-foreground font-medium">Breach Notification:</strong> In the event of a personal data
          breach that is likely to result in a risk to your rights and freedoms, we will notify affected users and the
          relevant supervisory authority within 72 hours of becoming aware of the breach, as required by applicable law.
        </li>
        <li>
          <strong className="text-foreground font-medium">Employee Access:</strong> All employee access to systems
          containing personal data is logged and auditable. Employees are bound by confidentiality obligations and
          receive regular security training.
        </li>
        <li>
          <strong className="text-foreground font-medium">Penetration Testing:</strong> We conduct regular penetration
          testing and vulnerability assessments of our systems and applications to identify and remediate potential
          security issues.
        </li>
      </ul>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        While we take reasonable measures to protect your personal information, no method of transmission over the
        internet or electronic storage is completely secure. We cannot guarantee absolute security.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 8. International Data Transfers                                    */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">8. International Data Transfers</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        Your personal information may be transferred to, stored in, and processed in countries other than the country in
        which it was collected. These countries may have data protection laws that differ from the laws of your country.
      </p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        Where we transfer personal data from the European Economic Area (EEA), the United Kingdom (UK), or Switzerland
        to countries that have not been deemed to provide an adequate level of data protection, we rely on the European
        Commission&apos;s Standard Contractual Clauses (SCCs) &mdash; including the UK International Data Transfer
        Addendum where applicable &mdash; to ensure that appropriate safeguards are in place to protect your personal
        data.
      </p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        For transfers to jurisdictions outside the EEA, UK, and Switzerland, we implement appropriate safeguards as
        required by applicable data protection laws, which may include binding corporate rules, approved codes of
        conduct, or other recognized transfer mechanisms. You may request a copy of the safeguards we have put in place
        by contacting us at{" "}
        <a href="mailto:privacy@westbridgetoday.com" className="underline text-foreground">
          privacy@westbridgetoday.com
        </a>
        .
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 9. Your Rights                                                     */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">9. Your Rights</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        Depending on your location and applicable law, you may have certain rights with respect to your personal
        information. We are committed to honoring these rights regardless of where you reside, to the extent
        practicable.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Rights Available to All Users</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Access:</strong> The right to request a copy of the personal
          information we hold about you.
        </li>
        <li>
          <strong className="text-foreground font-medium">Correction:</strong> The right to request correction of
          inaccurate or incomplete personal information.
        </li>
        <li>
          <strong className="text-foreground font-medium">Deletion:</strong> The right to request deletion of your
          personal information, subject to certain exceptions (such as legal retention obligations).
        </li>
        <li>
          <strong className="text-foreground font-medium">Portability:</strong> The right to receive your personal
          information in a structured, commonly used, and machine-readable format.
        </li>
        <li>
          <strong className="text-foreground font-medium">Objection:</strong> The right to object to our processing of
          your personal information in certain circumstances.
        </li>
        <li>
          <strong className="text-foreground font-medium">Restriction:</strong> The right to request that we restrict
          the processing of your personal information in certain circumstances.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">Additional Rights Under GDPR (EEA, UK, Switzerland)</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Withdraw Consent:</strong> Where processing is based on
          consent, you have the right to withdraw your consent at any time without affecting the lawfulness of
          processing performed prior to withdrawal.
        </li>
        <li>
          <strong className="text-foreground font-medium">Supervisory Authority:</strong> You have the right to lodge a
          complaint with your local data protection supervisory authority if you believe that our processing of your
          personal data violates applicable data protection law.
        </li>
        <li>
          <strong className="text-foreground font-medium">Automated Decision-Making:</strong> You have the right not to
          be subject to a decision based solely on automated processing, including profiling, which produces legal
          effects concerning you or similarly significantly affects you. We do not currently engage in solely automated
          decision-making that produces legal effects.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">Additional Rights Under CCPA/CPRA (California Residents)</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Right to Know:</strong> You have the right to request that we
          disclose the categories and specific pieces of personal information we have collected about you, the
          categories of sources, the business or commercial purpose for collecting your personal information, and the
          categories of third parties with whom we share it.
        </li>
        <li>
          <strong className="text-foreground font-medium">Right to Delete:</strong> You have the right to request
          deletion of the personal information we have collected from you, subject to certain exceptions.
        </li>
        <li>
          <strong className="text-foreground font-medium">Right to Opt-Out of Sale:</strong> We do not sell your
          personal information. As such, there is no need to opt out. If our practices change in the future, we will
          provide a &quot;Do Not Sell My Personal Information&quot; mechanism.
        </li>
        <li>
          <strong className="text-foreground font-medium">Right to Non-Discrimination:</strong> We will not discriminate
          against you for exercising any of your CCPA rights, including by denying you goods or services, charging you a
          different price, or providing a different level of quality.
        </li>
        <li>
          <strong className="text-foreground font-medium">Right to Correct:</strong> You have the right to request that
          we correct inaccurate personal information we maintain about you.
        </li>
        <li>
          <strong className="text-foreground font-medium">Right to Limit Use of Sensitive Personal Information:</strong>{" "}
          We do not use or disclose sensitive personal information for purposes other than those permitted under the
          CPRA.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">How to Exercise Your Rights</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        You may exercise your rights through the following methods:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Self-Service Export:</strong> You can export your Customer
          Data and account information at any time through the data export feature available in your account settings.
        </li>
        <li>
          <strong className="text-foreground font-medium">Email:</strong> Submit a request to{" "}
          <a href="mailto:privacy@westbridgetoday.com" className="underline text-foreground">
            privacy@westbridgetoday.com
          </a>
          . Please include sufficient information for us to verify your identity and specify the right you wish to
          exercise.
        </li>
        <li>
          <strong className="text-foreground font-medium">Response Time:</strong> We will respond to all verifiable
          requests within 30 days of receipt. If we require additional time (up to a further 60 days), we will inform
          you of the reason and the expected completion date.
        </li>
      </ul>

      {/* ------------------------------------------------------------------ */}
      {/* 10. Cookies & Tracking                                             */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">10. Cookies &amp; Tracking</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We use a limited number of cookies that are strictly necessary for the operation of the Service. Below is a
        complete list of the cookies we set:
      </p>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-[15px] text-muted-foreground border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-medium text-foreground">Cookie Name</th>
              <th className="py-2 pr-4 text-left font-medium text-foreground">Purpose</th>
              <th className="py-2 pr-4 text-left font-medium text-foreground">Duration</th>
              <th className="py-2 text-left font-medium text-foreground">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono text-sm">westbridge_sid</td>
              <td className="py-2 pr-4">Session authentication</td>
              <td className="py-2 pr-4">7 days</td>
              <td className="py-2">Essential</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono text-sm">westbridge_csrf</td>
              <td className="py-2 pr-4">Cross-site request forgery protection</td>
              <td className="py-2 pr-4">Session</td>
              <td className="py-2">Essential</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono text-sm">westbridge_logged_in</td>
              <td className="py-2 pr-4">Client-side login state indicator</td>
              <td className="py-2 pr-4">Session</td>
              <td className="py-2">Essential</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono text-sm">westbridge_consent</td>
              <td className="py-2 pr-4">Stores your cookie consent preferences</td>
              <td className="py-2 pr-4">1 year</td>
              <td className="py-2">Essential</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold mt-6 mb-2">Analytics &amp; Monitoring</h3>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">PostHog:</strong> We use PostHog for product analytics.
          PostHog may set its own cookies for session tracking. Analytics data is used in aggregate to improve the
          Service.
        </li>
        <li>
          <strong className="text-foreground font-medium">Sentry:</strong> We use Sentry for error monitoring and
          performance tracking. Sentry may process limited session data when errors occur.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">What We Do Not Use</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We do <strong className="text-foreground font-medium">not</strong> use advertising cookies, third-party tracking
        pixels, social media tracking widgets, browser fingerprinting techniques, or any other technology designed to
        track you across websites for advertising purposes.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Do Not Track</h3>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We honor Do Not Track (DNT) signals sent by your browser. When we detect a DNT signal, we disable non-essential
        analytics tracking for your session.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 11. Children's Privacy                                             */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">11. Children&apos;s Privacy</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        The Service is designed for business use and is not intended for individuals under the age of 18. We do not
        knowingly collect, solicit, or maintain personal information from anyone under 18 years of age. If we become
        aware that we have collected personal information from a child under 18, we will take prompt steps to delete
        that information from our systems. If you believe that we may have collected personal information from a child
        under 18, please contact us at{" "}
        <a href="mailto:privacy@westbridgetoday.com" className="underline text-foreground">
          privacy@westbridgetoday.com
        </a>
        .
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 12. Changes to This Policy                                         */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">12. Changes to This Policy</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal
        requirements, or other factors. When we make changes, we will update the &quot;Last updated&quot; date at the
        top of this page.
      </p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        For material changes that significantly affect how we collect, use, or share your personal information, we will
        provide at least <strong className="text-foreground font-medium">30 days&apos; advance notice</strong> before
        the changes take effect. Notice will be provided via email to the address associated with your account and/or
        through a prominent notice within the Service.
      </p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        Previous versions of this Privacy Policy are available upon request. To obtain a prior version, please contact
        us at{" "}
        <a href="mailto:privacy@westbridgetoday.com" className="underline text-foreground">
          privacy@westbridgetoday.com
        </a>
        .
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* 13. Contact Us                                                     */}
      {/* ------------------------------------------------------------------ */}
      <h2 className="text-xl font-semibold mt-10 mb-3">13. Contact Us</h2>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please
        contact us through one of the following channels:
      </p>
      <ul className="text-[15px] text-muted-foreground list-disc pl-6 space-y-2">
        <li>
          <strong className="text-foreground font-medium">Privacy Inquiries:</strong>{" "}
          <a href="mailto:privacy@westbridgetoday.com" className="underline text-foreground">
            privacy@westbridgetoday.com
          </a>
        </li>
        <li>
          <strong className="text-foreground font-medium">Data Protection Officer:</strong>{" "}
          <a href="mailto:dpo@westbridgetoday.com" className="underline text-foreground">
            dpo@westbridgetoday.com
          </a>
        </li>
        <li>
          <strong className="text-foreground font-medium">General Support:</strong>{" "}
          <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
            support@westbridgetoday.com
          </a>
        </li>
        <li>
          <strong className="text-foreground font-medium">Mailing Address:</strong> Westbridge Inc., [Physical Address
          to be Updated], [City, State, ZIP]
        </li>
      </ul>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">
        For GDPR-related inquiries, you may also contact our Data Protection Officer directly. We will make every effort
        to resolve your concerns promptly. If you are not satisfied with our response, you have the right to lodge a
        complaint with the relevant data protection supervisory authority in your jurisdiction.
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* Footer links                                                       */}
      {/* ------------------------------------------------------------------ */}
      <p className="mt-12 text-sm text-muted-foreground">
        <Link href={ROUTES.home} className="text-foreground transition-colors hover:opacity-100">
          Back to home
        </Link>
        {" · "}
        <Link href={ROUTES.terms} className="text-foreground transition-colors hover:opacity-100">
          Terms of Service
        </Link>
      </p>
    </div>
  );
}

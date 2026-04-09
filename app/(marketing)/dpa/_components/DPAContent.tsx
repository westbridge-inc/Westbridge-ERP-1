import Link from "next/link";
import { ROUTES } from "@/lib/config/site";

const h2 = "text-xl font-semibold mt-10 mb-3";
const p = "text-[15px] text-muted-foreground leading-relaxed mb-4";
const ul = "text-[15px] text-muted-foreground list-disc pl-6 space-y-2 mb-4";
const strong = "text-foreground font-medium";

export function DPAContent() {
  return (
    <div className="max-w-prose mx-auto py-16 px-6">
      {/* ---- Header ---- */}
      <h1 className="text-3xl font-display font-bold mb-2">Data Processing Agreement</h1>
      <p className="text-sm text-muted-foreground mb-2">Last updated: April 8, 2026</p>
      <p className="text-sm text-muted-foreground mb-8">Effective date: April 8, 2026</p>

      <p className={p}>
        This Data Processing Agreement (&quot;<strong className={strong}>DPA</strong>&quot;) forms part of the agreement
        between you (&quot;<strong className={strong}>Customer</strong>&quot;, &quot;
        <strong className={strong}>Controller</strong>&quot;) and <strong className={strong}>Westbridge Inc.</strong>{" "}
        (&quot;<strong className={strong}>Westbridge</strong>&quot;, &quot;<strong className={strong}>Processor</strong>
        &quot;) governing the processing of personal data on your behalf in connection with the Westbridge ERP platform
        (the &quot;<strong className={strong}>Service</strong>
        &quot;) and is incorporated by reference into our{" "}
        <Link href={ROUTES.terms} className="underline text-foreground">
          Terms of Service
        </Link>
        .
      </p>
      <p className={p}>
        This DPA is intended to satisfy Article 28 of the EU General Data Protection Regulation (Regulation (EU)
        2016/679, &quot;<strong className={strong}>GDPR</strong>&quot;) and the UK GDPR. Capitalised terms not defined
        here have the meanings given in the GDPR or in the Terms of Service.
      </p>

      {/* ================================================================ */}
      {/*  1. Roles of the Parties                                        */}
      {/* ================================================================ */}
      <h2 className={h2}>1. Roles of the Parties</h2>
      <p className={p}>
        With respect to Customer Personal Data submitted to the Service by or on behalf of Customer ( &quot;
        <strong className={strong}>Customer Personal Data</strong>&quot;), the parties acknowledge that:
      </p>
      <ul className={ul}>
        <li>
          Customer is the <strong className={strong}>Controller</strong>;
        </li>
        <li>
          Westbridge is the <strong className={strong}>Processor</strong>; and
        </li>
        <li>
          Westbridge engages <strong className={strong}>Sub-processors</strong> under Section 6 to assist in providing
          the Service.
        </li>
      </ul>
      <p className={p}>
        Each party will comply with its respective obligations under applicable Data Protection Law in connection with
        the processing of Customer Personal Data.
      </p>

      {/* ================================================================ */}
      {/*  2. Scope and Subject Matter                                     */}
      {/* ================================================================ */}
      <h2 className={h2}>2. Scope, Subject Matter, and Duration</h2>
      <p className={p}>
        The <strong className={strong}>subject matter</strong> of the processing is Westbridge&apos;s provision of the
        Service to Customer. The <strong className={strong}>nature and purpose</strong> of the processing is to host,
        store, transmit, analyse and otherwise process Customer Personal Data as necessary to deliver the features of
        the Service that Customer has chosen to use.
      </p>
      <p className={p}>
        The <strong className={strong}>duration</strong> of the processing is the term of the Terms of Service plus the
        post-termination retention period set out in Section 9.
      </p>
      <p className={p}>
        The <strong className={strong}>categories of data subjects</strong> may include Customer&apos;s employees,
        contractors, customers, suppliers, and other individuals whose data Customer chooses to upload to or generate
        within the Service.
      </p>
      <p className={p}>
        The <strong className={strong}>categories of personal data</strong> processed depend on which modules Customer
        uses and may include: identification data (name, email, phone), employment data, financial data (invoices,
        payments, expense reports), authentication data, IP addresses, audit log entries, and any data Customer
        voluntarily uploads or enters into the Service.
      </p>

      {/* ================================================================ */}
      {/*  3. Customer Instructions                                        */}
      {/* ================================================================ */}
      <h2 className={h2}>3. Customer Instructions</h2>
      <p className={p}>
        Westbridge will process Customer Personal Data only on documented instructions from Customer, including the
        instructions set out in the Terms of Service, this DPA, the in-product configuration Customer chooses, and any
        further written instructions Customer provides through Westbridge support or a designated account manager —
        unless required to do otherwise by EU, EU member-state, UK, or other applicable law to which Westbridge is
        subject. In such a case, Westbridge will inform Customer of that legal requirement before processing, unless the
        law prohibits doing so on important grounds of public interest.
      </p>
      <p className={p}>
        Westbridge will inform Customer if, in its opinion, an instruction from Customer infringes applicable Data
        Protection Law.
      </p>

      {/* ================================================================ */}
      {/*  4. Confidentiality                                              */}
      {/* ================================================================ */}
      <h2 className={h2}>4. Confidentiality</h2>
      <p className={p}>
        Westbridge ensures that any person authorised to process Customer Personal Data is bound by an appropriate
        obligation of confidentiality (whether contractual or statutory). Access to Customer Personal Data is limited to
        personnel who require it to perform their duties in connection with the Service.
      </p>

      {/* ================================================================ */}
      {/*  5. Security Measures                                            */}
      {/* ================================================================ */}
      <h2 className={h2}>5. Security Measures</h2>
      <p className={p}>
        Westbridge implements and maintains appropriate technical and organisational measures to protect Customer
        Personal Data against accidental or unlawful destruction, loss, alteration, unauthorised disclosure, or access —
        taking into account the state of the art, the costs of implementation, the nature, scope, context, and purposes
        of processing, and the risks to data subjects (Article 32 GDPR). These measures include, without limitation:
      </p>
      <ul className={ul}>
        <li>
          <strong className={strong}>Encryption at rest</strong> using AES-256-GCM with per-record additional
          authenticated data (AAD) binding;
        </li>
        <li>
          <strong className={strong}>Encryption in transit</strong> using TLS 1.2 or higher between client and Service,
          and between the Service and its sub-processors;
        </li>
        <li>
          <strong className={strong}>Tenant isolation</strong> through row-level scoping by tenant identifier, enforced
          at the database, application, and API layers;
        </li>
        <li>
          <strong className={strong}>Access controls</strong> including SSO, mandatory two-factor authentication for
          privileged personnel, the principle of least privilege, and short-lived session tokens;
        </li>
        <li>
          <strong className={strong}>Audit logging</strong> of authentication, authorisation, and data-access events,
          retained for a minimum of one year;
        </li>
        <li>
          <strong className={strong}>Vulnerability management</strong> including regular dependency updates, automated
          security testing in CI, and a documented response process for reported vulnerabilities;
        </li>
        <li>
          <strong className={strong}>Backup and disaster recovery</strong> with daily encrypted backups and documented
          restore procedures; and
        </li>
        <li>
          <strong className={strong}>Personnel security</strong> including background checks where permitted by law,
          security training, and contractual confidentiality obligations.
        </li>
      </ul>
      <p className={p}>
        Westbridge will review these measures periodically and may update them so long as the updated measures do not
        diminish the level of protection.
      </p>

      {/* ================================================================ */}
      {/*  6. Sub-Processors                                               */}
      {/* ================================================================ */}
      <h2 className={h2}>6. Sub-Processors</h2>
      <p className={p}>
        Customer provides general written authorisation for Westbridge to engage sub-processors to provide parts of the
        Service. The current list of sub-processors is set out in Section 8.2 of the Terms of Service and in Section 5
        of the Privacy Policy and is incorporated here by reference.
      </p>
      <p className={p}>
        Where Westbridge engages a sub-processor, Westbridge will impose contractual data-protection obligations on the
        sub-processor that are no less protective than those set out in this DPA, including the security obligations of
        Section 5 above. Westbridge remains responsible to Customer for the acts and omissions of its sub-processors
        with respect to Customer Personal Data.
      </p>
      <p className={p}>
        Westbridge will provide Customer with at least{" "}
        <strong className={strong}>thirty (30) days&apos; advance notice</strong> before engaging any new sub-processor
        that processes Customer Personal Data, by updating the sub-processor list and (where Customer has subscribed to
        in-product or email notifications) sending a notice to the account&apos;s administrator email. Customer may
        object to the new sub-processor on reasonable data-protection grounds within that notice period. If Customer
        objects, the parties will work together in good faith to resolve the objection; if no resolution is reached,
        Customer&apos;s sole remedy is to terminate the affected portions of the Service without penalty for the unused
        portion of any prepaid term.
      </p>

      {/* ================================================================ */}
      {/*  7. Data Subject Rights                                          */}
      {/* ================================================================ */}
      <h2 className={h2}>7. Data Subject Rights</h2>
      <p className={p}>
        Taking into account the nature of the processing, Westbridge will assist Customer by appropriate technical and
        organisational measures, insofar as this is possible, to fulfil Customer&apos;s obligation to respond to data
        subject requests under Articles 12&ndash;22 GDPR (rights of access, rectification, erasure, restriction,
        portability, objection, and not to be subject to automated decision-making).
      </p>
      <p className={p}>
        The Service includes self-service tools that enable Customer to retrieve, export, correct, and delete Customer
        Personal Data without requiring intervention by Westbridge. Where a data subject contacts Westbridge directly
        with a request relating to Customer Personal Data, Westbridge will, unless legally prohibited, promptly forward
        the request to Customer and not respond to the data subject directly except to confirm receipt and identify
        Customer as the responsible Controller.
      </p>

      {/* ================================================================ */}
      {/*  8. Personal Data Breaches                                       */}
      {/* ================================================================ */}
      <h2 className={h2}>8. Personal Data Breaches</h2>
      <p className={p}>
        Westbridge will notify Customer without undue delay, and in any event within{" "}
        <strong className={strong}>seventy-two (72) hours</strong> of becoming aware, of any{" "}
        <strong className={strong}>Personal Data Breach</strong> (as defined in Article 4(12) GDPR) affecting Customer
        Personal Data. The notification will include, to the extent then known:
      </p>
      <ul className={ul}>
        <li>
          the nature of the breach, the categories and approximate number of data subjects concerned, and the categories
          and approximate number of personal data records concerned;
        </li>
        <li>
          the name and contact details of the Westbridge data protection contact from whom further information can be
          obtained;
        </li>
        <li>the likely consequences of the breach; and</li>
        <li>
          the measures taken or proposed to be taken to address the breach, including, where appropriate, measures to
          mitigate its possible adverse effects.
        </li>
      </ul>
      <p className={p}>
        Where it is not possible to provide all this information at the same time, the information may be provided in
        phases without undue further delay. Westbridge will reasonably cooperate with Customer in connection with
        Customer&apos;s notification obligations to its supervisory authority and affected data subjects.
      </p>

      {/* ================================================================ */}
      {/*  9. Deletion and Return of Customer Data                         */}
      {/* ================================================================ */}
      <h2 className={h2}>9. Deletion and Return of Customer Personal Data</h2>
      <p className={p}>
        On termination or expiry of the Terms of Service, and at Customer&apos;s choice, Westbridge will{" "}
        <strong className={strong}>delete or return</strong> all Customer Personal Data, and delete existing copies,
        unless EU, EU member-state, UK or other applicable law requires the storage of the data.
      </p>
      <p className={p}>
        Specifically, on termination Customer has a <strong className={strong}>thirty (30) day grace period</strong>{" "}
        during which it may export Customer Personal Data through the in-product export tool. After the grace period,
        Westbridge will permanently delete Customer Personal Data from production systems and purge it from backups
        within ninety (90) days, except for audit log entries that have been anonymised in place to remove personal data
        and that are retained for security history under SOC 2 / GRA requirements.
      </p>

      {/* ================================================================ */}
      {/*  10. Audits and Inspections                                      */}
      {/* ================================================================ */}
      <h2 className={h2}>10. Audits and Inspections</h2>
      <p className={p}>
        Westbridge will make available to Customer all information reasonably necessary to demonstrate compliance with
        the obligations of this DPA and Article 28 GDPR, and will allow for and contribute to audits, including
        inspections, conducted by Customer or another auditor mandated by Customer.
      </p>
      <p className={p}>
        In the ordinary course, Westbridge satisfies these obligations by providing Customer, on written request, with
        the most recent version of its security and compliance documentation (including, where available, third-party
        attestations such as SOC 2 reports, penetration test summaries, and the security measures described in Section
        5). On-site audits will only be required where Customer reasonably believes that the documentation is
        insufficient to demonstrate compliance. Any on-site audit will be conducted on reasonable advance written
        notice, during normal business hours, no more than once per twelve-month period (except where required by a
        supervisory authority or following a confirmed Personal Data Breach), and subject to the auditor signing
        Westbridge&apos;s standard confidentiality undertaking.
      </p>

      {/* ================================================================ */}
      {/*  11. International Transfers                                     */}
      {/* ================================================================ */}
      <h2 className={h2}>11. International Transfers</h2>
      <p className={p}>
        Westbridge may transfer Customer Personal Data to, and process Customer Personal Data in, countries other than
        the country in which it was originally collected, including to its sub-processors located outside the European
        Economic Area (EEA), the United Kingdom, or Switzerland.
      </p>
      <p className={p}>
        Where Customer Personal Data originating in the EEA, the UK, or Switzerland is transferred to a country that has
        not been recognised by the European Commission (or, as applicable, the UK Information Commissioner&apos;s Office
        or the Swiss Federal Data Protection and Information Commissioner) as providing an adequate level of protection,
        the parties agree that the transfer will be governed by the{" "}
        <strong className={strong}>Standard Contractual Clauses</strong> adopted by the European Commission in
        Implementing Decision (EU) 2021/914 of 4 June 2021 (Module Two: Controller-to-Processor) (the &quot;EU
        SCCs&quot;), the <strong className={strong}>UK International Data Transfer Addendum</strong> issued by the UK
        Information Commissioner&apos;s Office (the &quot;UK Addendum&quot;) for transfers subject to UK data protection
        law, and equivalent Swiss safeguards for transfers subject to Swiss data protection law &mdash; each as updated
        from time to time and incorporated into this DPA by reference.
      </p>
      <p className={p}>
        For the purposes of the EU SCCs and the UK Addendum, Customer is the data exporter and Westbridge is the data
        importer; the optional docking clause does not apply; clause 9(a) of the EU SCCs (general written authorisation
        for sub-processors with at least 30 days&apos; notice) is selected; and the law and forum for disputes are those
        of Ireland unless prohibited by applicable law.
      </p>

      {/* ================================================================ */}
      {/*  12. Liability                                                   */}
      {/* ================================================================ */}
      <h2 className={h2}>12. Liability</h2>
      <p className={p}>
        Each party&apos;s liability arising out of or related to this DPA, whether in contract, tort, or under any other
        theory of liability, is subject to the limitations and exclusions of liability set out in Section 12 of the{" "}
        <Link href={ROUTES.terms} className="underline text-foreground">
          Terms of Service
        </Link>
        . In no event will those limitations or exclusions limit either party&apos;s obligations or liability towards
        data subjects under the third-party-beneficiary rights of the EU SCCs.
      </p>

      {/* ================================================================ */}
      {/*  13. Order of Precedence                                         */}
      {/* ================================================================ */}
      <h2 className={h2}>13. Order of Precedence</h2>
      <p className={p}>
        In the event of a conflict between this DPA and the Terms of Service, this DPA prevails with respect to the
        processing of Customer Personal Data. In the event of a conflict between this DPA and the EU SCCs (or the UK
        Addendum), the EU SCCs (or the UK Addendum, as applicable) prevail.
      </p>

      {/* ================================================================ */}
      {/*  14. Updates to this DPA                                         */}
      {/* ================================================================ */}
      <h2 className={h2}>14. Updates to this DPA</h2>
      <p className={p}>
        Westbridge may update this DPA from time to time to reflect changes in applicable Data Protection Law, the
        Service, or its sub-processor list. Material changes will be communicated by email and/or an in-app notice at
        least <strong className={strong}>thirty (30) days before they take effect</strong>. Continued use of the Service
        after the effective date constitutes acceptance of the updated DPA.
      </p>

      {/* ================================================================ */}
      {/*  15. Contact                                                     */}
      {/* ================================================================ */}
      <h2 className={h2}>15. Contact</h2>
      <p className={p}>
        For data-protection-related questions or to request a counter-signed copy of this DPA, contact{" "}
        <a href="mailto:privacy@westbridgetoday.com" className="underline text-foreground">
          privacy@westbridgetoday.com
        </a>
        . For general support, contact{" "}
        <a href="mailto:support@westbridgetoday.com" className="underline text-foreground">
          support@westbridgetoday.com
        </a>
        .
      </p>
      <p className={p}>
        Westbridge Inc. &mdash; operating the Westbridge ERP platform at{" "}
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
        </Link>{" "}
        ·{" "}
        <Link href={ROUTES.refundPolicy} className="underline text-foreground">
          Refund Policy
        </Link>
      </div>
    </div>
  );
}

import { FC } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, AlertCircle, CheckCircle, XCircle, CreditCard } from 'lucide-react';

/**
 * Terms of Service Page
 * Governed by the Laws of the Federal Republic of Nigeria
 * Last updated: November 27, 2025
 */
export const TermsOfServicePage: FC = () => {
  const lastUpdated = 'November 27, 2025';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-lg text-gray-700">
            Please read these Terms of Service carefully before using the Admitly platform.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Section 1: Agreement */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              1. Agreement to Terms
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your")
                and Admitly ("we," "our," or "us") regarding your use of the Admitly platform at admitly.com.ng and
                all related services, features, and content.
              </p>
              <p className="text-gray-700 mb-4">
                By accessing or using Admitly, you agree to be bound by these Terms and our Privacy Policy.
                If you do not agree to these Terms, you must not access or use our services.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> If you are under 18 years old, you must have parental or guardian
                    consent to use Admitly. By using our services, you confirm you have obtained such consent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Services */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Admitly provides a comprehensive platform for Nigerian students to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Search and discover educational institutions (universities, polytechnics, colleges)</li>
                <li>Browse and compare academic programs</li>
                <li>Access admissions information, deadlines, and requirements</li>
                <li>Track application deadlines and receive alerts</li>
                <li>Save searches, bookmark institutions, and create comparison lists</li>
                <li>Access premium AI-powered features (with paid subscription)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time
                with or without notice. We are not liable for any modification, suspension, or discontinuation.
              </p>
            </div>
          </section>

          {/* Section 3: User Accounts */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Account Registration</h3>
              <p className="text-gray-700 mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Account Eligibility</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>You must be at least 13 years old to create an account</li>
                <li>Users under 18 must have parental/guardian consent</li>
                <li>You must provide a valid email address</li>
                <li>One person may not maintain multiple accounts</li>
                <li>Accounts are non-transferable</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Account Termination</h3>
              <p className="text-gray-700">
                You may delete your account at any time through Dashboard → Settings. We may suspend or terminate
                your account if you violate these Terms, engage in fraudulent activity, or for any other reason
                at our sole discretion.
              </p>
            </div>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              4. Acceptable Use
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">You agree to use Admitly only for lawful purposes and in compliance with these Terms.</p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Permitted Uses
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Search for educational institutions and programs</li>
                <li>Compare institutions and programs for personal educational planning</li>
                <li>Save searches and bookmarks for your own use</li>
                <li>Set up deadline alerts for application tracking</li>
                <li>Access AI-powered features (premium subscribers only)</li>
                <li>Share links to publicly available institution/program pages</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Prohibited Activities
              </h3>
              <p className="text-gray-700 mb-2">You may NOT:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Scrape, crawl, or systematically download content from Admitly</li>
                <li>Use automated tools (bots, scripts) to access or interact with the platform</li>
                <li>Reverse engineer, decompile, or disassemble any part of our services</li>
                <li>Resell, redistribute, or commercialize our data or services</li>
                <li>Create fake accounts or impersonate others</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Interfere with or disrupt our servers, services, or security measures</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Use the platform for spam, phishing, or fraudulent activities</li>
                <li>Violate any applicable Nigerian laws or regulations</li>
                <li>Harass, threaten, or defame other users or third parties</li>
                <li>Infringe on intellectual property rights of Admitly or third parties</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Our Content</h3>
              <p className="text-gray-700 mb-4">
                All content on Admitly, including but not limited to text, graphics, logos, icons, images,
                software, design, and the compilation of data, is the property of Admitly or its licensors
                and is protected by Nigerian and international copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Educational Institution Data</h3>
              <p className="text-gray-700 mb-4">
                Information about educational institutions, programs, admissions, and deadlines is collected
                from publicly available sources or provided by the institutions themselves. We do not claim
                ownership of this factual information, but our compilation, presentation, and organization
                of this data is protected.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Limited License</h3>
              <p className="text-gray-700 mb-4">
                We grant you a limited, non-exclusive, non-transferable, revocable license to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and use Admitly for personal, non-commercial educational planning</li>
                <li>Print or download individual pages for personal use only</li>
                <li>Share links to publicly available pages on social media</li>
              </ul>
              <p className="text-gray-700 mt-4">
                This license does not include any resale, commercial use, or systematic extraction of content.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.4 User Content</h3>
              <p className="text-gray-700">
                You retain ownership of content you submit (profile information, feedback, etc.). By submitting
                content, you grant us a worldwide, royalty-free license to use, reproduce, and display such
                content for operating and improving our services.
              </p>
            </div>
          </section>

          {/* Section 6: Premium Subscriptions */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" />
              6. Premium Subscriptions & Payments
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.1 Free vs. Premium</h3>
              <p className="text-gray-700 mb-4">
                Admitly offers both free and premium subscription tiers:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Free Tier:</strong> Basic search, browse, compare, bookmarks, and deadline tracking</li>
                <li><strong>Premium Tier (₦2,500/month):</strong> AI-powered recommendations, application planning,
                    career guidance, priority support, and export features</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.2 Payment Terms</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Premium subscriptions are billed monthly in Nigerian Naira (₦)</li>
                <li>Payments are processed securely via Paystack (paystack.com)</li>
                <li>All fees are exclusive of applicable Nigerian taxes (VAT)</li>
                <li>Subscriptions auto-renew monthly unless cancelled</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.3 Cancellation & Refunds</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>You may cancel your subscription at any time via Dashboard → Settings → Subscription</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>No refunds for partial months or unused premium features</li>
                <li>Full refund within 7 days of initial purchase if no premium features were used</li>
                <li>We reserve the right to refuse refunds if Terms were violated</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">6.4 Payment Failures</h3>
              <p className="text-gray-700">
                If payment fails, we will attempt to process payment again. After 3 failed attempts,
                your premium subscription will be downgraded to the free tier. You will retain access
                to saved data but lose premium features.
              </p>
            </div>
          </section>

          {/* Section 7: Data Accuracy */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Accuracy & Disclaimers</h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.1 Best Efforts</h3>
              <p className="text-gray-700 mb-4">
                We strive to provide accurate, up-to-date information about educational institutions,
                programs, admissions requirements, deadlines, and costs. However:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Information is sourced from publicly available sources and may become outdated</li>
                <li>Institutions may change requirements, deadlines, or fees without notice</li>
                <li>We are not responsible for errors, omissions, or outdated information</li>
                <li>Users must verify all critical information directly with institutions</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.2 No Guarantees</h3>
              <p className="text-gray-700 mb-4">
                Admitly does not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Guarantee admission to any educational institution</li>
                <li>Endorse or recommend specific institutions or programs</li>
                <li>Guarantee the accuracy, completeness, or timeliness of data</li>
                <li>Guarantee uninterrupted or error-free service</li>
                <li>Provide official admissions counseling or legal advice</li>
              </ul>
            </div>
          </section>

          {/* Section 8: Third-Party Links */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Links & Services</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Admitly may contain links to external websites (e.g., official university websites,
                government portals). These links are provided for convenience only.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We do not control or endorse third-party websites</li>
                <li>We are not responsible for their content, privacy practices, or terms</li>
                <li>Accessing third-party sites is at your own risk</li>
                <li>Review their terms and privacy policies before providing personal information</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Limitation of Liability */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by Nigerian law:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Admitly is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</li>
                <li>We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose</li>
                <li>We are not liable for any indirect, incidental, consequential, or punitive damages</li>
                <li>Our total liability shall not exceed the amount you paid in the last 12 months (or ₦5,000 for free users)</li>
                <li>We are not liable for losses due to data inaccuracies, missed deadlines, or failed applications</li>
                <li>We are not liable for service interruptions, data loss, or security breaches beyond our control</li>
              </ul>
              <p className="text-gray-700">
                Some jurisdictions do not allow limitations on implied warranties or liability. In such cases,
                these limitations may not apply to you to the extent prohibited by law.
              </p>
            </div>
          </section>

          {/* Section 10: Indemnification */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless Admitly, its affiliates, officers, directors,
                employees, and agents from any claims, liabilities, damages, losses, costs, or expenses
                (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your misuse of the platform</li>
                <li>Your content or data submissions</li>
                <li>Your unauthorized access or fraudulent activity</li>
              </ul>
            </div>
          </section>

          {/* Section 11: Governing Law */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law & Dispute Resolution</h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11.1 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria,
                without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">11.2 Dispute Resolution</h3>
              <p className="text-gray-700 mb-4">
                In the event of any dispute arising from these Terms or use of Admitly:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li><strong>Informal Resolution:</strong> Contact us at legal@admitly.com.ng to attempt good-faith resolution</li>
                <li><strong>Mediation:</strong> If informal resolution fails, disputes shall be submitted to mediation in Lagos, Nigeria</li>
                <li><strong>Arbitration:</strong> Unresolved disputes shall be settled by binding arbitration under Nigerian Arbitration and Conciliation Act</li>
                <li><strong>Jurisdiction:</strong> Courts of Lagos State, Nigeria shall have exclusive jurisdiction for any legal proceedings</li>
              </ol>
            </div>
          </section>

          {/* Section 12: Termination */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                We may suspend or terminate your access to Admitly immediately, without prior notice or liability, for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Violation of these Terms</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Failure to pay premium subscription fees</li>
                <li>Extended inactivity (24 months)</li>
                <li>At our discretion for any other reason</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Your right to access Admitly will cease immediately</li>
                <li>We may delete your account data (subject to legal retention requirements)</li>
                <li>Premium subscription fees are non-refundable</li>
                <li>Provisions regarding intellectual property, liability, and indemnification survive termination</li>
              </ul>
            </div>
          </section>

          {/* Section 13: Changes to Terms */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to These Terms</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes via:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Email notification to your registered email address (at least 30 days before changes take effect)</li>
                <li>Prominent notice on the Admitly website</li>
                <li>In-app notification when you log in</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Your continued use of Admitly after the effective date of changes constitutes acceptance of the modified Terms.
                If you do not agree to the changes, you must stop using Admitly and delete your account.
              </p>
              <p className="text-gray-700">
                We will maintain previous versions of these Terms in our documentation for your reference.
              </p>
            </div>
          </section>

          {/* Section 14: Miscellaneous */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Miscellaneous</h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.1 Entire Agreement</h3>
              <p className="text-gray-700 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Admitly
                regarding use of our services.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.2 Severability</h3>
              <p className="text-gray-700 mb-4">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.3 Waiver</h3>
              <p className="text-gray-700 mb-4">
                Failure to enforce any provision does not constitute a waiver of that provision or any other provision.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.4 Assignment</h3>
              <p className="text-gray-700 mb-4">
                You may not assign or transfer these Terms. We may assign our rights and obligations without restriction.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">14.5 Force Majeure</h3>
              <p className="text-gray-700">
                We are not liable for failures or delays due to circumstances beyond our reasonable control
                (e.g., natural disasters, war, terrorism, pandemics, power outages, internet failures).
              </p>
            </div>
          </section>

          {/* Section 15: Contact */}
          <section className="p-8 bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              15. Contact Information
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, contact our legal team:
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-2">Admitly Platform</p>
                <p className="text-gray-700">
                  <strong>Legal Inquiries:</strong> <a href="mailto:legal@admitly.com.ng" className="text-primary hover:underline">legal@admitly.com.ng</a><br />
                  <strong>General Support:</strong> <a href="mailto:support@admitly.com.ng" className="text-primary hover:underline">support@admitly.com.ng</a><br />
                  <strong>Address:</strong> Nigeria<br />
                  <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM WAT
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <section className="p-8 bg-primary/5 border-t-2 border-primary">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                <strong>Last Updated:</strong> {lastUpdated}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                These Terms of Service are governed by the laws of the Federal Republic of Nigeria.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                <span className="text-gray-400">|</span>
                <Link to="/" className="text-primary hover:underline">Back to Home</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

TermsOfServicePage.displayName = 'TermsOfServicePage';

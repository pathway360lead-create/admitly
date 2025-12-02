import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, Database, Eye, FileText } from 'lucide-react';

/**
 * Privacy Policy Page
 * NDPR (Nigeria Data Protection Regulation) Compliant
 * Last updated: November 27, 2025
 */
export const PrivacyPolicyPage: FC = () => {
  const lastUpdated = 'November 27, 2025';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated}
          </p>
          <p className="mt-4 text-lg text-gray-700">
            Admitly is committed to protecting your privacy and complying with the Nigeria Data Protection Regulation (NDPR) 2019.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Section 1: Introduction */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              1. Introduction
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Welcome to Admitly ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose,
                and protect your personal information when you use our platform at admitly.com.ng and related services.
              </p>
              <p className="text-gray-700 mb-4">
                By using Admitly, you agree to the collection and use of information in accordance with this policy.
                If you do not agree with our policies and practices, do not use our services.
              </p>
              <p className="text-gray-700">
                <strong>Data Controller:</strong> Admitly Platform<br />
                <strong>Registered Address:</strong> Nigeria<br />
                <strong>Contact:</strong> <a href="mailto:privacy@admitly.com.ng" className="text-primary hover:underline">privacy@admitly.com.ng</a>
              </p>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              2. Information We Collect
            </h2>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Account Information:</strong> Full name, email address, phone number, date of birth, and password</li>
                <li><strong>Profile Information:</strong> Educational background, interests, career goals, JAMB/UTME scores</li>
                <li><strong>Preferences:</strong> Saved searches, bookmarked institutions/programs, alert settings</li>
                <li><strong>Communication:</strong> Messages you send to us, feedback, and support requests</li>
                <li><strong>Payment Information:</strong> For premium subscriptions (processed securely via Paystack)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Usage Data:</strong> Pages visited, search queries, time spent, features used</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> General location (city/state) based on IP address</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics (see Cookie Policy)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Social Login:</strong> If you sign in via Google or other providers, we receive basic profile information</li>
                <li><strong>Educational Institutions:</strong> Publicly available information about universities, programs, and admissions</li>
                <li><strong>Payment Processors:</strong> Transaction status from Paystack (no card details stored by us)</li>
              </ul>
            </div>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              3. How We Use Your Information
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">We use your personal information for the following purposes:</p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Service Delivery</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Provide access to educational institution and program data</li>
                <li>Enable search, comparison, and discovery features</li>
                <li>Manage your account and user profile</li>
                <li>Process bookmarks, saved searches, and alerts</li>
                <li>Deliver deadline reminders and notifications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.2 Premium Features (with consent)</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Provide AI-powered personalized recommendations</li>
                <li>Generate application planning assistance</li>
                <li>Offer career guidance based on your profile</li>
                <li>Process subscription payments via Paystack</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.3 Communication</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Send service updates, deadline alerts, and important notices</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send marketing communications (with your consent, opt-out available)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.4 Platform Improvement</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Analyze usage patterns to improve features</li>
                <li>Conduct research and analytics (anonymized data)</li>
                <li>Detect and prevent fraud, abuse, and security issues</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Legal Basis (NDPR Compliance) */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing (NDPR)</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">Under the NDPR, we process your data based on:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Consent:</strong> You have given clear consent for specific processing activities</li>
                <li><strong>Contract:</strong> Processing is necessary to provide services you've requested</li>
                <li><strong>Legal Obligation:</strong> Processing is required to comply with Nigerian law</li>
                <li><strong>Legitimate Interest:</strong> Processing is necessary for our legitimate business interests (e.g., fraud prevention)</li>
              </ul>
            </div>
          </section>

          {/* Section 5: Data Sharing */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Share Your Information</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">We do not sell your personal information. We may share data with:</p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Service Providers</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li><strong>Hosting:</strong> Render (USA) - cloud infrastructure</li>
                <li><strong>Database:</strong> Supabase (USA) - data storage with encryption</li>
                <li><strong>Payments:</strong> Paystack (Nigeria) - payment processing</li>
                <li><strong>AI Services:</strong> Google Gemini, Anthropic Claude - premium features only</li>
                <li><strong>Email:</strong> SendGrid - transactional emails and alerts</li>
                <li><strong>Analytics:</strong> Anonymized usage analytics (no personal data sold)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">
                We may disclose information when required by law, court order, or to protect our rights,
                comply with legal processes, or respond to government requests in Nigeria.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Business Transfers</h3>
              <p className="text-gray-700">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred.
                We will notify you of any such change and provide choices regarding your data.
              </p>
            </div>
          </section>

          {/* Section 6: Data Security */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              6. Data Security
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">We implement industry-standard security measures:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Encryption:</strong> HTTPS/TLS for data in transit, AES-256 for data at rest</li>
                <li><strong>Authentication:</strong> Secure password hashing (bcrypt), JWT tokens with expiration</li>
                <li><strong>Access Controls:</strong> Role-based access, database row-level security (RLS)</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and logging</li>
                <li><strong>Backups:</strong> Regular automated backups with encryption</li>
                <li><strong>Compliance:</strong> NDPR-compliant data processing agreements with all vendors</li>
              </ul>
              <p className="text-gray-700 mt-4">
                While we take reasonable steps to protect your data, no method of transmission over the internet
                is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </div>
          </section>

          {/* Section 7: Your Rights (NDPR) */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights Under NDPR</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">As a Nigerian data subject, you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                <li>
                  <strong>Right to Access:</strong> Request a copy of your personal data we hold<br />
                  <span className="text-sm text-gray-600">Contact: privacy@admitly.com.ng</span>
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data<br />
                  <span className="text-sm text-gray-600">Update via Dashboard → Settings</span>
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of your personal data<br />
                  <span className="text-sm text-gray-600">Contact: privacy@admitly.com.ng (processed within 30 days)</span>
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Limit how we use your data<br />
                  <span className="text-sm text-gray-600">Manage via Dashboard → Settings → Privacy</span>
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Receive your data in a machine-readable format<br />
                  <span className="text-sm text-gray-600">Export via Dashboard → Settings → Data Export</span>
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to processing for direct marketing<br />
                  <span className="text-sm text-gray-600">Unsubscribe links in emails or Dashboard settings</span>
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw consent for any processing<br />
                  <span className="text-sm text-gray-600">Manage via Dashboard → Settings</span>
                </li>
                <li>
                  <strong>Right to Lodge a Complaint:</strong> File a complaint with Nigeria Data Protection Commission (NDPC)<br />
                  <span className="text-sm text-gray-600">NDPC Website: ndpc.gov.ng</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 8: Data Retention */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">We retain your personal information for as long as necessary:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Active Accounts:</strong> Retained while your account is active</li>
                <li><strong>Inactive Accounts:</strong> Deleted after 24 months of inactivity (with prior notice)</li>
                <li><strong>Deleted Accounts:</strong> Permanently deleted within 30 days of deletion request</li>
                <li><strong>Legal Requirements:</strong> May be retained longer if required by Nigerian law</li>
                <li><strong>Anonymized Data:</strong> Usage analytics may be retained indefinitely in anonymized form</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy (Under 18)</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Admitly is designed for students planning higher education in Nigeria. We recognize that many users
                may be under 18 years old. If you are under 18:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You should have parental or guardian consent before using our services</li>
                <li>We collect minimal information necessary for service delivery</li>
                <li>Parents can request access, correction, or deletion of their child's data</li>
                <li>We do not knowingly collect data from children under 13 without verified parental consent</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Parents/Guardians: Contact <a href="mailto:privacy@admitly.com.ng" className="text-primary hover:underline">privacy@admitly.com.ng</a> to
                exercise rights on behalf of a minor.
              </p>
            </div>
          </section>

          {/* Section 10: International Transfers */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Some of our service providers (Supabase, Render, Google, Anthropic) are based outside Nigeria.
                When we transfer your data internationally:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We ensure adequate safeguards are in place (NDPR-compliant data processing agreements)</li>
                <li>Data is encrypted in transit and at rest</li>
                <li>Transfers are limited to what's necessary for service delivery</li>
                <li>You have the right to object to international transfers</li>
              </ul>
            </div>
          </section>

          {/* Section 11: Cookies */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Cookies and Tracking</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">We use cookies and similar technologies for:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Essential Cookies:</strong> Authentication, security, session management (cannot be disabled)</li>
                <li><strong>Functional Cookies:</strong> Remember preferences, saved searches</li>
                <li><strong>Analytics Cookies:</strong> Understand usage patterns (anonymized)</li>
                <li><strong>Marketing Cookies:</strong> Personalize content (with consent)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You can control cookies via browser settings. Disabling essential cookies may limit functionality.
              </p>
            </div>
          </section>

          {/* Section 12: Changes to Policy */}
          <section className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of material changes via:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
                <li>Email notification to your registered email address</li>
                <li>Prominent notice on our website</li>
                <li>In-app notification when you log in</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Continued use of Admitly after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Section 13: Contact Us */}
          <section className="p-8 bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              13. Contact Us
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                For questions, concerns, or to exercise your NDPR rights, contact our Data Protection Officer:
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-900 font-semibold mb-2">Admitly Platform</p>
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:privacy@admitly.com.ng" className="text-primary hover:underline">privacy@admitly.com.ng</a><br />
                  <strong>Data Protection Officer:</strong> <a href="mailto:dpo@admitly.com.ng" className="text-primary hover:underline">dpo@admitly.com.ng</a><br />
                  <strong>Address:</strong> Nigeria<br />
                  <strong>Response Time:</strong> Within 7 business days
                </p>
              </div>
              <p className="text-gray-700 mt-6">
                <strong>Nigeria Data Protection Commission (NDPC):</strong><br />
                If you believe we have not addressed your concern, you may lodge a complaint with the NDPC:<br />
                Website: <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ndpc.gov.ng</a><br />
                Email: info@ndpc.gov.ng
              </p>
            </div>
          </section>

          {/* Footer */}
          <section className="p-8 bg-primary/5 border-t-2 border-primary">
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                <strong>Last Updated:</strong> {lastUpdated}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                This Privacy Policy is compliant with the Nigeria Data Protection Regulation (NDPR) 2019
                and the Nigerian Data Protection Act 2023.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
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

PrivacyPolicyPage.displayName = 'PrivacyPolicyPage';

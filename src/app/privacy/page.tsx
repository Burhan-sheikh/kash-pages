import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - KashPages',
  description: 'Privacy policy and data protection information for KashPages',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500 italic">
            Last Updated: December 27, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">
            1. Information We Collect
          </h2>
          <p>
            When businesses publish landing pages on KashPages, we collect and store
            information including business name, contact details, location, and custom
            HTML content provided by the business owner.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">
            2. How We Use Information
          </h2>
          <p>
            We use the information provided to publish and maintain landing pages, make
            them discoverable through search engines, and track basic analytics.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">
            3. Data Protection
          </h2>
          <p>
            Your data is stored securely in Firebase. Only authorized administrators can
            access the admin dashboard. Landing pages are publicly accessible via their
            respective URLs.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">
            4. Third-Party Services
          </h2>
          <p>
            KashPages uses Firebase (by Google) for authentication, database, and
            hosting. By using KashPages, you agree to Firebase's terms of service and
            privacy policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Your Rights</h2>
          <p>
            Business owners can request to update, modify, or delete their landing pages
            at any time through the KashPages admin dashboard.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">6. Contact</h2>
          <p>
            If you have questions about this privacy policy, please contact us at
            privacy@kashpages.in
          </p>
        </div>
      </div>
    </main>
  );
}

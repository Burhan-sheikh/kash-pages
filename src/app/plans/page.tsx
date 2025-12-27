import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plans - KashPages',
  description:
    'Affordable landing page plans for Kashmir businesses. Get online presence with professional landing pages.',
  openGraph: {
    title: 'Plans - KashPages',
    description: 'Affordable landing page plans for Kashmir businesses',
    type: 'website',
  },
};

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Plans & Pricing</h1>
        <p className="text-xl text-gray-600 mb-12">
          Simple, transparent pricing for professional landing pages
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
            <p className="text-gray-600 mb-6">
              Perfect for getting started
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              ₹2,999<span className="text-lg text-gray-600">/year</span>
            </p>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Professional landing page
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                SEO optimized
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Google indexed
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Whatsapp sharing ready
              </li>
            </ul>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition">
              Get Started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-blue-600 rounded-lg p-8 relative shadow-lg">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
            <p className="text-gray-600 mb-6">
              For growing businesses
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              ₹4,999<span className="text-lg text-gray-600">/year</span>
            </p>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Everything in Basic
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Custom domain support
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Priority updates
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Email support
              </li>
            </ul>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Get Started
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="border border-gray-200 rounded-lg p-8 hover:shadow-lg transition">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-6">
              For large organizations
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              Custom<span className="text-lg text-gray-600">/month</span>
            </p>
            <ul className="space-y-3 mb-8 text-gray-700">
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Unlimited pages
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Custom domain
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                API access
              </li>
              <li className="flex items-center">
                <span className="mr-3 text-green-600">✓</span>
                Dedicated support
              </li>
            </ul>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition">
              Contact Us
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Questions about plans?
          </h2>
          <p className="text-gray-600 mb-6">
            Our team is here to help you choose the right plan for your business.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Contact Sales
          </button>
        </div>
      </div>
    </main>
  );
}

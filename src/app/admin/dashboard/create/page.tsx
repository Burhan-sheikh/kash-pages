'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import PageForm from '@/components/admin/PageForm';
import { LandingPage } from '@/lib/firestore';

export default function CreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Partial<LandingPage>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors?.[Object.keys(data.errors)[0]] || data.error || 'Failed to create page');
      }

      const result = await response.json();
      router.push(`/admin/dashboard/edit/${result.pageId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create New Landing Page</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <PageForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Page"
        />
      </main>
    </div>
  );
}

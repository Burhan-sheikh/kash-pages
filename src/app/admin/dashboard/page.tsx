'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  businessName: string;
  businessCategory: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  // Fetch pages from API
  const fetchPages = async () => {
    try {
      setFetchLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/landing-pages?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      setPages(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching pages');
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch pages on mount and when filter changes
  useEffect(() => {
    if (!loading && user) {
      fetchPages();
    }
  }, [loading, user, filter]);

  // Redirect to login if not authenticated
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/admin/login');
    return null;
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      setPages(pages.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting page');
    }
  };

  const handlePublishToggle = async (page: LandingPage) => {
    try {
      const response = await fetch(`/api/landing-pages/${page.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: page.status !== 'published' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update page status');
      }

      // Update local state
      setPages(
        pages.map((p) =>
          p.id === page.id
            ? { ...p, status: page.status === 'published' ? 'draft' : 'published' }
            : p
        )
      );
    } catch (err: any) {
      alert(err.message || 'Error updating page status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">KashPages Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Bar */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Landing Pages</h2>
            <div className="flex gap-2">
              {(['all', 'draft', 'published'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Link
            href="/admin/dashboard/create"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
          >
            + Create Page
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Pages Table */}
        {fetchLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No pages found</p>
            <Link
              href="/admin/dashboard/create"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Create your first page
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Business</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Updated</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{page.businessName}</div>
                      <div className="text-xs text-gray-500">{page.businessCategory}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{page.slug}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Link
                        href={`/admin/dashboard/edit/${page.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handlePublishToggle(page)}
                        className={`${
                          page.status === 'published'
                            ? 'text-yellow-600 hover:underline'
                            : 'text-green-600 hover:underline'
                        }`}
                      >
                        {page.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiCalendar, FiClock, FiMessageCircle, FiUser } from 'react-icons/fi';

export default function AdminAnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchAnnouncement();
    }
  }, [params.id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
        
        // Fetch queries if it's a QUESTION type
        if (data.type === 'QUESTION') {
          fetchQueries();
        }
      } else {
        console.error('Failed to fetch announcement');
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async () => {
    try {
      const response = await fetch(`/api/announcements/queries?announcementId=${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setQueries(data.queries || []);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const handleSummarize = async () => {
    if (!announcement?.content) return;

    try {
      setSummarizing(true);
      const response = await fetch('/api/announcements/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: announcement.content
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcement...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Announcement not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard/announcements')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Announcements
        </button>

        {/* Announcement Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      announcement.type === 'QUESTION'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {announcement.type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      announcement.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {announcement.visibility}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {announcement.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiUser className="mr-2" />
                    <span>Posted by {announcement.createdByType} (ID: {announcement.createdById})</span>
                  </div>
                  <div className="flex items-center">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          {announcement.imageUrl && (
            <div className="w-full">
              <img
                src={announcement.imageUrl}
                alt={announcement.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </div>

          {/* AI Summary Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summarizing ? 'Summarizing...' : 'Summarize with AI'}
            </button>
          </div>

          {/* AI Summary Display */}
          {summary && (
            <div className="mx-6 mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          )}
        </div>

        {/* Queries Section (only for QUESTION type) */}
        {announcement.type === 'QUESTION' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <FiMessageCircle className="text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Student Queries ({queries.length})
                </h2>
              </div>
            </div>

            {/* Queries List */}
            <div className="p-6">
              {queries.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No queries yet from students.
                </p>
              ) : (
                <div className="space-y-4">
                  {queries.map((query) => (
                    <div
                      key={query.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUser className="mr-2" />
                          <span className="font-medium">Student ID: {query.userId}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <FiClock className="mr-1" />
                          {formatDate(query.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-700">{query.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

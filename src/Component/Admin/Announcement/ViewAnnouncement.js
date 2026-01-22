'use client';

import { useEffect, useState } from 'react';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';

const ViewAnnouncement = ({ announcement, onClose, currentUser }) => {
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (announcement?.type === 'QUESTION') {
      fetchQueries();
    }
  }, [announcement]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/queries?announcementId=${announcement.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setQueries(data.queries || []);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    
    if (!newQuery.trim() || !currentUser) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/announcements/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newQuery,
          announcementId: announcement.id,
          userId: currentUser.id
        }),
      });

      if (response.ok) {
        setNewQuery('');
        fetchQueries(); // Refresh queries
      }
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    return type === 'QUESTION' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getVisibilityColor = (visibility) => {
    switch(visibility) {
      case 'STAFF_ONLY': return 'bg-purple-100 text-purple-800';
      case 'STUDENTS_ONLY': return 'bg-orange-100 text-orange-800';
      case 'BOTH': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canComment = currentUser?.role === 'STUDENT' && announcement?.type === 'QUESTION';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#2d2d39] rounded-xl shadow-xl max-w-4xl w-full my-8 border border-[#25252b]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{announcement.title}</h2>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                {announcement.type}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVisibilityColor(announcement.visibility)}`}>
                {announcement.visibility.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Created on {formatDate(announcement.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Image */}
            {announcement.imageUrl && (
              <div className="mb-6">
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="w-full max-w-lg mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Rich Text Content */}
            <div 
              className="prose prose-invert max-w-none mb-8"
              style={{
                color: '#e5e7eb',
              }}
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />

            {/* Queries Section */}
            {announcement.type === 'QUESTION' && (
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center mb-4">
                  <FiMessageCircle className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">
                    Queries ({queries.length})
                  </h3>
                </div>

                {/* Query Form */}
                {canComment && (
                  <form onSubmit={handleSubmitQuery} className="mb-6">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newQuery}
                          onChange={(e) => setNewQuery(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-[#1e1e26] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Ask a question or leave a comment..."
                          disabled={submitting}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newQuery.trim() || submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <FiSend className="h-4 w-4 mr-1" />
                        {submitting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Queries List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-400">Loading queries...</p>
                  </div>
                ) : queries.length > 0 ? (
                  <div className="space-y-4">
                    {queries.map((query, index) => (
                      <div key={query.id || index} className="bg-[#1e1e26] rounded-lg p-4 border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-white">Student #{query.userId}</span>
                          <span className="text-sm text-gray-400">
                            {formatDate(query.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{query.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FiMessageCircle className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                    <p>No queries yet. Be the first to ask a question!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 bg-[#25252b]">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2d2d39] border border-gray-600 rounded-lg hover:bg-[#35353f] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAnnouncement;
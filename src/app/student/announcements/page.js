'use client';

import { useState, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../../../Component/Header';

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [student, setStudent] = useState(null);

  // Mock current student - replace with actual auth context
  const currentStudent = {
    id: 1,
    fullName: 'John Doe',
    studentId: 'STU001'
  };

  useEffect(() => {
    fetchAnnouncements();
    setStudent(currentStudent);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch announcements visible to students
      const response = await fetch('/api/announcements?visibility=student');
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async (announcementId) => {
    try {
      const response = await fetch(`/api/announcements/queries?announcementId=${announcementId}`);
      
      if (response.ok) {
        const data = await response.json();
        setQueries(data.queries || []);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    if (announcement.type === 'QUESTION') {
      fetchQueries(announcement.id);
    }
  };

  const handleCloseView = () => {
    setSelectedAnnouncement(null);
    setQueries([]);
    setNewQuery('');
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    
    if (!newQuery.trim() || !student) return;

    try {
      setSubmittingQuery(true);
      const response = await fetch('/api/announcements/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newQuery,
          announcementId: selectedAnnouncement.id,
          userId: student.id
        }),
      });

      if (response.ok) {
        setNewQuery('');
        fetchQueries(selectedAnnouncement.id); // Refresh queries
      }
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setSubmittingQuery(false);
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

  return (
    <div className="min-h-screen bg-[#1d1d24]">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Announcements</h1>
          <p className="text-gray-400">Stay updated with the latest announcements and ask questions</p>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            <span className="ml-2 text-gray-400">Loading announcements...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                <FiMessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-medium mb-2">No Announcements</h3>
                <p>No announcements are available at the moment.</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="bg-[#25252b] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => handleViewAnnouncement(announcement)}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <FiCalendar className="h-3 w-3 mr-1" />
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>

                  {/* Image */}
                  {announcement.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {announcement.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {announcement.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center">
                      <FiUser className="h-3 w-3 mr-1" />
                      {announcement.createdByType}
                    </div>
                    {announcement.type === 'QUESTION' && (
                      <div className="flex items-center">
                        <FiMessageCircle className="h-3 w-3 mr-1" />
                        {announcement._count.queries} queries
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* View Modal */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#25252b] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedAnnouncement.title}</h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedAnnouncement.type)}`}>
                      {selectedAnnouncement.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Created on {formatDate(selectedAnnouncement.createdAt)}
                  </p>
                </div>
                <button
                  onClick={handleCloseView}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Image */}
                  {selectedAnnouncement.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={selectedAnnouncement.imageUrl}
                        alt={selectedAnnouncement.title}
                        className="w-full max-w-lg mx-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* Rich Text Content */}
                  <div 
                    className="prose prose-invert max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                  />

                  {/* Queries Section */}
                  {selectedAnnouncement.type === 'QUESTION' && (
                    <div className="border-t border-gray-700 pt-6">
                      <div className="flex items-center mb-4">
                        <FiMessageCircle className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-white">
                          Questions & Comments ({queries.length})
                        </h3>
                      </div>

                      {/* Query Form */}
                      <form onSubmit={handleSubmitQuery} className="mb-6">
                        <div className="flex space-x-3">
                          <div className="flex-1">
                            <textarea
                              value={newQuery}
                              onChange={(e) => setNewQuery(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-[#1d1d24] border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
                              placeholder="Ask a question or leave a comment..."
                              disabled={submittingQuery}
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={!newQuery.trim() || submittingQuery}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <FiSend className="h-4 w-4 mr-1" />
                            {submittingQuery ? 'Posting...' : 'Post'}
                          </button>
                        </div>
                      </form>

                      {/* Queries List */}
                      {queries.length > 0 ? (
                        <div className="space-y-4">
                          {queries.map((query, index) => (
                            <div key={query.id || index} className="bg-[#1d1d24] rounded-lg p-4 border border-gray-700">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-indigo-400">Student #{query.userId}</span>
                                <span className="text-sm text-gray-500">
                                  {formatDate(query.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-300 whitespace-pre-wrap">{query.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FiMessageCircle className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                          <p>No questions yet. Be the first to ask!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700 p-6 bg-[#1d1d24]">
                <div className="flex justify-end">
                  <button
                    onClick={handleCloseView}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#25252b] border border-gray-600 rounded-lg hover:bg-[#2d2d39] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
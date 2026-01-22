'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCalendar, FiMessageCircle, FiUser } from 'react-icons/fi';
import Header from '../../../Component/Header';

export default function StudentAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
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

  const handleViewAnnouncement = (announcement) => {
    router.push(`/student/announcements/${announcement.id}`);
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
      </div>
    </div>
  );
}
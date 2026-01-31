'use client';

import AnnouncementsTable from '@/Component/Admin/Announcement/AnnouncementsTable';
import CreateAnnouncementForm from '@/Component/Admin/Announcement/CreateAnnouncementForm';
import ViewAnnouncement from '@/Component/Admin/Announcement/ViewAnnouncement';
import Modal from '@/Component/Common/Modal';
import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

export default function AnnouncementsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    questions: 0,
    totalQueries: 0,
    active: 0
  });
  
  // Mock current user - replace with actual auth context
  const currentUser = {
    id: 1,
    role: 'ADMIN',
    type: 'ADMIN'
  };

  // Fetch stats on mount and when refreshKey changes
  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/announcements?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats({
          total: data.total || 0,
          questions: data.questions || 0,
          totalQueries: data.totalQueries || 0,
          active: data.active || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedAnnouncement(null);
    setIsCreateOpen(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditOpen(true);
  };

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleSubmitCreate = async (formData) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdById: currentUser.id,
          createdByType: currentUser.type
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create announcement');
      }

      // Success - refresh table and close modal
      setRefreshKey(prev => prev + 1);
      setIsCreateOpen(false);
    } catch (error) {
      throw error; // Re-throw to be handled by the form component
    }
  };

  const handleSubmitEdit = async (formData) => {
    try {
      const response = await fetch(`/api/announcements/${selectedAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update announcement');
      }

      // Success - refresh table and close modal
      setRefreshKey(prev => prev + 1);
      setIsEditOpen(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      throw error; // Re-throw to be handled by the form component
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Announcements</h1>
          <p className="text-gray-400">
            Manage announcements and questions for students
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition flex items-center"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          Create Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#2d2d39] p-6 rounded-xl border border-[#25252b]">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">My Announcements</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-indigo-600/20 p-3 rounded-full">
              <div className="w-6 h-6 bg-indigo-600 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#2d2d39] p-6 rounded-xl border border-[#25252b]">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">Questions</p>
              <p className="text-2xl font-bold text-blue-400">{stats.questions}</p>
            </div>
            <div className="bg-blue-600/20 p-3 rounded-full">
              <div className="w-6 h-6 bg-blue-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="bg-[#2d2d39] p-6 rounded-xl border border-[#25252b]">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">Total Queries</p>
              <p className="text-2xl font-bold text-green-400">{stats.totalQueries}</p>
            </div>
            <div className="bg-green-600/20 p-3 rounded-full">
              <div className="w-6 h-6 bg-green-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="bg-[#2d2d39] p-6 rounded-xl border border-[#25252b]">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400">Active</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            </div>
            <div className="bg-emerald-600/20 p-3 rounded-full">
              <div className="w-6 h-6 bg-emerald-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-[#2d2d39] rounded-xl p-6 border border-[#25252b]">
        <AnnouncementsTable
          refreshKey={refreshKey}
          onEdit={handleEdit}
          onView={handleView}
        />
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={handleCloseModals}>
        <CreateAnnouncementForm
          onSubmit={handleSubmitCreate}
          onClose={handleCloseModals}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={handleCloseModals}>
        <CreateAnnouncementForm
          onSubmit={handleSubmitEdit}
          onClose={handleCloseModals}
          initialData={selectedAnnouncement}
          isEditing={true}
        />
      </Modal>

      {/* View Modal */}
      {isViewOpen && selectedAnnouncement && (
        <ViewAnnouncement
          announcement={selectedAnnouncement}
          onClose={handleCloseModals}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
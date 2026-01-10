'use client';

import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import RichTextEditor from '@/Component/Common/RichTextEditor';

const CreateAnnouncementForm = ({ onSubmit, onClose, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || '',
    type: initialData?.type || 'ANNOUNCEMENT',
    visibility: initialData?.visibility || 'BOTH',
    isActive: initialData?.isActive ?? true
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
      return;
    }

    setUploading(true);
    setErrors(prev => ({ ...prev, image: '' }));

    try {
      // Use server-side upload API (more secure)
      const uploadData = new FormData();
      uploadData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));

      // Alternative: Direct Cloudinary upload (requires unsigned preset)
      // const uploadData = new FormData();
      // uploadData.append('file', file);
      // uploadData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
      // 
      // const response = await fetch(`https://api.cloudinary.com/v1_1/dgesurd3g/image/upload`, {
      //   method: 'POST',
      //   body: uploadData
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Upload failed');
      // }
      // 
      // const data = await response.json();
      // setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));

    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please configure Cloudinary or use server-side upload.' }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Content is required';
    }

    if (!formData.type) {
      newErrors.type = 'Announcement type is required';
    }

    if (!formData.visibility) {
      newErrors.visibility = 'Visibility is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: error.message || 'Failed to save announcement' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter announcement title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Type and Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="ANNOUNCEMENT">Simple Announcement</option>
              <option value="QUESTION">Question (Allow Queries)</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Questions allow students to comment, announcements don't
            </p>
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
              Visible To *
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.visibility ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="BOTH">Both Staff and Students</option>
              <option value="STAFF_ONLY">Staff Only</option>
              <option value="STUDENTS_ONLY">Students Only</option>
            </select>
            {errors.visibility && <p className="mt-1 text-sm text-red-600">{errors.visibility}</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image (Optional)
          </label>
          
          {formData.imageUrl ? (
            <div className="relative inline-block">
              <img
                src={formData.imageUrl}
                alt="Announcement"
                className="w-48 h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {uploading ? 'Uploading...' : 'Click to upload image'}
                  </span>
                  <span className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</span>
                </label>
                <input
                  id="imageUpload"
                  name="imageUpload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          )}
          {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={handleContentChange}
            placeholder="Write your announcement content here..."
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
        </div>

        {/* Status (for editing) */}
        {isEditing && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (visible to users)
            </label>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncementForm;
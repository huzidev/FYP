/**
 * Global API utility for making HTTP requests
 * Handles GET, POST, PUT, DELETE operations with consistent error handling
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * API Error class with user-friendly message handling
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /**
   * Get user-friendly error message based on status code and context
   */
  getUserMessage() {
    // Handle based on status code
    switch (this.status) {
      case 400:
        return this.extractMessage() || 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return this.extractMessage() || 'The requested resource was not found.';
      case 409:
        return this.extractMessage() || 'This record already exists.';
      case 422:
        return this.extractMessage() || 'Invalid data provided.';
      case 429:
        return 'Too many requests. Please wait and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      case 0:
        return 'Network error. Please check your internet connection.';
      default:
        return this.extractMessage() || 'Something went wrong. Please try again.';
    }
  }

  /**
   * Extract clean message from error data
   */
  extractMessage() {
    if (!this.data) return null;

    // Handle string data
    if (typeof this.data === 'string') {
      return this.data;
    }

    // Handle object data - try common error fields
    if (typeof this.data === 'object') {
      return this.data.error || this.data.message || this.data.detail || null;
    }

    return null;
  }

  /**
   * Check if error is authentication related
   */
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a validation error
   */
  isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  /**
   * Check if error is a server error
   */
  isServerError() {
    return this.status >= 500;
  }

  /**
   * Check if error is a network error
   */
  isNetworkError() {
    return this.status === 0;
  }
}

/**
 * API Response handler utility
 */
export const ApiResponse = {
  /**
   * Handle API error and return user-friendly message
   */
  getErrorMessage(error) {
    if (error instanceof ApiError) {
      return error.getUserMessage();
    }
    if (error?.message) {
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  },

  /**
   * Check if should redirect to login
   */
  shouldRedirectToLogin(error) {
    return error instanceof ApiError && error.status === 401;
  },

  /**
   * Format bulk operation results for display
   */
  formatBulkResults(data) {
    if (!data?.results) return null;

    const { total, successful, failed, details } = data.results;
    return {
      total,
      successful,
      failed,
      errors: details?.errors?.map(err => ({
        row: err.row,
        message: typeof err.error === 'string' ? err.error : 'Failed to process',
      })) || [],
    };
  },
};

/**
 * Base fetch function with error handling
 */
async function baseFetch(url, options = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${BASE_URL}${url}`, config);
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || data || 'Request failed',
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      null
    );
  }
}

/**
 * API utility methods
 */
export const api = {
  /**
   * GET request
   * @param {string} url - The endpoint URL
   * @param {Object} options - Additional fetch options
   */
  async get(url, options = {}) {
    return baseFetch(url, {
      method: 'GET',
      ...options,
    });
  },

  /**
   * POST request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request body data
   * @param {Object} options - Additional fetch options
   */
  async post(url, data = null, options = {}) {
    return baseFetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  },

  /**
   * PUT request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request body data
   * @param {Object} options - Additional fetch options
   */
  async put(url, data = null, options = {}) {
    return baseFetch(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  },

  /**
   * DELETE request
   * @param {string} url - The endpoint URL
   * @param {Object} options - Additional fetch options
   */
  async delete(url, options = {}) {
    return baseFetch(url, {
      method: 'DELETE',
      ...options,
    });
  },

  /**
   * PATCH request
   * @param {string} url - The endpoint URL
   * @param {Object} data - The request body data
   * @param {Object} options - Additional fetch options
   */
  async patch(url, data = null, options = {}) {
    return baseFetch(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  },

  /**
   * Upload file
   * @param {string} url - The endpoint URL
   * @param {FormData} formData - The form data containing files
   * @param {Object} options - Additional fetch options
   */
  async upload(url, formData, options = {}) {
    try {
      // Don't use baseFetch - it sets Content-Type: application/json which breaks FormData
      // Browser must set Content-Type automatically with proper multipart boundary
      const response = await fetch(`${BASE_URL}${url}`, {
        method: options.method || 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new ApiError(
          data?.message || data?.error || 'Upload failed',
          response.status,
          data
        );
      }

      return { data, status: response.status, headers: response.headers };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.message || 'Upload failed', 0, null);
    }
  },
};

/**
 * Service classes for different entities
 */
export class AdminService {
  static async getAll() {
    return api.get('/admin');
  }

  static async getById(id) {
    return api.get(`/admin/${id}`);
  }

  static async create(adminData) {
    return api.post('/admin', adminData);
  }

  static async update(id, adminData) {
    return api.put(`/admin/${id}`, adminData);
  }

  static async delete(id) {
    return api.delete(`/admin/${id}`);
  }

  static async login(credentials) {
    return api.post('/admin/login', credentials);
  }
}

export class StaffService {
  static async getAll() {
    return api.get('/staff');
  }

  static async getById(id) {
    return api.get(`/staff/${id}`);
  }

  static async create(staffData) {
    return api.post('/staff', staffData);
  }

  static async update(id, staffData) {
    return api.put(`/staff/${id}`, staffData);
  }

  static async delete(id) {
    return api.delete(`/staff/${id}`);
  }

  static async login(credentials) {
    return api.post('/staff/login', credentials);
  }

  static async getByRole(role) {
    return api.get(`/staff?role=${role}`);
  }
}

export class StudentService {
  static async getAll() {
    return api.get('/students');
  }

  static async getById(id) {
    console.log('check api calling with id', id);
    return api.get(`/students/${id}`);
  }

  static async create(studentData) {
    return api.post('/students', studentData);
  }

  static async update(id, studentData) {
    return api.put(`/students/${id}`, studentData);
  }

  static async delete(id) {
    return api.delete(`/students/${id}`);
  }

  static async login(credentials) {
    return api.post('/students/login', credentials);
  }

  static async getByDepartment(departmentId) {
    return api.get(`/students?departmentId=${departmentId}`);
  }

  static async bulkUpload(formData) {
    return api.upload('/students/bulk', formData);
  }

  static async bulkUpdate(formData) {
    return api.upload('/students/bulk', formData, { method: 'PUT' });
  }
}

export class DepartmentService {
  static async getAll() {
    return api.get('/departments');
  }

  static async getById(id) {
    return api.get(`/departments/${id}`);
  }

  static async create(departmentData) {
    return api.post('/departments', departmentData);
  }

  static async update(id, departmentData) {
    return api.put(`/departments/${id}`, departmentData);
  }

  static async delete(id) {
    return api.delete(`/departments/${id}`);
  }
}

export class SubjectService {
  static async getAll() {
    return api.get('/subjects');
  }

  static async getById(id) {
    return api.get(`/subjects/${id}`);
  }

  static async create(subjectData) {
    return api.post('/subjects', subjectData);
  }

  static async update(id, subjectData) {
    return api.put(`/subjects/${id}`, subjectData);
  }

  static async delete(id) {
    return api.delete(`/subjects/${id}`);
  }

  static async getByDepartment(departmentId) {
    return api.get(`/subjects?departmentId=${departmentId}`);
  }
}

export class EnrollmentService {
  static async getAll() {
    return api.get('/enrollments');
  }

  static async getById(id) {
    return api.get(`/enrollments/${id}`);
  }

  static async create(enrollmentData) {
    return api.post('/enrollments', enrollmentData);
  }

  static async update(id, enrollmentData) {
    return api.put(`/enrollments/${id}`, enrollmentData);
  }

  static async delete(id) {
    return api.delete(`/enrollments/${id}`);
  }

  static async getByStudent(studentId) {
    return api.get(`/enrollments?studentId=${studentId}`);
  }

  static async getBySubject(subjectId) {
    return api.get(`/enrollments?subjectId=${subjectId}`);
  }
}

export class FeeService {
  static async getAll() {
    return api.get('/fees');
  }

  static async getById(id) {
    return api.get(`/fees/${id}`);
  }

  static async create(feeData) {
    return api.post('/fees', feeData);
  }

  static async update(id, feeData) {
    return api.put(`/fees/${id}`, feeData);
  }

  static async delete(id) {
    return api.delete(`/fees/${id}`);
  }

  static async getByStudent(studentId) {
    return api.get(`/fees?studentId=${studentId}`);
  }

  static async updateStatus(id, status) {
    return api.patch(`/fees/${id}/status`, { status });
  }
}

export class GradeService {
  static async getAll() {
    return api.get('/grades');
  }

  static async getById(id) {
    return api.get(`/grades/${id}`);
  }

  static async create(gradeData) {
    return api.post('/grades', gradeData);
  }

  static async update(id, gradeData) {
    return api.put(`/grades/${id}`, gradeData);
  }

  static async delete(id) {
    return api.delete(`/grades/${id}`);
  }

  static async getByEnrollment(enrollmentId) {
    return api.get(`/grades?enrollmentId=${enrollmentId}`);
  }
}

// Export the ApiError class for error handling in components
export { ApiError };
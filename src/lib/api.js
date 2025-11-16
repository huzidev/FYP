/**
 * Global API utility for making HTTP requests
 * Handles GET, POST, PUT, DELETE operations with consistent error handling
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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
    const config = {
      method: 'POST',
      body: formData,
      ...options,
    };

    // Remove Content-Type header for FormData (browser will set it automatically)
    if (config.headers && config.headers['Content-Type']) {
      delete config.headers['Content-Type'];
    }

    return baseFetch(url, config);
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
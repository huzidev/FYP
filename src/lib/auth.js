/**
 * Authentication utilities for managing user sessions
 */

// User types
export const USER_TYPES = {
  ADMIN: 'admin',
  STAFF: 'staff', 
  STUDENT: 'student',
};

// Storage keys
const STORAGE_KEYS = {
  USER: 'user',
  USER_TYPE: 'userType',
  TOKEN: 'token',
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    const userType = localStorage.getItem(STORAGE_KEYS.USER_TYPE);
    
    if (user && userType) {
      return {
        ...JSON.parse(user),
        userType,
      };
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  return null;
};

/**
 * Set current user in localStorage
 */
export const setCurrentUser = (user, userType) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.USER_TYPE, userType);
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

/**
 * Clear current user from localStorage
 */
export const clearCurrentUser = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USER_TYPE);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Check if user has specific role/type
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.userType === requiredRole;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return hasRole(USER_TYPES.ADMIN);
};

/**
 * Check if user is staff
 */
export const isStaff = () => {
  return hasRole(USER_TYPES.STAFF);
};

/**
 * Check if user is student
 */
export const isStudent = () => {
  return hasRole(USER_TYPES.STUDENT);
};

/**
 * Logout user
 */
export const logout = () => {
  clearCurrentUser();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Get user display name
 */
export const getUserDisplayName = () => {
  const user = getCurrentUser();
  return user ? user.fullName : '';
};

/**
 * Get user avatar/initials
 */
export const getUserInitials = () => {
  const user = getCurrentUser();
  if (!user || !user.fullName) return '';
  
  return user.fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Route protection utility
 */
export const redirectToLogin = (userType = '') => {
  if (typeof window === 'undefined') return;
  
  const loginRoutes = {
    [USER_TYPES.ADMIN]: '/admin/signin',
    [USER_TYPES.STAFF]: '/admission/signin',
    [USER_TYPES.STUDENT]: '/user/signin',
  };
  
  const route = loginRoutes[userType] || '/';
  window.location.href = route;
};

/**
 * Get dashboard route based on user type
 */
export const getDashboardRoute = (userType) => {
  const dashboardRoutes = {
    [USER_TYPES.ADMIN]: '/admin/admin-page/dashboard',
    [USER_TYPES.STAFF]: '/staff/dashboard', // You may need to create this
    [USER_TYPES.STUDENT]: '/student/dashboard', // You may need to create this
  };
  
  return dashboardRoutes[userType] || '/';
};
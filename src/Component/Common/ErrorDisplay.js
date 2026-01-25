"use client";

import { useRouter } from "next/navigation";

/**
 * Global Error Display Component
 * Theme-matched error handling with retry functionality
 */

// Error type configurations
const ERROR_CONFIGS = {
  401: {
    title: "Session Expired",
    message: "Your session has expired. Please log in again.",
    icon: "🔐",
    showLogin: true,
  },
  403: {
    title: "Access Denied",
    message: "You don't have permission to access this resource.",
    icon: "🚫",
    showHome: true,
  },
  404: {
    title: "Not Found",
    message: "The page or resource you're looking for doesn't exist.",
    icon: "🔍",
    showHome: true,
  },
  500: {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
    icon: "⚠️",
    showRetry: true,
  },
  network: {
    title: "Connection Error",
    message: "Please check your internet connection and try again.",
    icon: "📡",
    showRetry: true,
  },
  default: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    icon: "❌",
    showRetry: true,
  },
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error) {
  // Never show raw backend errors to users
  if (!error) return "Something went wrong. Please try again.";

  // Handle ApiError from api.js
  if (error?.name === "ApiError" || error?.status) {
    const status = error.status;

    // Use predefined messages for known status codes
    if (ERROR_CONFIGS[status]) {
      return ERROR_CONFIGS[status].message;
    }

    // For validation errors, try to extract a clean message
    if (status === 400 || status === 422) {
      const msg = error?.data?.error || error?.data?.message;
      if (msg && typeof msg === "string" && msg.length < 100) {
        return msg;
      }
      return "Invalid request. Please check your input.";
    }
  }

  // Network errors
  if (error?.status === 0 || error?.message?.includes("fetch")) {
    return ERROR_CONFIGS.network.message;
  }

  // Default fallback - never show raw error messages
  return "Something went wrong. Please try again.";
}

/**
 * Main Error Display Component
 */
export default function ErrorDisplay({
  error,
  title,
  message,
  onRetry,
  showRetry = true,
  showHome = false,
  showLogin = false,
  fullPage = false,
  size = "md", // sm | md | lg
}) {
  const router = useRouter();

  // Determine error config
  const status = error?.status || "default";
  const config = ERROR_CONFIGS[status] || ERROR_CONFIGS.default;

  const displayTitle = title || config.title;
  const displayMessage = message || getErrorMessage(error) || config.message;
  const shouldShowRetry = showRetry && (onRetry || config.showRetry);
  const shouldShowHome = showHome || config.showHome;
  const shouldShowLogin = showLogin || config.showLogin;

  const sizeClasses = {
    sm: {
      container: "p-4",
      icon: "text-3xl",
      title: "text-lg",
      message: "text-sm",
      button: "px-3 py-1.5 text-sm",
    },
    md: {
      container: "p-6",
      icon: "text-5xl",
      title: "text-xl",
      message: "text-base",
      button: "px-4 py-2",
    },
    lg: {
      container: "p-8",
      icon: "text-6xl",
      title: "text-2xl",
      message: "text-lg",
      button: "px-6 py-3 text-lg",
    },
  };

  const classes = sizeClasses[size];

  const content = (
    <div className={`bg-[#25252b] rounded-xl border border-red-900/50 ${classes.container} text-center`}>
      <div className={`${classes.icon} mb-4`}>{config.icon}</div>
      <h3 className={`${classes.title} font-semibold text-white mb-2`}>{displayTitle}</h3>
      <p className={`${classes.message} text-gray-400 mb-6 max-w-md mx-auto`}>{displayMessage}</p>

      <div className="flex flex-wrap justify-center gap-3">
        {shouldShowRetry && onRetry && (
          <button
            onClick={onRetry}
            className={`${classes.button} bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition`}
          >
            Try Again
          </button>
        )}
        {shouldShowHome && (
          <button
            onClick={() => router.push("/")}
            className={`${classes.button} bg-[#35353d] hover:bg-[#45454d] text-white rounded-lg transition`}
          >
            Go Home
          </button>
        )}
        {shouldShowLogin && (
          <button
            onClick={() => router.push("/staff/signin")}
            className={`${classes.button} bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition`}
          >
            Log In
          </button>
        )}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Inline Error Message - For form fields and small errors
 */
export function InlineError({ message, className = "" }) {
  if (!message) return null;

  return (
    <p className={`text-red-400 text-sm mt-1 ${className}`}>
      {message}
    </p>
  );
}

/**
 * Error Banner - For page-level error notifications
 */
export function ErrorBanner({ message, onDismiss, onRetry, className = "" }) {
  if (!message) return null;

  return (
    <div className={`bg-red-900/30 border border-red-600 rounded-lg px-4 py-3 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-red-400">⚠️</span>
        <p className="text-red-300">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-300 hover:text-white text-sm underline"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon = "📭",
  title = "No Data Found",
  message = "There's nothing here yet.",
  action,
  actionLabel = "Add New",
  className = "",
}) {
  return (
    <div className={`bg-[#25252b] rounded-xl border border-[#35353d] p-8 text-center ${className}`}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

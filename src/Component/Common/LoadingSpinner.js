"use client";

/**
 * Global Loading Spinner Component
 * Theme-matched spinner with multiple sizes and variants
 */

export default function LoadingSpinner({
  size = "md",
  text = "",
  fullScreen = false,
  variant = "spinner" // spinner | dots | pulse
}) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-2">
            <div className={`${size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"} bg-indigo-500 rounded-full animate-bounce`} style={{ animationDelay: "0ms" }}></div>
            <div className={`${size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"} bg-indigo-500 rounded-full animate-bounce`} style={{ animationDelay: "150ms" }}></div>
            <div className={`${size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3"} bg-indigo-500 rounded-full animate-bounce`} style={{ animationDelay: "300ms" }}></div>
          </div>
        );
      case "pulse":
        return (
          <div className={`${sizeClasses[size]} bg-indigo-500 rounded-full animate-pulse`}></div>
        );
      default:
        return (
          <div
            className={`${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
          ></div>
        );
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderSpinner()}
      {text && <p className={`text-gray-400 ${textSizes[size]}`}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#1d1d24]/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Page Loading Component - Full page loader
 */
export function PageLoading({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Button Loading Spinner - Inline spinner for buttons
 */
export function ButtonSpinner({ className = "" }) {
  return (
    <div className={`h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`}></div>
  );
}

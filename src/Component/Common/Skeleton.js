"use client";

/**
 * Skeleton Loading Components
 * Theme-matched skeleton loaders for various UI elements
 */

// Base skeleton pulse animation
const pulseClass = "animate-pulse bg-[#35353d]";

/**
 * Basic Skeleton Block
 */
export function Skeleton({ className = "", rounded = "md" }) {
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  };

  return <div className={`${pulseClass} ${roundedClasses[rounded]} ${className}`}></div>;
}

/**
 * Text Line Skeleton
 */
export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/**
 * Card Skeleton
 */
export function SkeletonCard({ hasImage = false, className = "" }) {
  return (
    <div className={`bg-[#25252b] rounded-xl p-6 border border-[#35353d] ${className}`}>
      {hasImage && <Skeleton className="h-40 w-full mb-4" rounded="lg" />}
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" rounded="lg" />
        <Skeleton className="h-8 w-20" rounded="lg" />
      </div>
    </div>
  );
}

/**
 * Stats Card Skeleton
 */
export function SkeletonStatsCard({ className = "" }) {
  return (
    <div className={`bg-[#25252b] rounded-xl p-6 border border-[#35353d] ${className}`}>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-10 w-16 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function SkeletonTableRow({ columns = 5 }) {
  return (
    <tr className="border-b border-[#35353d]">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Table Skeleton
 */
export function SkeletonTable({ rows = 5, columns = 5, showHeader = true }) {
  return (
    <div className="bg-[#25252b] rounded-xl border border-[#35353d] overflow-hidden">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-[#1d1d24]">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * List Item Skeleton
 */
export function SkeletonListItem({ hasAvatar = false, className = "" }) {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      {hasAvatar && <Skeleton className="h-10 w-10 flex-shrink-0" rounded="full" />}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16" rounded="lg" />
    </div>
  );
}

/**
 * List Skeleton
 */
export function SkeletonList({ items = 5, hasAvatar = false, divided = true }) {
  return (
    <div className="bg-[#25252b] rounded-xl border border-[#35353d] overflow-hidden">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonListItem
          key={i}
          hasAvatar={hasAvatar}
          className={divided && i < items - 1 ? "border-b border-[#35353d]" : ""}
        />
      ))}
    </div>
  );
}

/**
 * Profile/Avatar Skeleton
 */
export function SkeletonAvatar({ size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return <Skeleton className={sizeClasses[size]} rounded="full" />;
}

/**
 * Dashboard Stats Grid Skeleton
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>

      {/* Table */}
      <SkeletonTable rows={5} columns={5} />
    </div>
  );
}

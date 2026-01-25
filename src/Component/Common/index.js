/**
 * Common UI Components - Central Export
 * Import from '@/Component/Common' for cleaner imports
 */

// Loading Components
export {
  default as LoadingSpinner,
  PageLoading,
  ButtonSpinner,
} from './LoadingSpinner';

// Skeleton Components
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStatsCard,
  SkeletonTable,
  SkeletonTableRow,
  SkeletonList,
  SkeletonListItem,
  SkeletonAvatar,
  SkeletonDashboard,
} from './Skeleton';

// Error Components
export {
  default as ErrorDisplay,
  InlineError,
  ErrorBanner,
  EmptyState,
  getErrorMessage,
} from './ErrorDisplay';

// Modal
export { default as Modal } from './Modal';

// Confirm Modal
export { default as ConfirmModal } from './ConfirmModal';

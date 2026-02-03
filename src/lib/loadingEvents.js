/**
 * Simple event emitter for global loading state
 * This allows the API module to communicate with React components
 * Includes debounce to prevent loader flash for quick requests
 */

class LoadingEventEmitter {
  constructor() {
    this.listeners = new Set();
    this.count = 0;
    this.showTimeout = null;
    this.isVisible = false;
    this.delay = 300; // Only show loader after 300ms
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  startLoading() {
    this.count++;

    // Start a timer to show loader after delay
    if (!this.showTimeout && !this.isVisible) {
      this.showTimeout = setTimeout(() => {
        if (this.count > 0) {
          this.isVisible = true;
          this.notify();
        }
        this.showTimeout = null;
      }, this.delay);
    }
  }

  stopLoading() {
    this.count = Math.max(0, this.count - 1);

    // If no more requests, hide immediately
    if (this.count === 0) {
      // Clear pending show timeout
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }

      // Hide loader immediately
      if (this.isVisible) {
        this.isVisible = false;
        this.notify();
      }
    }
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.isVisible));
  }

  isLoading() {
    return this.isVisible;
  }
}

// Singleton instance
export const loadingEvents = new LoadingEventEmitter();

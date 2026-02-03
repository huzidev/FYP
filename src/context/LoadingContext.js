"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { loadingEvents } from "@/lib/loadingEvents";

const LoadingContext = createContext({
  isLoading: false,
});

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to loading events from API
    const unsubscribe = loadingEvents.subscribe((loading) => {
      setIsLoading(loading);
    });

    return () => unsubscribe();
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading }}>
      {children}
      {/* Global Spinner Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#1d1d24]/60 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-200">
          <div className="flex flex-col items-center gap-4">
            {/* Animated Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
              <div
                className="absolute top-1 left-1 w-14 h-14 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin"
                style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
              ></div>
            </div>
            {/* Loading Text */}
            <div className="flex items-center gap-1">
              <span className="text-gray-300 text-sm font-medium">Loading</span>
              <span className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

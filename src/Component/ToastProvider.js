"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          "--toastify-color-light": "#2d2d39",
          "--toastify-color-dark": "#1d1d24",
          "--toastify-color-info": "#3b82f6",
          "--toastify-color-success": "#10b981",
          "--toastify-color-warning": "#f59e0b",
          "--toastify-color-error": "#ef4444",
        }}
      />
    </>
  );
}

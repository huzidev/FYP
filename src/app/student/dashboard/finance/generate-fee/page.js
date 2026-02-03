"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FeeVoucher from "../../../../../Component/FeeVoucher";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function GenerateFee() {
  const [student, setStudent] = useState(null);
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load current user
  useEffect(() => {
    const load = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } =
        await import("../../../../../lib/auth");

      if (!isAuthenticated()) {
        toast.error("Please login first");
        return;
      }

      const user = getCurrentUser();
      if (!user || user.userType !== USER_TYPES.STUDENT) {
        toast.error("Unauthorized");
        return;
      }

      setStudent(user);
    };

    load();
  }, []);

  const generateVoucher = async () => {
    if (!student) return toast.error("Student not loaded");

    try {
      setLoading(true);

      const res = await fetch("/api/fees/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          semester: "Fall 2025",
          academicYear: "2025-2026",
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setVoucher(data);
      toast.success("Fee Voucher Generated");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF logic
  const downloadPDF = async () => {
    if (!voucher) return;

    const originalVoucher = document.querySelector(".voucher-content");

    const printClone = originalVoucher.cloneNode(true);

    printClone.style.position = "absolute";
    printClone.style.top = "-9999px";
    printClone.style.left = "-9999px";
    printClone.style.width = "1120px";
    document.body.appendChild(printClone);

    const fixColors = (el) => {
      el.style.color = "#000000";
      el.style.backgroundColor = "#ffffff";
      for (let child of el.children) {
        fixColors(child);
      }
    };
    fixColors(printClone);

    try {
      const canvas = await html2canvas(printClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "pt", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SMIU_Voucher_${voucher.student?.studentId || "Download"}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      document.body.removeChild(printClone);
    }
  };

  if (!student) return <p>Loading student info...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Generate Fee Voucher
      </h1>

      <div className="flex gap-4 items-center mb-8 print:hidden">
        <button
          onClick={generateVoucher}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        {voucher && (
          <button
            onClick={downloadPDF}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            Download PDF
          </button>
        )}
      </div>

      {voucher && (
        <div className="border shadow print:shadow-none voucher-content">
          <FeeVoucher voucher={voucher} />
        </div>
      )}
    </div>
  );
}

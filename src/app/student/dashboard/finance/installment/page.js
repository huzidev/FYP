"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FeeVoucher from "../../../../../Component/FeeVoucher";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Installment() {
  const [student, setStudent] = useState(null);
  const [voucher, setVoucher] = useState(null); // original full voucher
  const [installmentVoucher, setInstallmentVoucher] = useState(null); // half voucher
  const [loading, setLoading] = useState(false);



  // Load current student
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

      // Fetch the last generated voucher (if any)
      const res = await fetch(`/api/fees/latest/${user.id}`); // <-- fixed
      if (res.ok) {
        const data = await res.json();
        setVoucher(data);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to fetch voucher");
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadInstallments = async () => {
      if (!voucher) return;

      const res = await fetch(`/api/fees/installments/${voucher.id}`);
      if (!res.ok) return;

      const data = await res.json();
      setInstallmentVoucher(data[0]); // 1st installment
      setSecondInstallment(data[1]); // 2nd installment
    };

    loadInstallments();
  }, [voucher]);

  // Generate Installment (half amount) voucher
  const generateInstallment = async () => {
    if (!voucher) return toast.error("No original voucher found");

    try {
      setLoading(true);

      const res = await fetch("/api/fees/installment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalVoucherId: voucher.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      setInstallmentVoucher(data);
      toast.success("Installment Voucher Generated");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Download PDF logic (same as before)
  const downloadPDF = async (voucherToDownload) => {
    if (!voucherToDownload) return;

    const originalVoucher = document.querySelector(
      `.voucher-content-${voucherToDownload.id}`,
    );

    const printClone = originalVoucher.cloneNode(true);

    printClone.style.position = "absolute";
    printClone.style.top = "-9999px";
    printClone.style.left = "-9999px";
    printClone.style.width = "1120px";
    document.body.appendChild(printClone);

    const fixColors = (el) => {
      el.style.color = "#000000";
      el.style.backgroundColor = "#ffffff";
      for (let child of el.children) fixColors(child);
    };
    fixColors(printClone);

    try {
      const canvas = await html2canvas(printClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "pt", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `SMIU_Voucher_${voucherToDownload.student?.studentId || "Download"}.pdf`,
      );
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      document.body.removeChild(printClone);
    }
  };

  if (!student) return <p>Loading student info...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Installment of Fee Voucher
      </h1>

      {voucher ? (
        <div>
          <h2 className="text-xl font-bold mb-2">Original Voucher</h2>
          <div className={`border shadow mb-4 voucher-content-${voucher.id}`}>
            <FeeVoucher voucher={voucher} />
          </div>
          <button
            onClick={generateInstallment}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded mb-4"
          >
            {loading ? "Generating..." : "Generate Installment"}
          </button>
        </div>
      ) : (
        <p>No voucher found. Please generate your fee voucher first.</p>
      )}

      {voucher && (
        <>
          <FeeVoucher voucher={voucher} />

          {!installmentVoucher && (
            <button onClick={() => generateInstallment(1)}>
              Generate 1st Installment
            </button>
          )}

          {installmentVoucher && !secondInstallment && (
            <button onClick={() => generateInstallment(2)}>
              Generate 2nd Installment
            </button>
          )}
        </>
      )}
    </div>
  );
}

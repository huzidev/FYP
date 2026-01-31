"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export default function GenerateFee() {
  const [studentId, setStudentId] = useState("");
  const [voucher, setVoucher] = useState(null);

  const generateVoucher = async () => {
    const res = await fetch("/api/fees/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: Number(studentId),
        semester: "Fall 2025",
        academicYear: "2025-2026",
      }),
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.message);

    setVoucher(data);
    toast.success("Fee Voucher Generated");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Generate Fee Voucher</h1>

      <input
        type="number"
        placeholder="Student ID"
        className="border p-2"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      />

      <button
        onClick={generateVoucher}
        className="ml-4 bg-blue-600 text-white px-4 py-2"
      >
        Generate
      </button>

      {voucher && (
        <div className="mt-6 border p-4">
          <p>
            <b>Challan:</b> {voucher.challanNo}
          </p>
          <p>
            <b>1-Bill ID:</b> {voucher.bill1Id}
          </p>
          <p>
            <b>Total:</b> Rs. {voucher.totalAmount}
          </p>
          <p>
            <b>Status:</b> {voucher.status}
          </p>
        </div>
      )}
    </div>
  );
}

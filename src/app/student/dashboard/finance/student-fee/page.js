"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CreditCard,
  History,
  AlertCircle,
  FileText,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StudentFeePage = () => {
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdueFees, setOverdueFees] = useState([]);
  const [semesterBreakdown, setSemesterBreakdown] = useState([]);
  const router = useRouter();

  /* ===================== AUTH + LOAD ===================== */
  useEffect(() => {
    const load = async () => {
      const { isAuthenticated, getCurrentUser, USER_TYPES } =
        await import("@/lib/auth");

      if (!isAuthenticated()) {
        router.replace("/student/signin");
        return;
      }

      const user = getCurrentUser();
      if (!user || user.userType !== USER_TYPES.STUDENT) {
        router.replace("/student/signin");
        return;
      }

      setStudent(user);
      await fetchFees(user.id);
      setLoading(false);
    };

    load();
  }, [router]);

  /* ===================== FETCH FEES ===================== */
  const fetchFees = async (studentId) => {
    try {
      const res = await fetch(`/api/fees?studentId=${studentId}`);
      const data = await res.json();

      if (!res.ok || !data) {
        throw new Error(data?.error || "Failed to fetch fees");
      }

      setFees(data.data);

      // Overdue fees
      const overdue = data.data.filter(
        (f) =>
          f.status !== "PAID" && f.dueDate && new Date(f.dueDate) < new Date(),
      );
      setOverdueFees(overdue);

      // Semester breakdown
      const breakdown = data.data.reduce((acc, fee) => {
        const sem = fee.semester || "N/A";
        if (!acc[sem]) acc[sem] = { total: 0, paid: 0 };
        acc[sem].total += fee.amount;
        acc[sem].paid += fee.paidAmount || 0;
        return acc;
      }, {});
      setSemesterBreakdown(
        Object.keys(breakdown).map((k) => ({
          semester: k,
          total: breakdown[k].total,
          paid: breakdown[k].paid,
        })),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load fee records");
    }
  };

  const handleSendInvoice = async (feeId) => {
    try {
      const res = await fetch("/api/fees/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, feeIds: [feeId] }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Invoice sent successfully!");
      } else {
        toast.error(data.error || "Failed to send invoice");
      }
    } catch (err) {
      toast.error("Failed to send invoice");
      console.error(err);
    }
  };

  /* ===================== SUMMARIES ===================== */
  const totalPayable = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalDue = fees.reduce((sum, f) => sum + (f.dueAmount || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-600/20 text-green-400";
      case "PARTIAL":
      case "PENDING":
        return "bg-yellow-600/20 text-yellow-400";
      case "OVERDUE":
        return "bg-red-600/20 text-red-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!student) return null;

  /* ===================== BLOCK ENROLLMENT IF OVERDUE ===================== */
  const hasOverdue = overdueFees.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-full">
      {/* HEADER */}
      <div>
        <Link
          href="/student/dashboard"
          className="text-indigo-400 inline-flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mt-2">Student Fees</h1>
        <p className="text-gray-400 text-sm">
          Financial overview & payment status
        </p>
      </div>

      {/* OVERDUE BANNER */}
      {hasOverdue && (
        <div className="bg-red-700/20 border border-red-600 text-red-200 p-4 rounded-md">
          🔔 You have overdue fees! Please pay immediately to avoid penalties.
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-[#2d2d39] p-5 rounded-xl">
          <div className="flex items-center gap-3 text-indigo-400">
            <CreditCard size={22} />
            <p className="text-sm">Total Payable</p>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {totalPayable.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#2d2d39] p-5 rounded-xl">
          <div className="flex items-center gap-3 text-green-400">
            <History size={22} />
            <p className="text-sm">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-[#2d2d39] p-5 rounded-xl">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle size={22} />
            <p className="text-sm">Remaining Balance</p>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {totalDue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* SEMESTER BREAKDOWN CHART */}
      <div className="bg-[#2d2d39] p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Semester-wise Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={semesterBreakdown}>
            <XAxis dataKey="semester" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" name="Total Fee" />
            <Bar dataKey="paid" fill="#10b981" name="Paid Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* FEES LIST */}
      <div className="bg-[#2d2d39] p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-4">Fee Details</h2>

        {fees.length === 0 ? (
          <p className="text-gray-400">No pending fees 🎉</p>
        ) : (
          <div className="space-y-3">
            {fees.map((fee) => (
              <div
                key={fee.id}
                className="bg-[#1e1e26] p-4 rounded border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-white font-semibold">{fee.description}</p>
                  <p className="text-gray-400 text-sm">
                    {fee.academicYear} • Semester {fee.semester}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Due Date: {new Date(fee.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <p className="text-white font-bold">
                    {fee.amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      fee.status,
                    )}`}
                  >
                    {fee.status}
                  </span>
                  {/* DOWNLOAD PDF */}
                  <button
                    onClick={() => downloadInvoicePDF(student, [fee])}
                    className="mt-1 flex items-center gap-2 text-blue-400 text-sm hover:underline"
                  >
                    <FileText size={16} /> Download Invoice
                  </button>
                  {/* AUTO EMAIL */}
                  <button
                    onClick={() => handleSendInvoice(fee.id)}
                    className="mt-1 text-sm text-green-400 hover:underline flex items-center gap-2"
                  >
                    📨 Email Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeePage;

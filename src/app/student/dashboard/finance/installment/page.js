"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import FeeVoucher from "../../../../../Component/FeeVoucher";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Installment() {
  const [voucher, setVoucher] = useState(null); // Original voucher
  const [showInstallmentBtn, setShowInstallmentBtn] = useState(false);
  const [firstInstallment, setFirstInstallment] = useState(null);
  const [secondInstallment, setSecondInstallment] = useState(null);
  const [secondInstallmentAvailable, setSecondInstallmentAvailable] =
    useState(false);
  const [showFirstDownload, setShowFirstDownload] = useState(false);
  const [showSecondDownload, setShowSecondDownload] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const storedVoucher = sessionStorage.getItem("lastVoucher");

    if (storedVoucher) {
      const parsedVoucher = JSON.parse(storedVoucher);

      if (!parsedVoucher.student) {
        toast.error("Voucher missing student data");
        router.push("/student/dashboard/finance/generate");
        return;
      }

      setVoucher(parsedVoucher);
    } else {
      // No voucher exists
      setVoucher(null);
    }
  }, [router]);

  const handleShowInstallmentBtn = () => {
    setShowInstallmentBtn(true);
  };

  const generateFirstInstallment = () => {
    if (!voucher) return;

    const first = {
      ...voucher,
      id: voucher.id + "-1",
      totalAmount: voucher.totalAmount / 2,
      installment: "1st Installment",
      generatedAt: new Date().toISOString(),
    };

    setFirstInstallment(first);
    setShowFirstDownload(true);

    // Enable 2nd installment after 90 days
    setSecondInstallmentAvailable(false);
    setTimeout(
      () => {
        setSecondInstallmentAvailable(true);
        toast.info("2nd installment is now available");
      },
      90 * 24 * 60 * 60 * 1000,
    );
  };

  const generateSecondInstallment = () => {
    if (!secondInstallmentAvailable) {
      toast.warn("You are allowed to generate 2nd installment after 90 days");
      return;
    }

    if (!firstInstallment) return;

    const second = {
      ...voucher,
      id: voucher.id + "-2",
      totalAmount: voucher.totalAmount / 2,
      installment: "2nd Installment",
      generatedAt: new Date().toISOString(),
    };
    setSecondInstallment(second);
    setShowSecondDownload(true);
  };

  const downloadPDF = async (voucherToDownload) => {
    if (!voucherToDownload) return;

    const originalVoucher = document.querySelector(
      `.voucher-content-${voucherToDownload.id}`,
    );
    if (!originalVoucher) return;

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
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SMIU_Voucher_${voucherToDownload.installment}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      document.body.removeChild(printClone);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Installment of Fee Voucher
      </h1>

      {/* If no voucher exists */}
      {!voucher && (
        <div className="mb-8 text-center">
          <p className="text-lg mb-4 text-white">
            You have not generated any fee voucher yet.
          </p>
          <button
            onClick={() => router.push("/student/dashboard/finance/generate")}
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            Generate Fee Voucher
          </button>
        </div>
      )}

      {/* Original Voucher */}
      {voucher && (
        <div
          className={`border shadow mb-8 voucher-content voucher-content-${voucher.id}`}
        >
          <FeeVoucher voucher={voucher} />
        </div>
      )}

      {/* Generate Installment */}
      {voucher && !showInstallmentBtn && (
        <button
          onClick={handleShowInstallmentBtn}
          className="bg-blue-600 text-white px-5 py-2 rounded mb-8"
        >
          Generate Installment
        </button>
      )}

      {/* 1st Installment */}
      {voucher && showInstallmentBtn && !firstInstallment && (
        <button
          onClick={generateFirstInstallment}
          className="bg-green-600 text-white px-5 py-2 rounded mb-8"
        >
          Generate 1st Installment
        </button>
      )}

      {firstInstallment && (
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2 mt-4 text-white">
            1st Installment Voucher
          </h1>
          <div
            className={`flex justify-between items-start mb-4 voucher-content voucher-content-${firstInstallment.id}`}
          >
            <FeeVoucher voucher={firstInstallment} />
            {showFirstDownload && (
              <button
                onClick={() => downloadPDF(firstInstallment)}
                className="ml-4 bg-green-600 text-white px-4 py-2 rounded self-start"
              >
                Download
              </button>
            )}
          </div>

          {/* 2nd Installment Button */}
          <button
            onClick={generateSecondInstallment}
            className={`px-5 py-2 rounded mb-4 ${
              secondInstallmentAvailable
                ? "bg-yellow-600 text-white"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            Generate 2nd Installment
          </button>
          {!secondInstallmentAvailable && (
            <p className="text-gray-500">
              You are allowed to generate 2nd installment after 90 days.
            </p>
          )}
        </div>
      )}

      {/* 2nd Installment - only show after generation */}
      {secondInstallment && (
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2 mt-4 text-white">
            2nd Installment Voucher
          </h1>
          <div
            className={`flex justify-between items-start mb-4 voucher-content voucher-content-${secondInstallment.id}`}
          >
            <FeeVoucher voucher={secondInstallment} />
            {showSecondDownload && (
              <button
                onClick={() => downloadPDF(secondInstallment)}
                className="ml-4 bg-green-600 text-white px-4 py-2 rounded self-start"
              >
                Download
              </button>
            )}
          </div>
          <p className="text-gray-700">
            Second installment allowed after 90 days of generating 1st
            installment.
          </p>
        </div>
      )}
    </div>
  );
}

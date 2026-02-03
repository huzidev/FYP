import React from "react";

const FeeVoucher = ({ voucher }) => {
  const copies = [
    "Student Copy",
    "SMIU Admission Branch Copy",
    "SMIU Accounts Branch Copy",
    "Bank Copy",
  ];

  const numberToWords = (num) => {
    return "FIFTY-FOUR THOUSAND NINE HUNDRED SIXTY RUPEES ONLY";
  };

  return (
    <div className="bg-white p-2 min-h-screen print:p-0">
      <div className="grid grid-cols-2 gap-4 border-2 border-black p-1">
        {copies.map((copyTitle, index) => (
          <div
            key={index}
            className="border-r border-b border-black p-4 last:border-r-0 last:border-b-0 odd:border-r even:border-r-0 flex flex-col h-full"
          >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-2">
              <div className="text-[10px] font-bold uppercase">{copyTitle}</div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <img
                src="/assets/smi-connect-fyp.jpeg"
                alt="SMIU"
                className="h-10"
              />
              <div>
                <h1 className="text-sm font-bold leading-tight">SMI</h1>
                <h1 className="text-sm font-bold leading-tight">UNIVERSITY</h1>
              </div>
            </div>

            <div className="text-[10px] grid grid-cols-2 gap-y-1 mb-2 border-b border-black pb-2">
              <p>
                <span className="font-bold">SEMESTER:</span>{" "}
                {voucher.semester || "Fall 2025"}
              </p>
              <p>
                <span className="font-bold">VALID TILL:</span>{" "}
                {voucher.validTill || "25-Sep-2025"}
              </p>
              <p>
                <span className="font-bold">TERM CODE:</span> 2503
              </p>
            </div>

            {/* Bill & Challan Section */}
            <div className="border-2 border-black p-1 mb-2 bg-gray-50 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-bold italic">BILL</p>
                <div className="flex items-center gap-1">
                  <img src="/icon/1-bill.jpg" alt="1Bill" className="h-4" />
                  <p className="text-[11px] font-bold text-blue-800">
                    1-Bill ID # {voucher.bill1Id || "1001145080189026"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold">
                  <img
                    src="/icon/HBL.jpg"
                    alt="HBL"
                    className="h-6 inline-block"
                  />
                  Challan # ({voucher.challanNo || "189026"})
                </p>
              </div>
            </div>

            {/* Student Data */}
            <div className="text-[10px] space-y-1 mb-2">
              <p>
                <span className="font-bold">Name:</span>{" "}
                {voucher.student?.fullName || "Abdul Rafay"}
              </p>
              <p>
                <span className="font-bold">ID#:</span>{" "}
                {voucher.student?.studentId || "CSC-22S-011"}
              </p>
              <p>
                <span className="font-bold">Faculty:</span>{" "}
                {voucher.student?.department?.name || "Information Technology"}
              </p>
              <p>
                <span className="font-bold">Program:</span> BSCSM
              </p>
            </div>

            {/* Fee Table */}
            <table className="w-full text-[9px] border-collapse border border-black mb-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-1 text-left">
                    PARTICULARS
                  </th>
                  <th className="border border-black p-1 text-right">FEES</th>
                </tr>
              </thead>
              <tbody>
                {voucher.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-1">
                      {item.particular.name}
                    </td>
                    <td className="border border-black p-1 text-right">
                      {item.amount}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td className="border border-black p-1">Total</td>
                  <td className="border border-black p-1 text-right">
                    {voucher.totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Amount in words */}
            <div className="text-[9px] mb-2 italic">
              <span className="font-bold not-italic">Rupees (in words):</span>{" "}
              {numberToWords(voucher.totalAmount)}
            </div>

            {/* Remarks */}
            <div className="text-[8px] space-y-0.5 mb-2">
              <p>REMARKS: _________________________________________________</p>
              <p>REMARKS: _________________________________________________</p>
              <p>REMARKS: _________________________________________________</p>
              <p>REMARKS: _________________________________________________</p>
            </div>

            {/* Instructions Section */}
            <div className="text-[8px] border-t border-black pt-1 bg-blue-50">
              <p className="font-bold underline text-center mb-1 uppercase">
                Payment Instructions
              </p>
              <p>
                <span className="font-bold">HBL Customers:</span> Select SMIU in
                the Education tab on HBL/Konnect App or Internet Banking, Enter
                challan number and pay via your account.
              </p>
              <p className="mt-1">
                <span className="font-bold">Other Bank/Wallet:</span> Select
                1-Bill option from any App/EasyPaisa/JazzCash or ATM and Enter
                1-Bill ID.
              </p>
              <p className="font-bold mt-1 text-red-600">
                Note: IBFT/Fund Transfer or Counter payment is NOT accepted.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeeVoucher;

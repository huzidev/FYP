import jsPDF from "jspdf";
import "jspdf-autotable";
import nodemailer from "nodemailer";

export const downloadInvoicePDF = (student, fees) => {
  const doc = new jsPDF();
  doc.text("Fee Invoice", 14, 15);
  doc.text(`Student: ${student.fullName}`, 14, 25);
  doc.text(`Student ID: ${student.studentId}`, 14, 32);

  doc.autoTable({
    startY: 40,
    head: [["Semester", "Amount", "Due Date", "Status"]],
    body: fees.map((f) => [
      f.semester,
      f.amount.toLocaleString(),
      new Date(f.dueDate).toLocaleDateString(),
      f.status,
    ]),
  });

  doc.save(`invoice-${student.studentId}.pdf`);
};

// Auto-email invoice
export const sendInvoiceEmail = async (student, fees) => {
  const pdfDoc = new jsPDF();
  pdfDoc.text("Fee Invoice", 14, 15);
  pdfDoc.text(`Student: ${student.fullName}`, 14, 25);

  pdfDoc.autoTable({
    startY: 40,
    head: [["Semester", "Amount", "Due Date", "Status"]],
    body: fees.map((f) => [
      f.semester,
      f.amount.toLocaleString(),
      new Date(f.dueDate).toLocaleDateString(),
      f.status,
    ]),
  });

  const pdfData = pdfDoc.output("arraybuffer");

  // Nodemailer (example)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: student.email,
    subject: "Fee Invoice",
    text: "Please find your fee invoice attached.",
    attachments: [
      {
        filename: `invoice-${student.studentId}.pdf`,
        content: Buffer.from(pdfData),
        contentType: "application/pdf",
      },
    ],
  });
};

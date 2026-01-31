import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { studentId, feeId } = await req.json();

    // Get student and fee
    const fee = await prisma.fee.findUnique({
      where: { id: parseInt(feeId) },
      include: { student: true },
    });

    if (!fee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    // Configure transporter (example Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP config
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"School Admin" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: `Your Invoice`,
      text: `Dear student, your fee invoice is attached.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

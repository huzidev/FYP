import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/email";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: "insensitive",
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.student.update({
      where: { id: student.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    await sendOtpEmail(student.email, otp);

    return NextResponse.json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

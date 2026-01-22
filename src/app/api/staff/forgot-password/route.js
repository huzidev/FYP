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

    const staff = await prisma.staff.findFirst({
      where: {
        email: {
          equals: email.trim(),
          mode: "insensitive",
        },
      },
    });

    if (!staff) {
      return NextResponse.json(
        { error: "No staff found with this email" },
        { status: 404 },
      );
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    await sendOtpEmail(staff.email, otp);

    return NextResponse.json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("staff forgot password error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

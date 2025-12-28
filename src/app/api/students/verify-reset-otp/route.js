import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (
      !student ||
      student.resetOtp !== otp ||
      !student.resetOtpExpiry ||
      new Date() > student.resetOtpExpiry
    ) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "OTP verified",
      studentId: student.id,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (
      !admin ||
      admin.resetOtp !== otp ||
      !admin.resetOtpExpiry ||
      new Date() > admin.resetOtpExpiry
    ) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "OTP verified",
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Admin verify OTP error:", error);
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}

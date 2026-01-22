import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const staff = await prisma.staff.findUnique({
      where: { email },
    });

    if (
      !staff ||
      staff.resetOtp !== otp ||
      !staff.resetOtpExpiry ||
      new Date() > staff.resetOtpExpiry
    ) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      message: "OTP verified",
      staffId: staff.id,
    });
  } catch (error) {
    console.error("staff verify OTP error:", error);
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 },
    );
  }
}

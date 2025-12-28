import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { studentId, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.student.update({
      where: { id: studentId },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Password reset failed" },
      { status: 500 }
    );
  }
}

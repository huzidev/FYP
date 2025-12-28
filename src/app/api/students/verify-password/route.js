import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, oldPassword } = await request.json();

    if (!email || !oldPassword) {
      return NextResponse.json(
        { error: "Email and old password are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        isActive: true,
      },
    });

    if (!student || !student.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(oldPassword, student.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Old password is incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Verified",
      studentId: student.id,
    });
  } catch (error) {
    console.error("Verify password error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

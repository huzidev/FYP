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

    // Fetch admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive account" },
        { status: 401 }
      );
    }

    // Compare old password
    const isValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Old password is incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Verified",
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Admin verify password error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

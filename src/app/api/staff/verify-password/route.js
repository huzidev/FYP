import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, oldPassword } = await request.json();

    if (!email || !oldPassword) {
      return NextResponse.json(
        { error: "Email and old password required" },
        { status: 400 },
      );
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
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(oldPassword, staff.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Old password incorrect" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      message: "Verified",
      staffId: staff.id,
    });
  } catch (error) {
    console.error("Verify old password error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

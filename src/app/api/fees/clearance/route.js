import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "StudentId required" },
        { status: 400 },
      );
    }

    // Check if any voucher is unpaid
    const unpaidVoucher = await prisma.feeVoucher.findFirst({
      where: {
        studentId: parseInt(studentId),
        status: {
          not: "PAID", // Only allow if PAID
        },
      },
    });

    return NextResponse.json({
      allowed: !unpaidVoucher,
    });
  } catch (error) {
    console.error("Clearance check error:", error);
    return NextResponse.json(
      { error: "Failed to check clearance" },
      { status: 500 },
    );
  }
}

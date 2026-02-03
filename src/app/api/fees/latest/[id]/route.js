import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const studentId = Number(id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { message: "Invalid Student ID" },
        { status: 400 },
      );
    }

    const voucher = await prisma.feeVoucher.findFirst({
      where: {
        studentId,
        isInstallment: true,
      },
      orderBy: {
        id: "desc", // ✅ FIX (createdAt REMOVED)
      },
      include: {
        items: { include: { particular: true } },
        student: { include: { department: true } },
      },
    });

    if (!voucher) {
      return NextResponse.json(
        { message: "No installment voucher found" },
        { status: 404 },
      );
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

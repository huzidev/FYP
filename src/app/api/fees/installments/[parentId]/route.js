import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/fees/installments/:parentId
export async function GET(req, context) {
  try {
    const { parentId } = context.params;
    const parentVoucherId = Number(parentId);

    if (isNaN(parentVoucherId)) {
      return NextResponse.json(
        { message: "Invalid voucher ID" },
        { status: 400 },
      );
    }

    const installments = await prisma.feeVoucher.findMany({
      where: { parentVoucherId },
      include: { items: { include: { particular: true } }, student: true },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(installments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { originalVoucherId, installmentNo } = await req.json();

  const parent = await prisma.feeVoucher.findUnique({
    where: { id: originalVoucherId },
    include: { items: true },
  });

  const previousInstallments = await prisma.feeVoucher.findMany({
    where: { parentVoucherId: originalVoucherId },
  });

  const alreadyPaid = previousInstallments.reduce(
    (sum, v) => sum + v.totalAmount,
    0,
  );

  let items;

  if (installmentNo === 1) {
    items = parent.items.map((i) => ({
      particularId: i.particularId,
      amount: Math.ceil(i.amount / 2),
    }));
  } else {
    items = parent.items.map((i) => ({
      particularId: i.particularId,
      amount: i.amount - Math.ceil(i.amount / 2),
    }));
  }

  const totalAmount = items.reduce((s, i) => s + i.amount, 0);

  const voucher = await prisma.feeVoucher.create({
    data: {
      studentId: parent.studentId,
      semester: parent.semester,
      academicYear: parent.academicYear,
      totalAmount,
      challanNo: `CH-${Date.now()}`,
      bill1Id: `BILL-${Date.now()}`,
      validTill: new Date(Date.now() + 7 * 86400000),
      isInstallment: true,
      parentVoucherId: parent.id,
      items: { create: items },
    },
    include: {
      items: { include: { particular: true } },
      student: true,
    },
  });

  return NextResponse.json(voucher);
}

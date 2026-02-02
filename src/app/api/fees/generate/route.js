import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { studentId, semester, academicYear } = await req.json();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { semester, academicYear },
          include: { subject: true }, // subject includes ratePerCrHr
        },
        department: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 },
      );
    }

    /* ---- Tuition Fee Calculation ---- */
    let tuitionTotal = 0;
    for (const enroll of student.enrollments) {
      tuitionTotal += enroll.subject.ratePerCrHr * enroll.subject.creditHours;
    }

    /* ---- Department Fixed Fees ---- */
    const deptFees = await prisma.departmentFee.findMany({
      where: { departmentId: student.departmentId },
      include: { particular: true },
    });

    let fixedTotal = deptFees.reduce((sum, f) => sum + f.amount, 0);

    /* ---- Arrears ---- */
    const unpaid = await prisma.feeVoucher.aggregate({
      where: { studentId, status: { not: "PAID" } },
      _sum: { totalAmount: true },
    });
    const arrears = unpaid._sum.totalAmount || 0;

    /* ---- Voucher Totals ---- */
    const totalAmount = tuitionTotal + fixedTotal + arrears + 60; // Bank charges
    const challanNo = `SMIU-${Date.now()}`;
    const bill1Id = `1BILL-${Math.floor(Math.random() * 1000000000000)}`;

    /* ---- Ensure Particulars exist for arrears and bank charges ---- */
    const specialParticulars = await prisma.particular.findMany({
      where: { id: { in: [999, 1000] } },
    });
    const validSpecialIds = specialParticulars.map((p) => p.id);

    /* ---- Prepare Voucher Items ---- */
    const itemsData = [
      { particularId: 1, amount: tuitionTotal }, // Tuition
      ...deptFees.map((df) => ({
        particularId: df.particularId,
        amount: df.amount,
      })),
    ];

    // Only add arrears if Particular exists
    if (validSpecialIds.includes(999)) {
      itemsData.push({ particularId: 999, amount: arrears });
    }

    // Only add bank charges if Particular exists
    if (validSpecialIds.includes(1000)) {
      itemsData.push({ particularId: 1000, amount: 60 });
    }

    /* ---- Create Voucher ---- */
    const voucher = await prisma.feeVoucher.create({
      data: {
        challanNo,
        bill1Id,
        studentId,
        semester,
        academicYear,
        validTill: new Date(Date.now() + 15 * 86400000),
        totalAmount,
        arrears,
        items: { create: itemsData },
      },
    });

    /* ---- Create Fee Record ---- */
    await prisma.fee.create({
      data: {
        amount: totalAmount,
        dueAmount: totalAmount,
        status: "PENDING",
        semester,
        academicYear,
        studentId,
        description: "Semester Fee Voucher",
        dueDate: new Date(Date.now() + 15 * 86400000),
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Voucher generation failed", error },
      { status: 500 },
    );
  }
}

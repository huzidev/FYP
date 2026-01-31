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
          include: { subject: true },
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
      const fee = await prisma.subjectFee.findUnique({
        where: { subjectId: enroll.subjectId },
      });

      tuitionTotal += fee.ratePerCrHr * enroll.subject.creditHours;
    }

    /* ---- Department Fixed Fees ---- */
    const deptFees = await prisma.departmentFee.findMany({
      where: { departmentId: student.departmentId },
      include: { particular: true },
    });

    let fixedTotal = deptFees.reduce((sum, f) => sum + f.amount, 0);

    /* ---- Arrears ---- */
    const unpaid = await prisma.feeVoucher.aggregate({
      where: {
        studentId,
        status: { not: "PAID" },
      },
      _sum: { totalAmount: true },
    });

    const arrears = unpaid._sum.totalAmount || 0;

    /* ---- Voucher Totals ---- */
    const totalAmount = tuitionTotal + fixedTotal + arrears + 60; // Bank charges

    const challanNo = `SMIU-${Date.now()}`;
    const bill1Id = `1BILL-${Math.floor(Math.random() * 1000000000000)}`;

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
        items: {
          create: [
            { particularId: 1, amount: tuitionTotal },
            ...deptFees.map((df) => ({
              particularId: df.particularId,
              amount: df.amount,
            })),
            { particularId: 999, amount: arrears },
            { particularId: 1000, amount: 60 },
          ],
        },
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Voucher generation failed" },
      { status: 500 },
    );
  }
}

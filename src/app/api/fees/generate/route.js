import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export async function POST(req) {
  try {
    const { studentId, semester, academicYear } = await req.json();

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 },
      );
    }

    // 1️⃣ Validate student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { enrollments: true, department: true },
    });

    if (!student)
      return NextResponse.json(
        { message: "Invalid Student ID" },
        { status: 400 },
      );

    // 2️⃣ Dates
    const issueDate = new Date();
    const validTill = addDays(issueDate, 2);
    const dueDate = new Date(issueDate.getFullYear(), issueDate.getMonth(), 10);

    // 3️⃣ Admission Fee Logic
    const isNewStudent =
      student.enrollments.length === 0 && semester.includes("1");

    // 4️⃣ Active Enrollments
    const activeEnrollments = await prisma.enrollment.count({
      where: { studentId, status: "ACTIVE" },
    });

    // 5️⃣ Late Fee
    let lateFee = 0;
    if (issueDate > dueDate) {
      const diffDays = Math.ceil((issueDate - dueDate) / (1000 * 60 * 60 * 24));
      lateFee = diffDays * 100;
    }

    // 6️⃣ Particulars
    const particulars = await prisma.particular.findMany();
    const getParticular = (name) => particulars.find((p) => p.name === name);
    const items = [];

    const pushItem = (name, amount) => {
      if (amount <= 0) return;
      const particular = getParticular(name);
      if (!particular) {
        console.warn(`Missing Particular: ${name}`);
        return;
      }
      items.push({ particularId: particular.id, amount });
    };

    pushItem("Admission Fee", isNewStudent ? 10000 : 0);
    pushItem("Tuition Fee", activeEnrollments * 7000);
    pushItem("Student Activity", 2000);
    pushItem("Lab / Library", 3000);
    pushItem("Enrollment Fee", 1000);
    pushItem("Exam Fee", 2500);
    pushItem("Bank Charges", 60);
    pushItem("Late Fee", lateFee);

    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);

    // 7️⃣ Generate unique bill1Id
    const bill1Id = `BILL-${student.id}-${Date.now()}`;

    // 8️⃣ Create voucher
    const voucher = await prisma.feeVoucher.create({
      data: {
        challanNo: `CH-${Date.now()}`,
        bill1Id,
        studentId: student.id,
        totalAmount,
        arrears: 0,
        semester,
        academicYear,
        validTill,
        items: { create: items },
      },
      include: {
        items: { include: { particular: true } },
        student: { include: { department: true } },
      },
    });

    return NextResponse.json(voucher);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

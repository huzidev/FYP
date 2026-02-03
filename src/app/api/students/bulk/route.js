import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import bcrypt from 'bcrypt';

// Valid StudentLevel enum values
const VALID_LEVELS = ['BACHELOR', 'MASTER'];

// Map common level names to enum values
function normalizeLevel(level) {
  if (!level) return null;
  const normalized = level.toString().toUpperCase().trim();

  // Direct match
  if (VALID_LEVELS.includes(normalized)) {
    return normalized;
  }

  // Map common alternatives
  const levelMap = {
    'GRADUATE': 'MASTER',
    'POSTGRADUATE': 'MASTER',
    'POST-GRADUATE': 'MASTER',
    'MASTERS': 'MASTER',
    'MS': 'MASTER',
    'MSC': 'MASTER',
    'UNDERGRADUATE': 'BACHELOR',
    'BACHELORS': 'BACHELOR',
    'BS': 'BACHELOR',
    'BSC': 'BACHELOR',
  };

  return levelMap[normalized] || null;
}

// POST /api/students/bulk - Bulk upload (create) students via CSV
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format', details: parseResult.errors },
        { status: 400 }
      );
    }

    const studentsData = parseResult.data;
    const results = {
      success: [],
      errors: [],
    };

    // Process each student
    for (let i = 0; i < studentsData.length; i++) {
      try {
        const studentData = studentsData[i];
        
        // Normalize level
        const normalizedLevel = normalizeLevel(studentData.level);

        // Validation
        if (!studentData.fullName || !studentData.email || !studentData.studentId ||
            !studentData.level || !studentData.departmentId) {
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields',
            data: studentData,
          });
          continue;
        }

        if (!normalizedLevel) {
          results.errors.push({
            row: i + 1,
            error: `Invalid level "${studentData.level}". Expected: BACHELOR, MASTER, or common alternatives like Graduate, Undergraduate`,
            data: studentData,
          });
          continue;
        }

        // Check if student already exists
        const orConditions = [
          { email: studentData.email },
          { studentId: studentData.studentId },
        ];
        if (studentData.cnic) {
          orConditions.push({ cnic: studentData.cnic });
        }
        const existingStudent = await prisma.student.findFirst({
          where: { OR: orConditions },
        });

        if (existingStudent) {
          results.errors.push({
            row: i + 1,
            error: 'Student already exists',
            data: studentData,
          });
          continue;
        }

        // Create student (with default password)
        const defaultPassword = studentData.password || studentData.studentId;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const student = await prisma.student.create({
          data: {
            fullName: studentData.fullName,
            email: studentData.email,
            password: hashedPassword,
            studentId: studentData.studentId,
            level: normalizedLevel,
            departmentId: parseInt(studentData.departmentId),
            phone: studentData.phone || null,
            address: studentData.address || null,
            dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
            fatherName: studentData.fatherName || null,
            cnic: studentData.cnic || null,
            admissionDate: studentData.admissionDate ? new Date(studentData.admissionDate) : null,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            level: true,
          },
        });

        results.success.push({
          row: i + 1,
          data: student,
        });
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: studentsData[i],
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk upload completed',
      results: {
        total: studentsData.length,
        successful: results.success.length,
        failed: results.errors.length,
        details: results,
      },
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { error: 'Bulk upload failed' },
      { status: 500 }
    );
  }
}

// PUT /api/students/bulk - Bulk update existing students via CSV
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const parseResult = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format', details: parseResult.errors },
        { status: 400 }
      );
    }

    const studentsData = parseResult.data;
    const results = {
      success: [],
      errors: [],
    };

    for (let i = 0; i < studentsData.length; i++) {
      try {
        const studentData = studentsData[i];

        // For update, we need either id, email, or studentId to identify the student
        if (!studentData.id && !studentData.email && !studentData.studentId) {
          results.errors.push({
            row: i + 1,
            error: 'Missing identifier (id, email, or studentId required)',
            data: studentData,
          });
          continue;
        }

        // Find existing student
        const findConditions = [];
        if (studentData.id) findConditions.push({ id: parseInt(studentData.id) });
        if (studentData.email) findConditions.push({ email: studentData.email });
        if (studentData.studentId) findConditions.push({ studentId: studentData.studentId });

        const existingStudent = await prisma.student.findFirst({
          where: { OR: findConditions },
        });

        if (!existingStudent) {
          results.errors.push({
            row: i + 1,
            error: 'Student not found',
            data: studentData,
          });
          continue;
        }

        // Build update data (only include fields that are provided)
        const updateData = {};
        if (studentData.fullName) updateData.fullName = studentData.fullName;
        if (studentData.level) {
          const normalizedLevel = normalizeLevel(studentData.level);
          if (!normalizedLevel) {
            results.errors.push({
              row: i + 1,
              error: `Invalid level "${studentData.level}". Expected: BACHELOR, MASTER, or common alternatives`,
              data: studentData,
            });
            continue;
          }
          updateData.level = normalizedLevel;
        }
        if (studentData.email && studentData.email !== existingStudent.email) {
          // Check if new email already exists
          const emailExists = await prisma.student.findFirst({
            where: { email: studentData.email, id: { not: existingStudent.id } },
          });
          if (emailExists) {
            results.errors.push({
              row: i + 1,
              error: 'Email already in use by another student',
              data: studentData,
            });
            continue;
          }
          updateData.email = studentData.email;
        }
        if (studentData.departmentId) updateData.departmentId = parseInt(studentData.departmentId);
        if (studentData.phone !== undefined) updateData.phone = studentData.phone || null;
        if (studentData.address !== undefined) updateData.address = studentData.address || null;
        if (studentData.dateOfBirth) updateData.dateOfBirth = new Date(studentData.dateOfBirth);
        if (studentData.fatherName !== undefined) updateData.fatherName = studentData.fatherName || null;
        if (studentData.cnic !== undefined) updateData.cnic = studentData.cnic || null;
        if (studentData.admissionDate) updateData.admissionDate = new Date(studentData.admissionDate);
        if (studentData.password) {
          updateData.password = await bcrypt.hash(studentData.password, 10);
        }

        if (Object.keys(updateData).length === 0) {
          results.errors.push({
            row: i + 1,
            error: 'No fields to update',
            data: studentData,
          });
          continue;
        }

        const student = await prisma.student.update({
          where: { id: existingStudent.id },
          data: updateData,
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            level: true,
          },
        });

        results.success.push({
          row: i + 1,
          data: student,
        });
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: studentsData[i],
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk update completed',
      results: {
        total: studentsData.length,
        successful: results.success.length,
        failed: results.errors.length,
        details: results,
      },
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json(
      {
        error: 'Bulk update failed',
      },
      { status: 500 }
    );
  }
}
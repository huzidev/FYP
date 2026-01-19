const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Check if we should seed only admin
const SEED_ADMIN_ONLY = process.env.SEED_ADMIN_ONLY === 'true';

async function main() {
  console.log('🌱 Starting database seed...');
  
  if (SEED_ADMIN_ONLY) {
    console.log('⚙️  Running in ADMIN ONLY mode...');
  }

  // Create Departments
  console.log('📚 Creating departments...');
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'CS' },
      update: {},
      create: {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Information Technology',
      },
    }),
    prisma.department.upsert({
      where: { code: 'EE' },
      update: {},
      create: {
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Department of Electrical and Electronic Engineering',
      },
    }),
    prisma.department.upsert({
      where: { code: 'ME' },
      update: {},
      create: {
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Department of Mechanical Engineering',
      },
    }),
  ]);
  console.log(`✅ Created ${departments.length} departments`);

  // Create Admin
  console.log('👤 Creating admin user...');
  const hashedAdminPassword = await bcrypt.hash('huzaifaiqbal.2015@gmail.com', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'huzaifaiqbal.2015@gmail.com' },
    update: {},
    create: {
      fullName: 'Huzaifa Iqbal',
      email: 'huzaifaiqbal.2015@gmail.com',
      password: hashedAdminPassword,
      role: 'SUPER_ADMIN',
      phone: '+1234567890',
      address: 'SMI Campus',
    },
  });
  console.log('✅ Created admin user: admin@smi.com / admin@smi.com');

  // If only seeding admin, stop here
  if (SEED_ADMIN_ONLY) {
    console.log('🎉 Admin seeding completed!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('👤 Admin: admin@smi.com / admin@smi.com');
    return;
  }

  // Create Staff Members
  console.log('👨‍🏫 Creating staff members...');
  const hashedStaffPassword = await bcrypt.hash('staff@smi.com', 10);
  const staffMembers = await Promise.all([
    prisma.staff.upsert({
      where: { email: 'staff@smi.com' },
      update: {},
      create: {
        fullName: 'Dr. John Smith',
        email: 'staff@smi.com',
        password: hashedStaffPassword,
        role: 'TEACHER',
        staffId: 'T001',
        phone: '+1234567891',
        salary: 75000,
        hireDate: new Date('2020-01-15'),
      },
    }),
    prisma.staff.upsert({
      where: { email: 'admission@smi.com' },
      update: {},
      create: {
        fullName: 'Sarah Johnson',
        email: 'admission@smi.com',
        password: hashedStaffPassword,
        role: 'ADMISSION',
        staffId: 'A001',
        phone: '+1234567892',
        salary: 45000,
        hireDate: new Date('2019-08-20'),
      },
    }),
  ]);
  console.log(`✅ Created ${staffMembers.length} staff members`);

  // Create Subjects
  console.log('📖 Creating subjects...');
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'CS101' },
      update: {},
      create: {
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Basic programming concepts and problem solving',
        creditHours: 3,
        semester: 1,
        level: 'BACHELOR',
        departmentId: departments[0].id,
      },
    }),
    prisma.subject.upsert({
      where: { code: 'CS201' },
      update: {},
      create: {
        name: 'Data Structures',
        code: 'CS201',
        description: 'Fundamental data structures and algorithms',
        creditHours: 3,
        semester: 3,
        level: 'BACHELOR',
        departmentId: departments[0].id,
      },
    }),
    prisma.subject.upsert({
      where: { code: 'EE101' },
      update: {},
      create: {
        name: 'Circuit Analysis',
        code: 'EE101',
        description: 'Basic electrical circuit analysis',
        creditHours: 4,
        semester: 1,
        level: 'BACHELOR',
        departmentId: departments[1].id,
      },
    }),
  ]);
  console.log(`✅ Created ${subjects.length} subjects`);

  // Assign subjects to teachers
  console.log('🔗 Assigning subjects to teachers...');
  await prisma.staff.update({
    where: { id: staffMembers[0].id },
    data: {
      subjects: {
        connect: [{ id: subjects[0].id }, { id: subjects[1].id }],
      },
    },
  });

  // Create Sample Students
  console.log('🎓 Creating sample students...');
  const hashedStudentPassword = await bcrypt.hash('student@smi.com', 10);
  const students = await Promise.all([
    prisma.student.upsert({
      where: { email: 'student@smi.com' },
      update: {},
      create: {
        fullName: 'Alice Williams',
        email: 'student@smi.com',
        password: hashedStudentPassword,
        studentId: 'STD001',
        level: 'BACHELOR',
        gender: 'FEMALE',
        phone: '+1234567893',
        address: '123 Student Street, SMI City, Country',
        dateOfBirth: new Date('2002-05-15'),
        fatherName: 'Robert Williams',
        cnic: '12345-6789012-3',
        admissionDate: new Date('2023-09-01'),
        departmentId: departments[0].id,
      },
    }),
    prisma.student.upsert({
      where: { email: 'student2@smi.com' },
      update: {},
      create: {
        fullName: 'Bob Davis',
        email: 'student2@smi.com',
        password: hashedStudentPassword,
        studentId: 'STD002',
        level: 'BACHELOR',
        gender: 'MALE',
        phone: '+1234567894',
        address: '456 Campus Avenue, SMI City, Country',
        dateOfBirth: new Date('2001-12-20'),
        fatherName: 'Michael Davis',
        cnic: '12345-6789012-4',
        admissionDate: new Date('2023-09-01'),
        departmentId: departments[1].id,
      },
    }),
  ]);
  console.log(`✅ Created ${students.length} sample students`);
  console.log('   Login: student@smi.com / student@smi.com');
  console.log('   Login: student2@smi.com / student2@smi.com');

  // Create Academic Year and Semester
  console.log('📅 Creating academic periods...');
  const academicYear = await prisma.academicYear.upsert({
    where: { year: '2024-2025' },
    update: {},
    create: {
      year: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  });

  const semester = await prisma.semester.upsert({
    where: { name: 'Fall 2024' },
    update: {},
    create: {
      name: 'Fall 2024',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  });

  // Create Enrollments
  console.log('📝 Creating enrollments...');
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        studentId: students[0].id,
        subjectId: subjects[0].id,
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        status: 'ACTIVE',
      },
    }),
    prisma.enrollment.create({
      data: {
        studentId: students[1].id,
        subjectId: subjects[2].id,
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ Created ${enrollments.length} enrollments`);

  // Create Sample Fees
  console.log('💰 Creating fee records...');
  const fees = await Promise.all([
    prisma.fee.create({
      data: {
        studentId: students[0].id,
        amount: 5000,
        status: 'PENDING',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        dueDate: new Date('2024-10-15'),
        description: 'Tuition Fee - Fall 2024',
      },
    }),
    prisma.fee.create({
      data: {
        studentId: students[1].id,
        amount: 5000,
        paidAmount: 2500,
        dueAmount: 2500,
        status: 'PARTIAL',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        dueDate: new Date('2024-10-15'),
        description: 'Tuition Fee - Fall 2024',
        paidDate: new Date('2024-09-15'),
        receiptNumber: 'REC-001',
      },
    }),
  ]);
  console.log(`✅ Created ${fees.length} fee records`);

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Test Login Credentials:');
  console.log('👤 Admin: admin@smi.com / admin@smi.com');
  console.log('👨‍🏫 Staff: staff@smi.com / staff@smi.com');
  console.log('👩‍💼 Admission: admission@smi.com / staff@smi.com');
  console.log('🎓 Student 1: student@smi.com / student@smi.com');
  console.log('🎓 Student 2: student2@smi.com / student2@smi.com');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
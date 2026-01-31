import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, queryId, repliedById, repliedByType } = body;

    // Validate required fields
    if (!content || !queryId || !repliedById || !repliedByType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate repliedByType
    const validTypes = ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'ADMISSION'];
    if (!validTypes.includes(repliedByType)) {
      return NextResponse.json(
        { error: 'Invalid user type. Only admins and staff can reply.' },
        { status: 403 }
      );
    }

    // Check if query exists
    const query = await prisma.announcementQuery.findUnique({
      where: {
        id: parseInt(queryId)
      }
    });

    if (!query) {
      return NextResponse.json(
        { error: 'Query not found' },
        { status: 404 }
      );
    }

    // Create reply
    const reply = await prisma.announcementQueryReply.create({
      data: {
        content,
        queryId: parseInt(queryId),
        repliedById: parseInt(repliedById),
        repliedByType
      }
    });

    // Fetch the replier details
    let repliedBy = null;
    if (repliedByType === 'ADMIN' || repliedByType === 'SUPER_ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { id: reply.repliedById },
        select: { id: true, fullName: true, role: true }
      });
      repliedBy = { ...admin, type: repliedByType };
    } else if (repliedByType === 'TEACHER' || repliedByType === 'ADMISSION') {
      const staff = await prisma.staff.findUnique({
        where: { id: reply.repliedById },
        select: { id: true, fullName: true, role: true, staffId: true }
      });
      repliedBy = { ...staff, type: repliedByType };
    }

    return NextResponse.json({ ...reply, repliedBy }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

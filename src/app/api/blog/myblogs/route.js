import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 });
    }

    // 2. Verify token and extract payload
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    console.log("payloadddd",payload)
    const userId = payload.id;

    // 3. Pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 6;
    const skip = (page - 1) * limit;

    // 4. Query blogs by user ID
    const [blogs, total, user] = await Promise.all([
      prisma.blog.findMany({
        where: { authorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blog.count({
        where: { authorId: userId },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, username: true }, // Return minimal info
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        user,
        blogs,
        pagination: { total, totalPages, currentPage: page },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch user blogs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user blogs', details: error.message },
      { status: 500 }
    );
  }
}

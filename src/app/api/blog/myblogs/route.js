import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/utils/redis.js';

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

    const userId = payload.id;

    // 3. Pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 6;
    const skip = (page - 1) * limit;

    // 4. Create a unique cache key based on userId + pagination params
    const cacheKey = `userBlogs:${userId}:page=${page}:limit=${limit}`;

    // 5. Try to get cached response
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    // 6. If no cache, fetch from DB
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
        select: { id: true, email: true, username: true }, // minimal info
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response = {
      user,
      blogs,
      pagination: { total, totalPages, currentPage: page },
    };

    // 7. Cache the response, expire after 60 seconds (adjust as needed)
    try {
      await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
    } catch (err) {
      console.log("Redis SET failed", err.message);
    }

    // 8. Return response
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user blogs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user blogs', details: error.message },
      { status: 500 }
    );
  }
}

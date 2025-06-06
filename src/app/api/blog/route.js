import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/utils/redis.js';
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 6;
    const skip = (page - 1) * limit;

    // Create a unique cache key based on pagination params
    const cacheKey = `blogs:page=${page}:limit=${limit}`;

    // Try to get cached response
    const cached = await redis.get(cacheKey);
    console.log("cached data",!!cached)
    if (cached) {
      return NextResponse.json(JSON.parse(cached), { status: 200 });
    }

    // If no cache, fetch from DB
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blog.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response = {
      blogs,
      pagination: { total, totalPages, currentPage: page },
    };

    // Cache the response, expire after 60 seconds (adjust as needed)
    try {
      await redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
      // await redis.set(cacheKey, JSON.stringify(response), {ex:60*60});
    } catch (err) {
      console.log("Redis SET failed", err.message);
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("get blogs error", error?.message);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

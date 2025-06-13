import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase/supabaseClient';
import { blogSchema } from '@/lib/validations/blogSchema';
import { getCookie } from 'cookies-next';

const JWT_SECRET = process.env.JWT_SECRET;

// Simple visitor tracking middleware
async function trackVisitor(req) {
  try {
    const visitorId = getCookie('visitorId', { req });
    if (visitorId) {
      console.log('Visitor ID:', visitorId);
      // Here you could store the visitor ID in your database if needed
    }
    return visitorId;
  } catch (err) {
    console.error('Visitor tracking error:', err);
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    // Track visitor
    await trackVisitor(req);

    const { id } = params;  
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('Get single blog error:', error);
    return NextResponse.json(
      { message: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, context) {
  try {
    // Track visitor
    await trackVisitor(req);

    const { params } = context;
    const blogId = params.id;

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: 'Unauthorized: No token' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET);

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    if (blog.authorId !== payload.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get('title') || blog.title;
    const content = formData.get('content') || blog.content;
    const file = formData.get('image');

    await blogSchema.validate({ title, content }, { abortEarly: false });

    let imageUrl = blog.image;

    if (file && typeof file !== 'string') {
      if (blog.image) {
        const oldFileName = blog.image.split('/').pop();
        await supabase.storage.from('blog-images').remove([oldFileName]);
      }

      const buffer = await file.arrayBuffer();
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('blog-images').upload(fileName, new Uint8Array(buffer), {
        contentType: file.type,
      });

      if (error) return NextResponse.json({ message: 'Image upload failed' }, { status: 500 });

      const { data } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      imageUrl = data?.publicUrl || blog.image;
    }

    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: { title, content, image: imageUrl },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Unexpected error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    // Track visitor
    await trackVisitor(req);

    const { params } = context;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ message: 'Blog ID not provided' }, { status: 400 });
    }

    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    if (String(blog.authorId) !== String(payload.id)) {
      return NextResponse.json({ message: 'Unauthorized: Not your blog' }, { status: 403 });
    }

    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('Delete blog error:', err);
    return NextResponse.json({ message: 'Server error', details: err.message }, { status: 500 });
  }
}
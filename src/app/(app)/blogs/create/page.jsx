'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { clearAllBlogs } from '@/redux/slices/blogSlice';
import { validateBlogData } from '@/app/(app)/blogs/validations/blogSchema';
import 'react-toastify/dist/ReactToastify.css';

function getCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

const CreateBlog = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getCookieValue('token');
    if (!token) {
      toast.error('Please login to create a blog.');
      router.push('/login');
    }
  }, [router]);

  const validate = async () => {
    const { isValid, errors } = await validateBlogData({ title, content });
    if (!isValid) {
      setErrors(errors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = await validate();
    if (!isValid) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const token = getCookieValue('token');
      if (!token) throw new Error('You must be logged in to create a blog.');

      const res = await fetch('/api/blog/create', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create blog');
      }

      dispatch(clearAllBlogs());
      toast.success('Blog created successfully!');
      setTimeout(() => router.push('/blogs/dashboard'), 1500);
    } catch (err) {
      toast.error(err.message);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold mb-4">Create Blog</h1>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here (minimum 25 words)..."
            className={errors.content ? 'border-red-500' : ''}
            rows={8}
          />
          {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
          {content && !errors.content && (
            <p className="text-sm text-gray-500 mt-1">
              Word count: {content.trim().split(/\s+/).filter(Boolean).length}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(e) => setImage(e.target.files[0])}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-gray-50 file:text-gray-700
              hover:file:bg-gray-100"
          />
        </div>

        {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting ? 'cursor-not-allowed opacity-70' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default CreateBlog;
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux'; // ✅ Import useDispatch
import { clearAllBlogs} from '@/redux/slices/blogSlice';
import 'react-toastify/dist/ReactToastify.css';

function getCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

const CreateBlog = () => {
  const router = useRouter();
  const dispatch = useDispatch(); // ✅ Redux dispatch
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

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
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

      // ✅ Clear blog cache for page 1 after successful creation
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
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
          />
          {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
        </div>

        {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`bg-black-600 text-black hover:bg-black-700 ${
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

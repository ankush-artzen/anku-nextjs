'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useDispatch } from 'react-redux';
import { clearAllBlogs } from '@/redux/slices/blogSlice';
import { clearPageBlog } from '@/redux/slices/blogSlice';

import { validateBlogData } from '@/lib/validations/blogSchema';
import 'react-toastify/dist/ReactToastify.css';

const getCookieValue = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const CreateBlog = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    imagePreview: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getCookieValue('token');
    if (!token) {
      toast.error('Please login to create a blog.');
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const validate = async () => {
    const { isValid, errors } = await validateBlogData(formData);
    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(await validate())) return;

    setIsSubmitting(true);

    try {
      const token = getCookieValue('token');
      if (!token) throw new Error('Authentication required');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch('/api/blog/create', {
        method: 'POST',
        body: formDataToSend,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Blog creation failed');
      }


      toast.success('Blog created successfully!');


      setTimeout(() => {
        dispatch(clearPublicBlogs());
        dispatch(clearAllBlogs());
        dispatch(clearPageBlog());
        router.push('/blogs/dashboard');
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred');
      setErrors(prev => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>

      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
          <p className="text-xs text-gray-500">{formData.title.length}/100 characters</p>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Content*</label>
          <Textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your blog content here..."
            className={`${errors.content ? 'border-red-500' : ''} min-h-[200px]`}
            rows={8}
          />
          {errors.content && <p className="text-red-600 text-sm">{errors.content}</p>}
          <div className="flex justify-between text-xs text-gray-500">
            <span>{wordCount} words</span>
            <span>{formData.content.length}/5000 characters</span>
          </div>
        </div>

        {/* Image */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Featured Image</label>
          {formData.imagePreview && (
            <div className="mb-2">
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          {errors.image && <p className="text-red-600 text-sm">{errors.image}</p>}
        </div>

        {errors.submit && <p className="text-red-600 text-sm">{errors.submit}</p>}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-24 bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" onClick={() => router.back()} variant="outline" className="w-24">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;

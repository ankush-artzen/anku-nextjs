'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { blogValidationSchema } from '@/lib/validations/updateSchema';
import 'react-toastify/dist/ReactToastify.css';

export default function EditBlog() {
  const { id } = useParams();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState({
    title: '',
    content: '',
    image: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) {
          toast.error('Please log in first');
          return router.push('/login');
        }

        const response = await fetch(`/api/blog/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blog');
        }

        const data = await response.json();
        setInitialValues({ title: data.title, content: data.content, image: null });
      } catch (err) {
        toast.error(err.message || 'Failed to load blog');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleSubmit = async (values) => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return toast.error('Please log in first');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', values.title);
      formDataToSend.append('content', values.content);
      if (values.image) {
        formDataToSend.append('image', values.image);
      }

      const response = await fetch(`/api/blog/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to update blog');
      }

      toast.success('Blog updated!');
      setTimeout(() => router.push(`/blogs/${id}`), 1500);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (loading) return <p className="p-6">Loading blog...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6">Edit Blog</h1>

      <Button
        type="button"
        onClick={() => router.back()}
        className="bg-gray-300 text-black hover:bg-gray-400 mb-4"
      >
        ← Back
      </Button>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={blogValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form className="space-y-6" noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title*</label>
              <Field
                as={Input}
                name="title"
                placeholder="Enter blog title"
                className="border-gray-300"
              />
              <ErrorMessage name="title" component="div" className="text-red-600 text-sm" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Content*</label>
              <Field
                as={Textarea}
                name="content"
                placeholder="Write your blog content here..."
                rows={8}
                className="border-gray-300"
              />
              <ErrorMessage name="content" component="div" className="text-red-600 text-sm" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Featured Image</label>
              <Input
                type="file"
                name="image"
                onChange={(e) => {
                  setFieldValue('image', e.target.files[0]);
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-50 file:text-gray-700
                  hover:file:bg-gray-100"
              />
              <ErrorMessage name="image" component="div" className="text-red-600 text-sm" />
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Update
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

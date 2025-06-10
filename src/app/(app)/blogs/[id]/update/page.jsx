'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast, ToastContainer } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { blogValidationSchema } from '@/app/(app)/blogs/validations/updateschema';
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
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold">Edit Blog</h1>

      <Button
        type="button"
        onClick={() => router.back()}
        className="bg-gray-300 text-black hover:bg-gray-400"
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
          <Form className="space-y-4">
            <div>
              <Field
                as={Input}
                name="title"
                placeholder="Title"
              />
              <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <Field
                as={Textarea}
                name="content"
                placeholder="Content"
                rows={10}
              />
              <ErrorMessage name="content" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <Input
                type="file"
                name="image"
                onChange={(e) => {
                  setFieldValue('image', e.target.files[0]);
                }}
              />
              <ErrorMessage name="image" component="div" className="text-red-500 text-sm" />
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

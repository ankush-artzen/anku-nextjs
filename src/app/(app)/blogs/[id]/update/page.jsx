'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditBlog() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
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
        setFormData({ title: data.title, content: data.content, image: null });
      } catch (err) {
        toast.error(err.message || 'Failed to load blog');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return toast.error('Please log in first');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
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
      <h1 className="text-2xl font-bold">Edit Blog</h1>

      <Button
        type="button"
        onClick={() => router.back()}
        className="bg-gray-300 text-black hover:bg-gray-400"
      >
        ← Back
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <Textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Content"
          required
          rows={10}
        />
        <Input type="file" name="image" onChange={handleChange} />

        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Update
        </Button>
      </form>
    </div>
  );
}

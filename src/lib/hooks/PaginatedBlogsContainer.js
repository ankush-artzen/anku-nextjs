'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setPageBlog } from '@/redux/slices/blogSlice';

export default function usePaginatedBlogsContainer(initialPage = 1, limit = 6) {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const cachedBlogs = useSelector((state) => state.blogs.blog);

  const blogs = cachedBlogs[page] || [];

  useEffect(() => {
    const fetchMyBlogs = async () => {
      if (cachedBlogs[page]) return; 

      setLoading(true);
      setError('');

      try {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('You must be logged in');
        }

        const res = await fetch(`/api/blog/myblogs?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch blogs');
        }

        dispatch(setPageBlog({ page, blogs: data.blogs || [] }));
        setUser(data.user || null);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        toast.error(err.message || 'Something went wrong');
        setError(err.message);
        setUser(null);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBlogs();
  }, [page, limit, dispatch, cachedBlogs]);

  return {
    blogs,
    user,
    page,
    totalPages,
    loading,
    error,
    setPage,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { setPublicPageBlog, clearPublicPageBlog } from '@/redux/slices/publicSlice';

export default function usePaginatedPublicBlogs(initialPage = 1, limit = 6, clearCacheOnPageChange = false) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const cachedBlogs = useSelector((state) => state.publicBlogs.publicBlog);
  const blogs = cachedBlogs[page] || [];

  useEffect(() => {
    const fetchPublicBlogs = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await fetch(`/api/blog?page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch blogs');
        }

        // Always update the total pages from the API response
        const newTotalPages = data?.pagination?.totalPages > 0 ? data.pagination.totalPages : 1;
        setTotalPages(newTotalPages);

        // Only use cache if not clearing on page change and data exists
        if (cachedBlogs[page] && !clearCacheOnPageChange) {
          setLoading(false);
          return;
        }

        if (clearCacheOnPageChange) {
          dispatch(clearPublicPageBlog(page));
        }

        dispatch(setPublicPageBlog({ page, blogs: data.blogs || [] }));
        
      } catch (err) {
        toast.error(err.message || 'Something went wrong');
        setError(err.message);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicBlogs();
  }, [page, limit, dispatch, cachedBlogs, clearCacheOnPageChange]);

  return {
    blogs,
    page,
    totalPages,
    loading,
    error,
    setPage,
  };
}

"use client";

import React, { useEffect } from "react";
import ReactPaginate from "react-paginate";
import Link from "next/link";
import usePaginatedBlogsContainer from "@/lib/hooks/PaginatedBlogsContainer";
import { useDispatch } from "react-redux";
import { clearAllBlogs } from "@/redux/slices/blogSlice";

export default function MyBlogsPage() {
  const { blogs, user, page, totalPages, loading, error, setPage } =
    usePaginatedBlogsContainer();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearAllBlogs());
  }, [dispatch]);
  const handlePageClick = ({ selected }) => {
    setPage(selected + 1);
  };

  if (loading) return <p className="text-center py-4">Loading your blogs...</p>;
  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Dashboard</h2>
      {user && (
        <p className="text-sm mb-4 text-gray-500">
          Welcome <strong>{user.username || user.email}</strong>
        </p>
      )}

      {!loading && blogs.length === 0 ? (
        <p className="text-gray-600">You haven't created any blogs yet.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.id}`}
                className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow block"
              >
                {blog.image && (
                  <img
                    src={blog.image}
                    alt="Blog"
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <h3 className="text-lg font-semibold mt-2">{blog.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                  {blog.content}
                </p>
              </Link>
            ))}
          </div>

          <ReactPaginate
            previousLabel="Prev"
            nextLabel="Next"
            breakLabel="..."
            pageCount={totalPages}
            onPageChange={handlePageClick}
            forcePage={page - 1}
            containerClassName="flex justify-center mt-8 gap-2 flex-wrap"
            pageClassName="border rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-blue-100"
            activeClassName="bg-blue-500 text-white"
            previousClassName="border rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-blue-100"
            nextClassName="border rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-blue-100"
            breakClassName="px-2 py-1 text-gray-500"
          />
        </>
      )}
    </div>
  );
}

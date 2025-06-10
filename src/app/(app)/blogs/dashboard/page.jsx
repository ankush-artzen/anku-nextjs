"use client";

import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import Link from "next/link";
import usePaginatedBlogsContainer from "@/lib/hooks/PaginatedBlogsContainer";
import { useDispatch } from "react-redux";
import { clearAllBlogs } from "@/redux/slices/blogSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MyBlogsPage() {
  const { blogs, user, page, totalPages, loading: loadingFromHook, error, setPage } =
    usePaginatedBlogsContainer();
  const dispatch = useDispatch();

  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    dispatch(clearAllBlogs());
  }, [dispatch]);

  useEffect(() => {
    if (loadingFromHook) {
      setShowLoader(true);
    } else {
      // Data loaded, wait at least 3 seconds before hiding loader
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loadingFromHook]);

  const handlePageClick = ({ selected }) => {
    setPage(selected + 1);
  };

  // Show loader if either hook is loading or we haven't reached 3 seconds yet
  if (loadingFromHook || showLoader) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) return <p className="text-center text-red-500 py-4">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Manage your blogs with ease.</p>
        </div>
        <Link href="/blogs/create">
          <Button>Create New Blog</Button>
        </Link>
      </div>

      {/* User Info Section */}
      {user && (
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <CardTitle className="text-lg font-semibold">{user.username || user.email}</CardTitle>
              <CardDescription>Welcome to your blog dashboard!</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Blogs Section */}
      {!loadingFromHook && blogs.length === 0 ? (
        <p className="text-gray-600">You haven't created any blogs yet.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.id}`} className="block">
                <Card className="hover:shadow-lg transition-shadow h-full">
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt="Blog"
                      className="w-full h-40 object-cover rounded-t-md"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{blog.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {blog.content}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <ReactPaginate
              previousLabel="Prev"
              nextLabel="Next"
              breakLabel="..."
              pageCount={totalPages}
              onPageChange={handlePageClick}
              forcePage={page - 1}
              containerClassName="flex justify-center mt-8 gap-2 flex-wrap"
              pageClassName="border rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transition-colors"
              activeClassName="bg-blue-500 text-white"
              previousClassName="border rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transition-colors"
              nextClassName="border rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transition-colors"
              breakClassName="px-2 py-1 text-gray-500"
            />
          )}
        </>
      )}
    </div>
  );
}

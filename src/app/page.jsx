"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import ReactPaginate from "react-paginate";

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for react-paginate
  const [totalPages, setTotalPages] = useState(0);
  const blogsPerPage = 6;

  const fetchBlogs = async (page = 0) => {
    setLoading(true);
    try {
      // NO token needed for public blogs access
      const res = await fetch(`/api/blog?page=${page + 1}&limit=${blogsPerPage}`);

      if (!res.ok) throw new Error("Failed to fetch blogs");

      const data = await res.json();

      setBlogs(data.blogs || []);
      setTotalPages(data.pagination?.totalPages || 0);
      setError(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setBlogs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage);
  }, [currentPage]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected); // react-paginate is zero-based
  };

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
          Welcome to <span className="text-blue-600">BlogPro</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto text-muted-foreground">
          Discover insightful articles in BlogPro
        </p>
        <div>
          <Link href="/blogs/create">
            <Button size="lg">Create Your Own Blog</Button>
          </Link>
        </div>
      </section>

      {/* Blogs Preview Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-8">Latest Blogs</h2>

        {loading && <p className="text-center">Loading blogs...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {blogs.length === 0 ? (
              <p className="text-center text-muted-foreground">No blogs found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map(({ id, title, content, image, author }) => (
                  <Link key={id} href={`/blogs/${id}`} className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      {image && (
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-48 object-cover rounded-t-xl"
                        />
                      )}
                      <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          By {author?.username || "Unknown"}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {content.length > 150
                            ? content.slice(0, 150) + "..."
                            : content}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={totalPages}
                  onPageChange={handlePageClick}
                  forcePage={currentPage}
                  containerClassName={"flex gap-2"}
                  pageClassName={"px-3 py-1 border rounded-md"}
                  activeClassName={"bg-blue-600 text-white"}
                  previousClassName={"px-3 py-1 border rounded-md"}
                  nextClassName={"px-3 py-1 border rounded-md"}
                  disabledClassName={"opacity-50 cursor-not-allowed"}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

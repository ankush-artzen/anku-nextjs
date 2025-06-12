"use client";

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
import usePaginatedPublicBlogs from "@/lib/hooks/usePaginatedPublicBlogs";

export default function HomePage() {
  const { blogs, page, totalPages, loading, error, setPage } =
    usePaginatedPublicBlogs();

  const handlePageClick = ({ selected }) => {
    setPage(selected + 1);
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto p-8 space-y-16 flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
          Welcome to{" "}
          <span className="text-blue-600 cursor-pointer">BlogPro</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto text-muted-foreground">
          Discover insightful articles in BlogPro
        </p>
        <div>
          <Link href="/blogs/create">
            <Button size="lg" className="cursor-pointer">
              Create Your Own Blog
            </Button>
          </Link>
        </div>
      </section>

      {/* Blogs Preview Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-8">Latest Blogs</h2>

        {error && <p className="text-center text-red-600">{error}</p>}

        {!error && (
          <>
            {blogs.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No blogs found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogs.map((blog, index) => {
                  if (!blog) return null;

                  const { id, title, content, image, author } = blog;

                  return (
                    <Link
                      key={id || index}
                      href={`/blogs/${id}`}
                      className="block"
                    >
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
                          <CardDescription className="mb-4">
                            {content.length > 150
                              ? content.slice(0, 150) + "..."
                              : content}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <ReactPaginate
                  previousLabel={"Previous"}
                  nextLabel={"Next"}
                  breakLabel={"..."}
                  pageCount={totalPages}
                  onPageChange={handlePageClick}
                  forcePage={page - 1}
                  containerClassName="flex gap-2 justify-center mt-8 flex-wrap"
                  pageClassName="border rounded-md"
                  pageLinkClassName="px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transform transition-transform duration-200 hover:scale-105 cursor-pointer"
                  activeClassName="bg-blue-400 text-white"
                  activeLinkClassName="text-white font-semibold"
                  previousClassName="border rounded-md"
                  previousLinkClassName="px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transform transition-transform duration-200 hover:scale-105 cursor-pointer"
                  nextClassName="border rounded-md"
                  nextLinkClassName="px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transform transition-transform duration-200 hover:scale-105 cursor-pointer"
                  breakClassName="border rounded-md"
                  breakLinkClassName="px-3 py-1 text-sm text-gray-500 cursor-default"
                  disabledClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

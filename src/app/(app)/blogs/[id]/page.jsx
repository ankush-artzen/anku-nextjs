"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import { clearAllBlogs } from "@/redux/slices/blogSlice";
import { clearPublicBlogs } from "@/redux/slices/publicSlice";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(`/api/blog/${id}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to fetch blog");
        }
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      const res = await fetch(`/api/blog/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete blog");
      }

      // Clear all cached blogs in Redux
      dispatch(clearAllBlogs());
      dispatch(clearPublicBlogs());

      toast.success("Blog deleted successfully");
      router.push("/blogs/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEdit = () => {
    // Clear cache before navigating to edit page
    dispatch(clearAllBlogs());
    dispatch(clearPublicBlogs());
    router.push(`/blogs/${id}/update`);
  };

  const isOwner = currentUserId && blog?.authorId === currentUserId;

  if (loading) return <p className="text-center p-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500 p-4">{error}</p>;
  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full max-h-[700px] object-cover rounded-xl shadow-lg"
        />
      )}
      <p className="text-gray-700 whitespace-pre-wrap">{blog.content}</p>

      {isOwner && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Wanna Delete?"
        description="Are you sure you want to delete this blog?"
        confirmLabel="Delete"
      />
    </div>
  );
}
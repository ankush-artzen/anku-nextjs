"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import jwt_decode from "jwt-decode";
import DeleteConfirm from "@/components/ui/DeleteConfirm";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    // Extract user ID from token
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      try {
        const decoded = jwtdecode(token);
        setCurrentUserId(decoded.id); // Assuming JWT payload includes "id"
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
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
      setIsDeleting(true);
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

      toast.success("Blog deleted successfully");
      router.push("/blogs/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/blogs/${id}/update`);
  };

  const isOwner = currentUserId && blog?.authorId === currentUserId;

  if (loading)
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  if (error) return <p className="text-center text-red-500 p-4">{error}</p>;
  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 relative">
      {/* Deleting loader overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50 rounded-xl">
          <div className="w-12 h-12 border-4 border-red-600 border-dashed rounded-full animate-spin"></div>
        </div>
      )}

      <h1 className="text-3xl font-bold">{blog.title}</h1>
      {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full max-h-[700px] object-cover rounded-xl shadow-lg"
        />
      )}
      <p className="text-gray-700 whitespace-pre-wrap">{blog.content}</p>

      {/* Show Edit/Delete only if user is blog owner */}
      {isOwner && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            disabled={isDeleting}
          >
            Delete
          </button>
        </div>
      )}

      <DeleteConfirm
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

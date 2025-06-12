"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import LogoutConfirmDialog from "@/components/ui/ConfirmDialog";
import { logout } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { clearAllBlogs } from "@/redux/slices/blogSlice";
import { clearPublicBlogs } from "@/redux/slices/publicSlice";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getCookie("token");
    const user = getCookie("user");

    setIsLoggedIn(!!token);

    if (user) {
      try {
        const decoded = decodeURIComponent(user);
        const parsed = JSON.parse(decoded);
        setUserEmail(parsed.email || "");
      } catch (err) {
        console.error("Failed to parse user cookie", err);
        setUserEmail("");
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // ✅ Optional: Call backend to clear Redis cache
      await fetch("/api/logout", { method: "POST" });

      // ✅ Clear redux store
      dispatch(clearAllBlogs());
      dispatch(clearPublicBlogs());
      dispatch(logout());

      // ✅ Clear cookies
      deleteCookie("token");
      deleteCookie("user");

      // ✅ Update state & redirect
      setIsLoggedIn(false);
      setConfirmOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              BlogPro
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link href="/blogs/dashboard" className="mt-2 font-bold text-blue-600 hover:text-blue-700">
                Dashboard
              </Link>

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                      <Avatar className="w-9 h-9 cursor-pointer">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userEmail || "U")}`}
                          alt="User Avatar"
                        />
                        <AvatarFallback>{(userEmail || "U")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-4 py-2 text-sm text-muted-foreground">{userEmail}</div>
                    <DropdownMenuItem onClick={() => setConfirmOpen(true)} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="mt-2 font-bold text-blue-600 hover:text-blue-700">
                  Login
                </Link>
              )}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 px-2 pt-2 pb-3 space-y-1 shadow-md">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Home
            </Link>
            <Link href="/blogs/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Blogs
            </Link>

            {isLoggedIn ? (
              <button onClick={() => setConfirmOpen(true)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 w-full text-left">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Login
                </Link>
                <Link href="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <LogoutConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={handleLogout} onCancel={() => setConfirmOpen(false)} />
    </>
  );
}

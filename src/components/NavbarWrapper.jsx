'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar'; 

export default function NavbarWrapper({ children }) {
  const pathname = usePathname();
  
  const noNavbarPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ];

  // Check if current pathname starts with any of the excluded paths
  const showNavbar = !noNavbarPaths.some(path => pathname.startsWith(path));

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}

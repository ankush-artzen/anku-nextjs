# Blog App 📝

A full-stack blog application built with **Next.js** that supports user authentication, blog CRUD operations, image uploads, email password reset , and much more.

---

## 🚀 Tech Stack

- **Frontend & Backend:** Next.js (Fullstack)
- **State Management:** Redux
- **Form Validation:** Yup with React Hook Form
- **Authentication:** JWT based
- **Database:** MongoDB (via Prisma or Mongoose depending on your setup)
- **Image Storage:** Supabase Storage
- **Email Service:** Resend
- **Error Tracking & Monitoring:** Sentry
- **Caching / Rate Limiting / Session:** Upstash Redis
- **Environment Variables:** Managed via `.env.local`

---

## 🔐 Features

- User Signup & Login (JWT secured)
- Forgot Password & Reset Password flows
- Blog CRUD operations (Create, Read, Update, Delete)
- Image upload with Supabase Storage
- Email notifications with Resend API
- Form validations using Yup
- Global state management using Redux
- Error monitoring & tracking using Sentry
- Secured routes and protected API endpoints
- Environment variable management
- Scalable & production ready

---

## ⚙️ Installation

### 1️⃣ Clone the repo

```bash
git clone  https://github.com/manishsaraan/ankush-nextjs/
cd blog-app

# 2️⃣ Install dependencies


npm install
# or
yarn install


# 3️⃣ Setup Environment Variables

Create a .env.local file in the root of your project and configure the following variables:


# Database
DATABASE_URL="your_mongodb_url"

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret

# Environment
NODE_ENV=development

# Resend Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_resend_verified_email

# Supabase (for image storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Password Reset Secret
RESET_SECRET_KEY=your_reset_secret

# Client URL (used in email templates etc.)
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

# 4️⃣ Run development server

npm run dev
# or
yarn dev

# 🖼️ Architecture

pages/ — Next.js pages for routing

api/ — API routes for authentication, blogs, email, etc.

lib/ — Shared code (DB connection, JWT, Redis client, validations)

redux/ — Redux store and slices for state management

components/ — Reusable UI components

middleware/ — Authentication middleware for protected routes

# 📦 Packages Used

next
react, 
redux, 
@reduxjs/toolkit
axios
@prisma/client
bcryptjs
jsonwebtoken
resend
@supabase/supabase-js
sentry
yup & @hookform/resolvers
react-hook-form
react-toastify
shadcn/ui (for UI components)

# 🛡️ Security

JWT-based authentication with  cookies

Input validations using Yup on both client and server

Sensitive data stored securely in environment variables

Passwords hashed using bcrypt

Reset password tokens secured using crypto secret keys

🔭 Monitoring & Logging
Errors are automatically tracked via Sentry

Failures in API routes can be logged for debugging







// lib/validations/blogSchema.js
import * as yup from 'yup';

// Base blog schema
const blogSchema = yup.object().shape({
  title: yup
    .string()
    .required('Title is required')
    .min(4, 'Title must be at least 4 characters')
    .max(100, 'Title must be at most 100 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Title cannot contain special characters'),

  content: yup
    .string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters')
    .test(
      'no-dangerous-chars',
      'Content contains invalid characters (like < or >)',
      (value) => !/[<>]/.test(value || '')
    ),
  
  image: yup
    .mixed()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value) return true; // Optional field
      return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
    })
});

// Validation function
export const validateBlogData = async (data) => {
  try {
    await blogSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner?.forEach(error => {
      if (error.path) errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};

// Export the schema if needed elsewhere
export { blogSchema };
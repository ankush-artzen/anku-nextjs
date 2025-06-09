import * as yup from 'yup';

export const blogSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(4, 'Title must be at least 4 characters')
    .max(20, 'Title must be at most 20 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Title cannot contain special characters'),

  content: yup
    .string()
    .required('Content is required')
    .test(
      'no-dangerous-chars',
      'Content contains invalid characters (like < or >)',
      (value) => {
        if (!value) return false;
        return !/[<>]/.test(value);
      }
    ),
});

// Optional: Export a function to validate against the schema
export const validateBlogData = async (data) => {
  try {
    await blogSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    if (err.inner && err.inner.length > 0) {
      err.inner.forEach(error => {
        if (error.path) errors[error.path] = error.message;
      });
    } else if (err.path) {
      errors[err.path] = err.message;
    }
    return { isValid: false, errors };
  }
};

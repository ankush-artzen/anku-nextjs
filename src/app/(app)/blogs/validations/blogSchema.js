import * as yup from 'yup';

export const blogSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(4, 'Title must be at least 4 characters')
    .max(100, 'Title must be at most 100 characters')
    .matches(/^[a-zA-Z0-9 ]+$/, 'Title cannot contain special characters'),
  content: yup
    .string()
    .required('Content is required')
    .test('minWords', 'Content must be at least 25 words', (value) => {
      if (!value) return false;
      const wordCount = value.trim().split(/\s+/).length;
      return wordCount >= 25;
    })
});

// Optional: Export a function to validate against the schema
export const validateBlogData = async (data) => {
  try {
    await blogSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach(error => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};
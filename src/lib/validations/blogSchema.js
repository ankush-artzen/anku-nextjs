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
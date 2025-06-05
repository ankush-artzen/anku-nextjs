import * as yup from 'yup';

export const blogSchema = yup.object({
  title: yup.string().required('Title is required'),
  content: yup
    .string()
    .required('Content is required')
    .test('minWords', 'Content must be at least 25 words', (value) => {
      if (!value) return false;
      const wordCount = value.trim().split(/\s+/).length;
      return wordCount >= 25;
    })
});

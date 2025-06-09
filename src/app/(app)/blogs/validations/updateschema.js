import * as Yup from 'yup';

export const blogValidationSchema = Yup.object({
    title: Yup.string()
    .notRequired()
    .test('notEmpty', 'Title cannot be empty', (value) => {
      // allow undefined (not provided)
      if (value === undefined) return true;
      return value.trim() !== '';
    })
    .test('minLength', 'Title must be at least 4 characters', (value) => {
      if (!value) return true; // skip if no title provided
      return value.trim().length >= 4;
    })
    .matches(/^[a-zA-Z0-9 ]*$/, 'Title cannot contain special characters'),
  content: Yup.string()
    .notRequired()
    .test('minWords', 'Content must be at least 25 words', (value) => {
      if (!value) return true; // skip if not provided
      const wordCount = value.trim().split(/\s+/).length;
      return wordCount >= 25;
    }),

  image: Yup.mixed()
    .notRequired()
    .test('fileType', 'Invalid file type', function (value) {
      if (!value) return true;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      return allowedTypes.includes(value.type);
    }),
});

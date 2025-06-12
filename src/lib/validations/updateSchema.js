import * as Yup from 'yup';

export const blogValidationSchema = Yup.object({
  title: Yup.string()
    .notRequired()
    .test('notEmpty', 'Title cannot be empty', (value) => {
      if (value === undefined) return true;
      return value.trim() !== '';
    })
    .test('minLength', 'Title must be at least 4 characters', (value) => {
      if (!value) return true;
      return value.trim().length >= 4;
    })
    .test('maxLength', 'Title must be at most 100 characters', (value) => {
      if (!value) return true;
      return value.trim().length <= 100;
    })
    .matches(
      /^[a-zA-Z0-9 ]*$/,
      'Title can only contain letters, numbers, and spaces'
    ),

  content: Yup.string()
    .notRequired()
    .test('notEmptyContent', 'Content cannot be empty', (value) => {
      if (value === undefined) return true;
      return value.trim() !== '';
    })
    .test('minCharLength', 'Content must be at least 10 characters', (value) => {
      if (!value) return true;
      return value.trim().length >= 10;
    })
    .test(
      'noDangerousChars',
      'Content contains disallowed characters (e.g. < or >)',
      (value) => {
        if (!value) return true;
        return !/[<>]/.test(value); // Disallow angle brackets
      }
    ),

  image: Yup.mixed()
    .notRequired()
    .test('fileType', 'Invalid file type', (value) => {
      if (!value) return true;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      return allowedTypes.includes(value.type);
    }),
});
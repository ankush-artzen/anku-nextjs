import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  
  password: yup
    .string()
    .required('Password is required'),
});

export const signupFormSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z][a-zA-Z0-9_]{3,10}$/, 'Invalid username')
    .required('Username is required'),

  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),

  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
});


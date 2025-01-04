import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .matches(/^[A-Za-z]+$/, 'First name must only contain alphabets')
    .min(3, 'First name must be at least 3 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .matches(/^[A-Za-z]+$/, 'Last name must only contain alphabets')
    .min(3, 'Last name must be at least 3 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .trim(),
  mobileNumber: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\d{10}$/, 'Mobile number must have exactly 10 digits'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      'Password must contain one uppercase, one lowercase, one number, and one special character'
    ),
  
});

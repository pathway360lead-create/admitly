import * as z from 'zod';

/**
 * Strong password schema with complexity requirements
 * - Minimum 8 characters
 * - Maximum 128 characters (prevent DoS)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Registration validation schema
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long'),
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email is too long'),
    password: passwordSchema,
    confirmPassword: z.string().max(128, 'Password is too long'),
    role: z.enum(['student', 'counselor', 'institution_admin'] as const),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

import { describe, it, expect } from 'vitest';
import {
  passwordSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
} from './validation';

describe('passwordSchema', () => {
  describe('valid passwords', () => {
    it('accepts password with all requirements', () => {
      const result = passwordSchema.safeParse('SecureP@ss123');
      expect(result.success).toBe(true);
    });

    it('accepts password with multiple special characters', () => {
      const result = passwordSchema.safeParse('P@ssw0rd!#$');
      expect(result.success).toBe(true);
    });

    it('accepts 8-character minimum password', () => {
      const result = passwordSchema.safeParse('Test@123');
      expect(result.success).toBe(true);
    });

    it('accepts very long password (128 chars)', () => {
      const longPassword = 'A1@' + 'a'.repeat(125);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid passwords - length', () => {
    it('rejects password shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Test@1');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('rejects password longer than 128 characters', () => {
      const longPassword = 'A1@' + 'a'.repeat(126);
      const result = passwordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is too long');
      }
    });
  });

  describe('invalid passwords - complexity', () => {
    it('rejects password without uppercase letter', () => {
      const result = passwordSchema.safeParse('password@123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('rejects password without lowercase letter', () => {
      const result = passwordSchema.safeParse('PASSWORD@123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('rejects password without number', () => {
      const result = passwordSchema.safeParse('Password@abc');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });

    it('rejects password without special character', () => {
      const result = passwordSchema.safeParse('Password123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('special character');
      }
    });

    it('rejects all lowercase password', () => {
      const result = passwordSchema.safeParse('password');
      expect(result.success).toBe(false);
    });

    it('rejects all uppercase password', () => {
      const result = passwordSchema.safeParse('PASSWORD');
      expect(result.success).toBe(false);
    });
  });
});

describe('loginSchema', () => {
  describe('valid login data', () => {
    it('accepts valid email and password', () => {
      const data: LoginFormData = {
        email: 'test@example.com',
        password: 'Test@123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts long valid email', () => {
      const data: LoginFormData = {
        email: 'very.long.email.address@subdomain.example.com',
        password: 'Test@123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid login data - email', () => {
    it('rejects invalid email format', () => {
      const data = {
        email: 'not-an-email',
        password: 'Test@123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(247) + '@test.com'; // 256 chars (247 + 9 = 256)
      const data = {
        email: longEmail,
        password: 'Test@123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is too long');
      }
    });

    it('rejects missing @ symbol', () => {
      const data = {
        email: 'testexample.com',
        password: 'Test@123',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('invalid login data - password', () => {
    it('rejects password shorter than 8 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'short',
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('rejects password longer than 128 characters', () => {
      const data = {
        email: 'test@example.com',
        password: 'a'.repeat(129),
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is too long');
      }
    });
  });
});

describe('registerSchema', () => {
  describe('valid registration data', () => {
    it('accepts valid registration for student', () => {
      const data: RegisterFormData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts valid registration for counselor', () => {
      const data: RegisterFormData = {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'counselor',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts valid registration for institution_admin', () => {
      const data: RegisterFormData = {
        fullName: 'Admin User',
        email: 'admin@unilag.edu.ng',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'institution_admin',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts 2-character full name', () => {
      const data: RegisterFormData = {
        fullName: 'Jo',
        email: 'jo@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid registration data - fullName', () => {
    it('rejects full name shorter than 2 characters', () => {
      const data = {
        fullName: 'J',
        email: 'j@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Full name must be at least 2 characters');
      }
    });

    it('rejects full name longer than 100 characters', () => {
      const data = {
        fullName: 'a'.repeat(101),
        email: 'test@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Full name is too long');
      }
    });
  });

  describe('invalid registration data - password mismatch', () => {
    it('rejects when passwords do not match', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'DifferentP@ss123',
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });

    it('rejects weak password even if confirmed', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('invalid registration data - role', () => {
    it('rejects invalid role', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'invalid_role',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('invalid registration data - terms', () => {
    it('rejects when terms not accepted', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'SecureP@ss123',
        role: 'student',
        acceptTerms: false,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('You must accept the terms and conditions');
      }
    });
  });

  describe('confirmPassword max length', () => {
    it('rejects confirmPassword longer than 128 characters', () => {
      const data = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'SecureP@ss123',
        confirmPassword: 'a'.repeat(129),
        role: 'student',
        acceptTerms: true,
      };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('forgotPasswordSchema', () => {
  describe('valid forgot password data', () => {
    it('accepts valid email', () => {
      const data: ForgotPasswordFormData = {
        email: 'test@example.com',
      };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('invalid forgot password data', () => {
    it('rejects invalid email format', () => {
      const data = {
        email: 'not-an-email',
      };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('rejects email longer than 255 characters', () => {
      const longEmail = 'a'.repeat(247) + '@test.com'; // 256 chars (247 + 9 = 256)
      const data = {
        email: longEmail,
      };
      const result = forgotPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is too long');
      }
    });
  });
});

describe('DoS Prevention - Input Length Limits', () => {
  it('prevents extremely long email attacks', () => {
    const data = {
      email: 'a'.repeat(300) + '@example.com',
      password: 'Test@123',
    };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('prevents extremely long password attacks', () => {
    const data = {
      email: 'test@example.com',
      password: 'A1@' + 'a'.repeat(200),
    };
    const result = loginSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('prevents extremely long full name attacks', () => {
    const data = {
      fullName: 'a'.repeat(200),
      email: 'test@example.com',
      password: 'SecureP@ss123',
      confirmPassword: 'SecureP@ss123',
      role: 'student',
      acceptTerms: true,
    };
    const result = registerSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

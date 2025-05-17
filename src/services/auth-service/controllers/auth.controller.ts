import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthRepository from '../repositories/auth.repository';
import { z } from 'zod';
import { sendEmail } from '../utils/email.util';

// Validator schema menggunakan Zod
const registerSchema = z.object({
  name: z.string().min(3, { message: 'name must be at least 3 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const resetPasswordSchema = z.object({
  code: z.string().min(1, { message: 'Token is required' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Registrasi User Baru
export const register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi input menggunakan Zod
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: parsed.error.errors,
      });
      
    }

    const { name, email, password } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AuthRepository.createUser({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      status:'success',
      message: 'User registered successfully',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error registering user', error: error
    });
  }
};

// Login User
export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi input menggunakan Zod
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: parsed.error.errors,
      });
      
    }

    const { email, password } = req.body;

    // Cari pengguna berdasarkan email
    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
      
    } else { 
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
      
    }

    // Buat token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        name: user.name,
        email: user.email,
        token: token
      },
     
    });
    }

    // Verifikasi password yang dimasukkan
    
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: 'Error logging in', error: err
    });
  }
};

// Forgot Password
function generateResetCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit angka
  return code;
}

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Cari user berdasarkan email
    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      
    } else { 
      const resetToken = generateResetCode();


    // Set expired dalam 1 jam
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Simpan ke PasswordReset (hapus dulu kalau ada yang lama)
    await AuthRepository.createPasswordReset(user.id, resetToken, expiresAt);

    // Kirim email berisi resetCode
    await sendEmail(email, resetToken);

    res.status(200).json({
      status:'success',
      message: 'Reset code has been sent to your email'
    });
    }

    // Generate reset code 6 digit
    
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing forgot password'
    });
  }
};

// Reset Password
export const resetPassword: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi input menggunakan Zod
    const parsed = resetPasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: parsed.error.errors,
      });
      
    }

    const { code, newPassword } = req.body;

    // Cari data reset password berdasarkan code
    const resetRequest = await AuthRepository.findByResetCode(code);

    if (!resetRequest) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset code'
      });
      
    } else { 
        // Verifikasi jika kode belum kadaluarsa
    const currentTime = new Date();
    if (resetRequest.expiresAt < currentTime) {
      res.status(400).json({
        status: 'error',
        message: 'Reset code has expired'
      });
      
    }
    const userId = resetRequest.userId;

    // Cari pengguna berdasarkan userId yang terkait dengan reset code
    const user = await AuthRepository.findUserById(userId);

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      
      } else { 
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password pengguna
        await AuthRepository.updatePassword(user.id, hashedPassword);
    
        // Hapus reset code setelah berhasil mengubah password
        await AuthRepository.deleteCode(user.id);
        res.status(200).json({
          status:'success',
          message: 'Password updated successfully'
        });
      }

    // Hash password baru
   

   
    }

  
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password', error: error
    });
  }
};
// Logout User
export const logout: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
      
    } else { 
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      // Kalau mau simpan blacklist token, bisa di sini
      // Misal: BlacklistRepository.add(token)
  
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    }
   
    
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};
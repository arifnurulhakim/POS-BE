// import { User } from '../models/user.model'; // Import model User (asumsi Anda sudah membuat model)
// import { PrismaClient } from '@prisma/client'; // Gunakan Prisma Client jika Anda menggunakan Prisma, bisa diganti dengan ORM atau DB client lain yang Anda pakai

// const prisma = new PrismaClient(); // Prisma Client untuk akses DB

// import { PrismaClient } from '../../../prisma/client';
// import { PrismaClient } from '../generated';  // Path ini harus disesuaikan dengan struktur folder Anda

// const prisma = new PrismaClient();
import { PrismaClient } from '../../../generated/prisma';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
class AuthRepository {
  // Find user by email
  static async findUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      return user;
    } catch (error) {
      console.log(error)
      throw new Error('Error finding user by email');
    }
  }
  static async findUserById(userId: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId 
          
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error finding user by email');
    }
  }
  static async findByResetCode(code: string) {
    try {
      const user = await prisma.passwordReset.findFirst({
        where: {
          resetToken: code,
        },
      });
      return user;
    } catch (error) {
      throw new Error('Error finding user by email');
    }
  }

  static async deleteCode(userId: string) { 
    await prisma.passwordReset.deleteMany({
      where: { userId },
    });
  }
  static async createPasswordReset(userId: string, resetToken: string, expiresAt: Date) {
    // Hapus record lama untuk user ini jika ada
    await prisma.passwordReset.deleteMany({
      where: { userId },
    });

    // Simpan reset code baru
    return await prisma.passwordReset.create({
      data: {
        userId,
        resetToken,
        expiresAt,
      },
    });
  }
  // Create a new user
  static async createUser(data: { name: string; email: string; password: string }) {
    try {
      const newUser = await prisma.user.create({
        data,
      });
      return newUser;
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  // Update user password
  static async updatePassword(userId: string, newPassword: string) {
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: newPassword,
        },
      });
      return updatedUser;
    } catch (error) {
      throw new Error('Error updating password');
    }
  }
  static async findUserByResetToken(resetToken: string) {
    return await prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gt: new Date(), // Token belum expired
        },
      },
    });
  }
    
  static async storeResetTokenInUser(userId: string, resetToken: string, resetTokenExpiry: Date) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
  }
}

export default AuthRepository;
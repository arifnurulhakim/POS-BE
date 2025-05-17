import express from 'express';
import { Router } from "express";
import { register, login, forgotPassword, resetPassword, logout } from '../controllers/auth.controller';

// const router = express.Router();
const router = Router();


// router.post('/login', (req, res) => {
//     res.json({ message: 'Login route' });
//   });
  
// // Registrasi User Baru
router.post('/register', register);

// // Login User
router.post('/login', login);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.post('/reset-password', resetPassword); 

// Logout User
router.post('/logout', logout);

export default router;
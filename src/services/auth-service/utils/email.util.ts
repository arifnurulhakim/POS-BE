import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Fungsi untuk mengirim email dengan HTML yang berisi kode verifikasi
export const sendEmail = async (to: string, code: string): Promise<void> => {
  try {
    // Membuat transporter dengan konfigurasi email menggunakan SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,  // Ambil dari .env
      port: Number(process.env.SMTP_PORT),  // Ambil port dari .env
      secure: process.env.SMTP_SECURE === 'true',  // Tentukan apakah menggunakan secure (SSL/TLS)
      auth: {
        user: process.env.SMTP_USER,  // Ambil user SMTP dari .env
        pass: process.env.SMTP_PASS,  // Ambil password SMTP dari .env
      },
    });

    // Menyiapkan konten email dalam format HTML
    const htmlContent = `
      <h1>Verification Code</h1>
      <p>Your verification code is:</p>
      <h2 style="color: blue;">${code}</h2>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Menyiapkan opsi untuk email dengan konten HTML
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,  // Email pengirim dari .env
      to,
      subject: 'Your Verification Code',
      html: htmlContent,  // Menggunakan HTML content
    };

    // Mengirim email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}: `, error);
    throw new Error('Error sending email');
  }
};
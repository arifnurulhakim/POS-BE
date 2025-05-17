import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("✅ MongoDB Atlas terkoneksi");
  } catch (err) {
    console.error("❌ MongoDB gagal konek:", err);
  }
};
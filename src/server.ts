import app from "./app";
import { connectMongo } from "./config/mongo";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectMongo();
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

startServer();
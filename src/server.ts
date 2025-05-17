import app from "./app";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Nonaktifkan MongoDB connection
    // await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
};

startServer();
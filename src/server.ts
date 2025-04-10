import app from "./app";
import { connectMongo } from "./config/mongo";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await connectMongo();
  console.log(`🚀 Server ready di http://localhost:${PORT}`);
});
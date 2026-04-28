import "dotenv/config";
import { server } from "./app.js";
import { connectDB } from "./config/database.js";

await connectDB();

const PORT = process.env.PORT || 3000;


server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on http://0.0.0.0:${PORT}`);
  console.log(`🔌 WebSocket en ws://0.0.0.0:${PORT}/ws?role=admin`);
});
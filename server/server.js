import "dotenv/config"; // Must be first — loads env vars before any other imports
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/socket.js";

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

connectDB().then(() => {
  // ✅ Wrap Express in an HTTP server so Socket.IO can attach
  const httpServer = createServer(app);

  // ✅ Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  initSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO listening on ws://localhost:${PORT}`);
  });
});

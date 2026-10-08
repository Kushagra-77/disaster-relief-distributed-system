import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { initMessageService, logMessage } from "./services/messageService.js";
import nodeRoutes from "./routes/nodeRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";
import fa2Routes from "./routes/fa2Routes.js";
import { middlewareService } from "./services/middlewareService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initMessageService(io);

// Mount API routes
app.use("/api", nodeRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", requestRoutes);
app.use("/api", transferRoutes);
app.use("/api", fa2Routes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    cluster: "Disaster-Relief-Distributed-Coordination-FA2",
    timestamp: new Date().toISOString(),
    metrics: middlewareService.getMetrics()
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

io.on("connection", (socket) => {
  socket.emit("system:ready", { message: "Connected to Distributed Disaster Relief Coordinator (FA-1 + FA-2)" });
});

server.listen(PORT, () => {
  console.log(`[DISASTER RELIEF COORDINATOR FA-2] Cluster running on http://localhost:${PORT}`);
  logMessage({
    type: "EVENT",
    sender: "Coordinator Host",
    receiver: "Distributed Cluster",
    action: "System Boot (FA-2 Enabled)",
    details: `Distributed Coordinator Node initialized on port ${PORT} with Lamport Clocks, Mutual Exclusion, Leader Election, and Blockchain Audit.`,
    status: "SUCCESS"
  });
});

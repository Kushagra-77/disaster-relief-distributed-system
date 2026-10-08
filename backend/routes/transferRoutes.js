import express from "express";
import { middlewareService } from "../services/middlewareService.js";
import { getRecentMessages, clearMessageLog } from "../services/messageService.js";

const router = express.Router();

router.post("/transfers", async (req, res) => {
  const { sourceNodeId, destinationNodeId, resource, quantity } = req.body;
  if (!sourceNodeId || !destinationNodeId || !resource || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, error: "Invalid transfer parameters" });
  }

  try {
    const result = await middlewareService.handleResourceTransfer({
      sourceNodeId,
      destinationNodeId,
      resource,
      quantity: parseInt(quantity, 10)
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/messages", (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  res.json({ success: true, messages: getRecentMessages(limit) });
});

router.delete("/messages", (req, res) => {
  clearMessageLog();
  res.json({ success: true, message: "Message log cleared" });
});

router.get("/metrics", (req, res) => {
  res.json({ success: true, metrics: middlewareService.getMetrics() });
});

export default router;

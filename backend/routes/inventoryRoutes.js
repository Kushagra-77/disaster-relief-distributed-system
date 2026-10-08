import express from "express";
import { nodeService } from "../services/nodeService.js";

const router = express.Router();

router.get("/inventory", (req, res) => {
  res.json({ success: true, inventory: nodeService.getAllInventories() });
});

router.get("/inventory/:nodeId", (req, res) => {
  const inv = nodeService.getInventory(req.params.nodeId);
  if (!inv) return res.status(404).json({ success: false, error: "Node not found" });
  res.json({ success: true, nodeId: req.params.nodeId, inventory: inv });
});

export default router;

import express from "express";
import { nodeService } from "../services/nodeService.js";
import { faultToleranceService } from "../services/faultToleranceService.js";

const router = express.Router();

router.get("/nodes", (req, res) => {
  res.json({ success: true, nodes: nodeService.getAllNodes() });
});

router.get("/nodes/:nodeId", (req, res) => {
  const node = nodeService.getNode(req.params.nodeId);
  if (!node) return res.status(404).json({ success: false, error: "Node not found" });
  res.json({ success: true, node });
});

router.post("/nodes/:nodeId/status", (req, res) => {
  const { status } = req.body;
  const { nodeId } = req.params;
  if (!["ONLINE", "OFFLINE"].includes(status)) {
    return res.status(400).json({ success: false, error: "Invalid status. Must be ONLINE or OFFLINE" });
  }

  const result = status === "OFFLINE"
    ? faultToleranceService.failNode(nodeId)
    : faultToleranceService.recoverNode(nodeId);

  res.json({ success: true, result });
});

router.get("/links", (req, res) => {
  res.json({ success: true, links: nodeService.getAllLinks() });
});

router.post("/links/status", (req, res) => {
  const { nodeIdA, nodeIdB, status } = req.body;
  if (!nodeIdA || !nodeIdB || !["ACTIVE", "SEVERED"].includes(status)) {
    return res.status(400).json({ success: false, error: "Missing or invalid link parameters" });
  }

  const result = status === "SEVERED"
    ? faultToleranceService.failLink(nodeIdA, nodeIdB)
    : faultToleranceService.restoreLink(nodeIdA, nodeIdB);

  res.json({ success: true, result });
});

export default router;

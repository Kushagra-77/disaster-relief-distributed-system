import express from "express";
import { middlewareService } from "../services/middlewareService.js";
import { faultToleranceService } from "../services/faultToleranceService.js";

const router = express.Router();

router.post("/requests", async (req, res) => {
  const { requestingCenterId, resource, quantity, priority, preferredWarehouseId } = req.body;
  if (!requestingCenterId || !resource || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, error: "Invalid request parameters" });
  }

  try {
    const result = await middlewareService.handleResourceRequest({
      requestingCenterId,
      resource,
      quantity: parseInt(quantity, 10),
      priority: priority || "NORMAL",
      preferredWarehouseId
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/scenarios/race-condition", async (req, res) => {
  try {
    const result = await middlewareService.runRaceConditionScenario();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/scenarios/fault-fallback", async (req, res) => {
  try {
    const result = await middlewareService.runFaultFallbackScenario();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/system/reset", (req, res) => {
  const result = faultToleranceService.resetSystem();
  res.json(result);
});

router.post("/system/latency", (req, res) => {
  const { latency } = req.body;
  const result = faultToleranceService.setLatency(parseInt(latency, 10) || 0);
  res.json(result);
});

export default router;

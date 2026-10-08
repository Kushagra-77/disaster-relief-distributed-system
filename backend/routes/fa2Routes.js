import express from "express";
import { lamportService } from "../services/lamportService.js";
import { mutexService } from "../services/mutexService.js";
import { electionService } from "../services/electionService.js";
import { blockchainService } from "../services/blockchainService.js";
import { nodeService } from "../services/nodeService.js";
import { middlewareService } from "../services/middlewareService.js";

const router = express.Router();

router.get("/fa2/status", (req, res) => {
  res.json({
    success: true,
    lamport: lamportService.getAllClocks(),
    mutex: mutexService.getAllLocks(),
    election: electionService.getLeaderInfo(),
    blockchain: {
      blocks: blockchainService.getChain(),
      totalBlocks: blockchainService.getChain().length,
      isTampered: blockchainService.isTampered
    }
  });
});

router.post("/fa2/lamport/demo", async (req, res) => {
  try {
    const result = await lamportService.runLamportDemo();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/fa2/mutex/demo", async (req, res) => {
  try {
    const result = await middlewareService.runMutualExclusionDemo();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/fa2/election/run", async (req, res) => {
  try {
    const result = await electionService.startElection(nodeService, "Manual User Trigger");
    res.json({ success: true, election: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/fa2/blockchain/verify", (req, res) => {
  const result = blockchainService.verifyChain();
  res.json({ success: true, verification: result });
});

router.post("/fa2/blockchain/create", (req, res) => {
  const { eventType, sourceNode, destinationNode, resource, quantity, details } = req.body || {};
  const newBlock = blockchainService.addBlock({
    eventType: eventType || "RESOURCE_AUDIT_ENTRY",
    sourceNode: sourceNode || "Warehouse A",
    destinationNode: destinationNode || "Relief Center A",
    resource: resource || "Water",
    quantity: parseInt(quantity, 10) || 25,
    details: details || "Verified disaster supply inventory block"
  });
  res.json({ success: true, block: newBlock });
});

router.post("/fa2/blockchain/tamper", (req, res) => {
  const result = blockchainService.tamperLatestBlock();
  res.json({ success: true, result });
});

export default router;

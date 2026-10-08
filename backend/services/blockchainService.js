import crypto from "crypto";
import { broadcastStateUpdate, logMessage } from "./messageService.js";
import { lamportService } from "./lamportService.js";

class Block {
  constructor(blockNumber, timestamp, eventType, sourceNode, destinationNode, resource, quantity, details, previousHash = "") {
    this.blockNumber = blockNumber;
    this.timestamp = timestamp;
    this.eventType = eventType;
    this.sourceNode = sourceNode;
    this.destinationNode = destinationNode;
    this.resource = resource;
    this.quantity = quantity;
    this.details = details;
    this.previousHash = previousHash;
    this.currentHash = this.calculateHash();
  }

  calculateHash() {
    const rawData = `${this.blockNumber}-${this.timestamp}-${this.eventType}-${this.sourceNode}-${this.destinationNode}-${this.resource}-${this.quantity}-${this.details}-${this.previousHash}`;
    return crypto.createHash("sha256").update(rawData).digest("hex");
  }
}

class BlockchainAuditService {
  constructor() {
    this.chain = [];
    this.initialize();
  }

  initialize() {
    this.chain = [];
    // Genesis Block
    const genesisBlock = new Block(
      0,
      new Date().toISOString(),
      "GENESIS_ANCHOR",
      "Disaster Relief Cluster",
      "Network Coordinator",
      "All Resources",
      0,
      "Genesis Audit Anchor Block - Disaster Coordination Ledger Initialized",
      "0000000000000000000000000000000000000000000000000000000000000000"
    );
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock({
    eventType = "RESOURCE_AUDIT",
    sourceNode = "Warehouse A",
    destinationNode = "Relief Center A",
    resource = "Water",
    quantity = 0,
    details = ""
  }) {
    const prevBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      new Date().toISOString(),
      eventType,
      sourceNode,
      destinationNode,
      resource,
      quantity,
      details,
      prevBlock.currentHash
    );

    this.chain.push(newBlock);

    const clock = lamportService.tick(sourceNode || "Auditor", `Appended Block #${newBlock.blockNumber}`);

    logMessage({
      type: "BLOCKCHAIN",
      sender: "Blockchain Auditor",
      receiver: "Immutable Ledger",
      action: `[Blockchain] Block #${newBlock.blockNumber} Appended`,
      details: `${eventType}: ${quantity > 0 ? `${quantity} ${resource}` : ""}${details ? ` (${details})` : ""} | Hash: ${newBlock.currentHash.substring(0, 12)}...`,
      status: "SUCCESS",
      metadata: {
        blockNumber: newBlock.blockNumber,
        hash: newBlock.currentHash,
        prevHash: newBlock.previousHash,
        lamportClock: clock
      }
    });

    broadcastStateUpdate({ type: "BLOCKCHAIN_UPDATE", blocks: this.getChain() });
    return newBlock;
  }

  getChain() {
    return this.chain.map((b) => ({
      blockNumber: b.blockNumber,
      timestamp: b.timestamp,
      eventType: b.eventType,
      sourceNode: b.sourceNode,
      destinationNode: b.destinationNode,
      resource: b.resource,
      quantity: b.quantity,
      details: b.details,
      previousHash: b.previousHash,
      currentHash: b.currentHash
    }));
  }

  verifyChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check current block's hash integrity
      const recalculatedHash = currentBlock.calculateHash();
      if (currentBlock.currentHash !== recalculatedHash) {
        logMessage({
          type: "BLOCKCHAIN",
          sender: "Blockchain Auditor",
          receiver: "Security Monitor",
          action: `[Blockchain] Verification Failed!`,
          details: `Block #${currentBlock.blockNumber} hash mismatch! Computed: ${recalculatedHash.substring(0, 10)}... vs Stored: ${currentBlock.currentHash.substring(0, 10)}...`,
          status: "FAILED"
        });

        return {
          isValid: false,
          totalBlocks: this.chain.length,
          tamperedBlockNumber: currentBlock.blockNumber,
          message: `BLOCKCHAIN INTEGRITY: INVALID (Tampering detected at Block #${currentBlock.blockNumber})`
        };
      }

      // Check previous hash link
      if (currentBlock.previousHash !== previousBlock.currentHash) {
        logMessage({
          type: "BLOCKCHAIN",
          sender: "Blockchain Auditor",
          receiver: "Security Monitor",
          action: `[Blockchain] Verification Link Broken!`,
          details: `Block #${currentBlock.blockNumber} previousHash does not match Block #${previousBlock.blockNumber} currentHash!`,
          status: "FAILED"
        });

        return {
          isValid: false,
          totalBlocks: this.chain.length,
          tamperedBlockNumber: currentBlock.blockNumber,
          message: `BLOCKCHAIN INTEGRITY: INVALID (Broken link at Block #${currentBlock.blockNumber})`
        };
      }
    }

    logMessage({
      type: "BLOCKCHAIN",
      sender: "Blockchain Auditor",
      receiver: "Cluster Supervisor",
      action: `[Blockchain] Verification Passed [VALID]`,
      details: `All ${this.chain.length} audit blocks verified successfully. Cryptographic SHA-256 chain is immutable and valid.`,
      status: "SUCCESS"
    });

    return {
      isValid: true,
      totalBlocks: this.chain.length,
      message: "BLOCKCHAIN INTEGRITY: VALID"
    };
  }

  reset() {
    this.initialize();
  }
}

export const blockchainService = new BlockchainAuditService();

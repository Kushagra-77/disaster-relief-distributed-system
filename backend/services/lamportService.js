import { broadcastStateUpdate, logMessage } from "./messageService.js";

class LamportClockService {
  constructor() {
    this.clocks = new Map();
    this.lastEvents = new Map();
    this.initialize();
  }

  initialize() {
    this.clocks.clear();
    this.lastEvents.clear();
    const defaultNodes = [
      "node-warehouse-a",
      "node-warehouse-b",
      "node-warehouse-c",
      "node-relief-a",
      "node-relief-b"
    ];

    defaultNodes.forEach((nodeId) => {
      this.clocks.set(nodeId, 0);
      this.lastEvents.set(nodeId, "Node Initialized");
    });
  }

  // Rule 1: Local or Send event: clock = clock + 1
  tick(nodeId, eventDescription = "Local Event") {
    const current = this.clocks.get(nodeId) || 0;
    const next = current + 1;
    this.clocks.set(nodeId, next);
    this.lastEvents.set(nodeId, eventDescription);
    broadcastStateUpdate({ type: "LAMPORT_UPDATE", clocks: this.getAllClocks() });
    return next;
  }

  // Rule 2: Receive event: clock = max(localClock, receivedClock) + 1
  updateOnReceive(nodeId, receivedClock, eventDescription = "Message Received") {
    const current = this.clocks.get(nodeId) || 0;
    const next = Math.max(current, receivedClock || 0) + 1;
    this.clocks.set(nodeId, next);
    this.lastEvents.set(nodeId, eventDescription);
    broadcastStateUpdate({ type: "LAMPORT_UPDATE", clocks: this.getAllClocks() });
    return next;
  }

  getClock(nodeId) {
    return this.clocks.get(nodeId) || 0;
  }

  getLastEvent(nodeId) {
    return this.lastEvents.get(nodeId) || "Idle";
  }

  getAllClocks() {
    const result = [];
    const nodeNames = {
      "node-warehouse-a": "Warehouse A",
      "node-warehouse-b": "Warehouse B",
      "node-warehouse-c": "Warehouse C",
      "node-relief-a": "Relief Center A",
      "node-relief-b": "Relief Center B"
    };

    for (const [nodeId, clock] of this.clocks.entries()) {
      result.push({
        nodeId,
        nodeName: nodeNames[nodeId] || nodeId,
        clock,
        lastEvent: this.lastEvents.get(nodeId) || "Idle"
      });
    }
    return result;
  }

  async runLamportDemo() {
    logMessage({
      type: "LAMPORT",
      sender: "Lamport Engine",
      receiver: "All Nodes",
      action: "=== RUNNING LAMPORT CLOCK DEMONSTRATION ===",
      details: "Step 1: Warehouse A generates local event -> Step 2: Warehouse A sends timestamped message -> Step 3: Warehouse B receives and updates clock via max(local, recv) + 1",
      status: "INFO"
    });

    // Step 1: Warehouse A local event
    const waClock1 = this.tick("node-warehouse-a", "Resource Audit Event");
    logMessage({
      type: "LAMPORT",
      sender: "Warehouse A",
      receiver: "Internal",
      action: "Local Event Triggered",
      details: `Warehouse A clock ticked: ${waClock1 - 1} -> ${waClock1}`,
      status: "SUCCESS",
      metadata: { nodeId: "node-warehouse-a", clock: waClock1 }
    });

    await new Promise((r) => setTimeout(r, 200));

    // Step 2: Warehouse A sends message to Warehouse B
    const waClock2 = this.tick("node-warehouse-a", "Send Inventory Sync to Warehouse B");
    logMessage({
      type: "LAMPORT",
      sender: "Warehouse A",
      receiver: "Warehouse B",
      action: "Message Sent with Timestamp",
      details: `Warehouse A dispatched sync packet (Timestamp = ${waClock2}) to Warehouse B`,
      status: "PENDING",
      metadata: { senderClock: waClock2 }
    });

    await new Promise((r) => setTimeout(r, 250));

    // Step 3: Warehouse B receives message
    const wbClockPrev = this.getClock("node-warehouse-b");
    const wbClockNew = this.updateOnReceive(
      "node-warehouse-b",
      waClock2,
      `Received Sync from Warehouse A (t=${waClock2})`
    );

    logMessage({
      type: "LAMPORT",
      sender: "Warehouse B",
      receiver: "Warehouse A",
      action: "Message Received & Clock Synchronized",
      details: `Warehouse B updated clock: max(${wbClockPrev}, ${waClock2}) + 1 = ${wbClockNew}`,
      status: "SUCCESS",
      metadata: { prevClock: wbClockPrev, receivedClock: waClock2, newClock: wbClockNew }
    });

    return {
      success: true,
      warehouseA: { before: waClock1 - 1, sent: waClock2 },
      warehouseB: { before: wbClockPrev, received: waClock2, updated: wbClockNew }
    };
  }

  reset() {
    this.initialize();
  }
}

export const lamportService = new LamportClockService();

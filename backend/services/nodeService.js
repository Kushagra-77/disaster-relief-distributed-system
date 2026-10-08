import { INITIAL_NODES } from "../data/initialState.js";
import { logMessage, broadcastStateUpdate } from "./messageService.js";

class NodeService {
  constructor() {
    this.nodes = new Map();
    this.networkLinks = new Map(); // key: "nodeA-nodeB", value: "ACTIVE" | "SEVERED"
    this.nodeLocks = new Map(); // key: "nodeId:resource", value: Promise chain for concurrency
    this.initialize();
  }

  initialize() {
    this.nodes.clear();
    this.networkLinks.clear();
    this.nodeLocks.clear();

    INITIAL_NODES.forEach((node) => {
      this.nodes.set(node.id, JSON.parse(JSON.stringify(node)));
    });

    // Initialize all mesh links between nodes as ACTIVE
    const nodeIds = Array.from(this.nodes.keys());
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const linkKey = this._getLinkKey(nodeIds[i], nodeIds[j]);
        this.networkLinks.set(linkKey, "ACTIVE");
      }
    }
  }

  _getLinkKey(idA, idB) {
    return [idA, idB].sort().join("<->");
  }

  // Mutex lock for thread-safe in-memory operations on a node's specific resource
  async acquireLock(nodeId, resource, operationFn) {
    const lockKey = `${nodeId}:${resource}`;
    const previousLock = this.nodeLocks.get(lockKey) || Promise.resolve();

    let releaseLock;
    const currentLock = new Promise((resolve) => {
      releaseLock = resolve;
    });

    this.nodeLocks.set(lockKey, previousLock.then(() => currentLock));

    await previousLock;
    try {
      return await operationFn();
    } finally {
      releaseLock();
    }
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  getNodeName(nodeId) {
    const node = this.nodes.get(nodeId);
    return node ? node.name : nodeId;
  }

  getInventory(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return null;
    return node.inventory;
  }

  getAllInventories() {
    const result = [];
    for (const [nodeId, node] of this.nodes.entries()) {
      for (const [resource, counts] of Object.entries(node.inventory)) {
        result.push({
          nodeId,
          nodeName: node.name,
          nodeType: node.type,
          status: node.status,
          resource,
          available: counts.available,
          reserved: counts.reserved,
          allocated: counts.allocated,
          total: counts.available + counts.reserved + counts.allocated
        });
      }
    }
    return result;
  }

  setNodeStatus(nodeId, status) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    const prevStatus = node.status;
    node.status = status;

    logMessage({
      type: status === "OFFLINE" ? "FAULT" : "RECOVERY",
      sender: node.name,
      receiver: "System Coordinator",
      action: status === "OFFLINE" ? "Node Failed" : "Node Recovered",
      details: `${node.name} is now ${status}`,
      status: status === "OFFLINE" ? "FAILED" : "SUCCESS",
      metadata: { nodeId, status, prevStatus }
    });

    broadcastStateUpdate({ type: "NODE_STATUS_CHANGE", nodeId, status });
    return true;
  }

  setLinkStatus(nodeIdA, nodeIdB, status) {
    const linkKey = this._getLinkKey(nodeIdA, nodeIdB);
    this.networkLinks.set(linkKey, status);
    
    const nameA = this.getNodeName(nodeIdA);
    const nameB = this.getNodeName(nodeIdB);

    logMessage({
      type: status === "SEVERED" ? "FAULT" : "RECOVERY",
      sender: nameA,
      receiver: nameB,
      action: status === "SEVERED" ? "Network Link Severed" : "Network Link Restored",
      details: `Communication channel ${nameA} <-> ${nameB} is ${status}`,
      status: status === "SEVERED" ? "FAILED" : "SUCCESS",
      metadata: { nodeIdA, nodeIdB, status }
    });

    broadcastStateUpdate({ type: "LINK_STATUS_CHANGE", linkKey, status });
    return true;
  }

  getLinkStatus(nodeIdA, nodeIdB) {
    const linkKey = this._getLinkKey(nodeIdA, nodeIdB);
    return this.networkLinks.get(linkKey) || "ACTIVE";
  }

  getAllLinks() {
    const links = [];
    for (const [key, status] of this.networkLinks.entries()) {
      const [source, target] = key.split("<->");
      links.push({
        key,
        source,
        target,
        sourceName: this.getNodeName(source),
        targetName: this.getNodeName(target),
        status
      });
    }
    return links;
  }

  async reserveResource(nodeId, resource, quantity, transactionId = null) {
    return this.acquireLock(nodeId, resource, async () => {
      const node = this.nodes.get(nodeId);
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }
      if (node.status === "OFFLINE") {
        throw new Error(`Node ${node.name} is OFFLINE`);
      }

      const inv = node.inventory[resource];
      if (!inv) {
        throw new Error(`Resource ${resource} does not exist on ${node.name}`);
      }

      if (inv.available < quantity) {
        return {
          success: false,
          nodeId,
          nodeName: node.name,
          resource,
          requested: quantity,
          available: inv.available,
          reserved: 0,
          reason: `Insufficient inventory on ${node.name}. Available: ${inv.available}, Requested: ${quantity}`
        };
      }

      inv.available -= quantity;
      inv.reserved += quantity;

      broadcastStateUpdate({ type: "INVENTORY_CHANGE", nodeId, resource, inventory: inv });

      return {
        success: true,
        nodeId,
        nodeName: node.name,
        resource,
        quantity,
        currentAvailable: inv.available,
        currentReserved: inv.reserved,
        transactionId
      };
    });
  }

  async allocateResource(nodeId, resource, quantity, transactionId = null) {
    return this.acquireLock(nodeId, resource, async () => {
      const node = this.nodes.get(nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);
      if (node.status === "OFFLINE") throw new Error(`Node ${node.name} is OFFLINE`);

      const inv = node.inventory[resource];
      if (!inv) throw new Error(`Resource ${resource} does not exist on ${node.name}`);

      if (inv.reserved < quantity) {
        throw new Error(`Cannot allocate: only ${inv.reserved} units are reserved (requested ${quantity})`);
      }

      inv.reserved -= quantity;
      inv.allocated += quantity;

      broadcastStateUpdate({ type: "INVENTORY_CHANGE", nodeId, resource, inventory: inv });

      return {
        success: true,
        nodeId,
        nodeName: node.name,
        resource,
        allocatedQuantity: quantity,
        currentAvailable: inv.available,
        currentReserved: inv.reserved,
        currentAllocated: inv.allocated,
        transactionId
      };
    });
  }

  async releaseReservation(nodeId, resource, quantity, transactionId = null) {
    return this.acquireLock(nodeId, resource, async () => {
      const node = this.nodes.get(nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      const inv = node.inventory[resource];
      if (!inv) throw new Error(`Resource ${resource} does not exist on ${node.name}`);

      const amountToRelease = Math.min(inv.reserved, quantity);
      inv.reserved -= amountToRelease;
      inv.available += amountToRelease;

      broadcastStateUpdate({ type: "INVENTORY_CHANGE", nodeId, resource, inventory: inv });

      return {
        success: true,
        nodeId,
        nodeName: node.name,
        resource,
        releasedQuantity: amountToRelease,
        currentAvailable: inv.available,
        currentReserved: inv.reserved,
        transactionId
      };
    });
  }

  async receiveResource(nodeId, resource, quantity) {
    return this.acquireLock(nodeId, resource, async () => {
      const node = this.nodes.get(nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      if (!node.inventory[resource]) {
        node.inventory[resource] = { available: 0, reserved: 0, allocated: 0 };
      }

      node.inventory[resource].available += quantity;

      broadcastStateUpdate({ type: "INVENTORY_CHANGE", nodeId, resource, inventory: node.inventory[resource] });

      return {
        success: true,
        nodeId,
        nodeName: node.name,
        resource,
        receivedQuantity: quantity,
        currentAvailable: node.inventory[resource].available
      };
    });
  }

  reset() {
    this.initialize();
    broadcastStateUpdate({ type: "SYSTEM_RESET" });
    return true;
  }
}

export const nodeService = new NodeService();

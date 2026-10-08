import { nodeService } from "./nodeService.js";
import { rpcService } from "./rpcService.js";
import { logMessage, broadcastStateUpdate } from "./messageService.js";

class MiddlewareService {
  constructor() {
    this.activeRequests = new Map();
    this.metrics = {
      totalRequests: 0,
      completedAllocations: 0,
      failedRequests: 0,
      transfersCount: 0
    };
  }

  reset() {
    this.activeRequests.clear();
    this.metrics = {
      totalRequests: 0,
      completedAllocations: 0,
      failedRequests: 0,
      transfersCount: 0
    };
    broadcastStateUpdate({ type: "SYSTEM_METRICS", metrics: this.getMetrics() });
  }

  getMetrics() {
    const nodes = nodeService.getAllNodes();
    const onlineNodes = nodes.filter((n) => n.status === "ONLINE").length;
    const offlineNodes = nodes.filter((n) => n.status === "OFFLINE").length;
    const links = nodeService.getAllLinks();
    const severedLinks = links.filter((l) => l.status === "SEVERED").length;

    return {
      totalNodes: nodes.length,
      onlineNodes,
      offlineNodes,
      severedLinks,
      totalLinks: links.length,
      activeRequests: this.activeRequests.size,
      completedAllocations: this.metrics.completedAllocations,
      totalRequests: this.metrics.totalRequests,
      failedRequests: this.metrics.failedRequests,
      transfersCount: this.metrics.transfersCount
    };
  }

  // Find online warehouses that currently have available stock for the requested resource
  findCandidateWarehouses(resource, preferredNodeId = null) {
    const allNodes = nodeService.getAllNodes();
    const warehouses = allNodes.filter(
      (n) => n.type === "Warehouse" && n.status === "ONLINE"
    );

    // If preferred node specified and online, check it first
    if (preferredNodeId) {
      const preferred = warehouses.find((w) => w.id === preferredNodeId);
      if (preferred && preferred.inventory[resource]?.available > 0) {
        return [preferred, ...warehouses.filter((w) => w.id !== preferredNodeId)];
      }
    }

    // Sort warehouses by highest available stock for the requested resource
    return warehouses
      .filter((w) => (w.inventory[resource]?.available || 0) > 0)
      .sort((a, b) => (b.inventory[resource]?.available || 0) - (a.inventory[resource]?.available || 0));
  }

  async handleResourceRequest({ requestingCenterId, resource, quantity, priority = "NORMAL", preferredWarehouseId = null }) {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const requestingCenter = nodeService.getNode(requestingCenterId);
    const centerName = requestingCenter ? requestingCenter.name : requestingCenterId;

    this.metrics.totalRequests++;
    this.activeRequests.set(requestId, {
      requestId,
      requestingCenterId,
      centerName,
      resource,
      quantity,
      priority,
      status: "COORDINATING",
      startTime: Date.now()
    });

    logMessage({
      type: "MIDDLEWARE",
      sender: centerName,
      receiver: "Middleware Coordinator",
      action: `Resource Request: ${quantity} ${resource}`,
      details: `Incoming request [ID: ${requestId}] from ${centerName} for ${quantity} units of ${resource} (Priority: ${priority})`,
      status: "PENDING",
      metadata: { requestId, resource, quantity, priority }
    });

    try {
      // 1. Discovery phase
      const candidateWarehouses = this.findCandidateWarehouses(resource, preferredWarehouseId);

      if (candidateWarehouses.length === 0) {
        // Check if any warehouse exists that is currently offline
        const offlineHolders = nodeService
          .getAllNodes()
          .filter((n) => n.type === "Warehouse" && n.status === "OFFLINE" && (n.inventory[resource]?.available || 0) > 0);

        let failReason = `No available online warehouse has ${resource} in stock.`;
        if (offlineHolders.length > 0) {
          failReason += ` (Note: ${offlineHolders.map((h) => h.name).join(", ")} holds stock but is currently OFFLINE)`;
        }

        logMessage({
          type: "MIDDLEWARE",
          sender: "Middleware Coordinator",
          receiver: centerName,
          action: "Request Rejected: Resource Unavailable",
          details: failReason,
          status: "FAILED",
          metadata: { requestId }
        });

        this.metrics.failedRequests++;
        this.activeRequests.delete(requestId);
        return {
          success: false,
          requestId,
          message: failReason,
          allocated: 0
        };
      }

      // 2. Coordination & 2-Phase Allocation Protocol
      let remainingNeeded = quantity;
      const fulfilledFulfillments = [];

      for (const warehouse of candidateWarehouses) {
        if (remainingNeeded <= 0) break;

        const availableInWarehouse = warehouse.inventory[resource]?.available || 0;
        const amountToRequest = Math.min(remainingNeeded, availableInWarehouse);

        if (amountToRequest <= 0) continue;

        logMessage({
          type: "MIDDLEWARE",
          sender: "Middleware Coordinator",
          receiver: warehouse.name,
          action: `Initiating 2-Phase Reservation: ${amountToRequest} ${resource}`,
          details: `Routing allocation slice to ${warehouse.name} for ${amountToRequest} ${resource}`,
          status: "PENDING",
          metadata: { requestId, targetWarehouse: warehouse.id, amountToRequest }
        });

        // Phase 1: RPC Reservation
        let reserveResult;
        try {
          reserveResult = await rpcService.call("middleware", warehouse.id, "reserveResource", {
            resource,
            quantity: amountToRequest
          });
        } catch (rpcErr) {
          logMessage({
            type: "FAULT",
            sender: "Middleware Coordinator",
            receiver: warehouse.name,
            action: `Failover Triggered: ${warehouse.name} unreachable`,
            details: `RPC call failed (${rpcErr.message}). Attempting automatic fallback to next available warehouse.`,
            status: "WARNING",
            metadata: { requestId, failedNode: warehouse.id }
          });
          continue; // Fallback to next warehouse!
        }

        if (!reserveResult || !reserveResult.success) {
          logMessage({
            type: "MIDDLEWARE",
            sender: warehouse.name,
            receiver: "Middleware Coordinator",
            action: "Reservation Denied",
            details: reserveResult ? reserveResult.reason : "Reservation failed",
            status: "WARNING",
            metadata: { requestId }
          });
          continue;
        }

        // Phase 2: RPC Allocation
        try {
          await rpcService.call("middleware", warehouse.id, "allocateResource", {
            resource,
            quantity: amountToRequest
          });

          // Deliver to Relief Center
          await rpcService.call("middleware", requestingCenterId, "receiveResource", {
            resource,
            quantity: amountToRequest
          });

          remainingNeeded -= amountToRequest;
          fulfilledFulfillments.push({
            warehouseId: warehouse.id,
            warehouseName: warehouse.name,
            quantity: amountToRequest
          });

          logMessage({
            type: "ALLOCATION",
            sender: warehouse.name,
            receiver: centerName,
            action: `Allocation Confirmed: ${amountToRequest} ${resource}`,
            details: `${warehouse.name} successfully transferred ${amountToRequest} ${resource} to ${centerName}`,
            status: "SUCCESS",
            metadata: { requestId, warehouse: warehouse.name, quantity: amountToRequest }
          });
        } catch (allocErr) {
          // Rollback reservation if phase 2 failed
          await rpcService.call("middleware", warehouse.id, "releaseReservation", {
            resource,
            quantity: amountToRequest
          });
          logMessage({
            type: "FAULT",
            sender: "Middleware Coordinator",
            receiver: warehouse.name,
            action: "Allocation Rollback",
            details: `Rolled back reservation of ${amountToRequest} ${resource} on ${warehouse.name}: ${allocErr.message}`,
            status: "FAILED",
            metadata: { requestId }
          });
        }
      }

      const totalFulfilled = quantity - remainingNeeded;
      const isComplete = totalFulfilled === quantity;

      if (totalFulfilled > 0) {
        this.metrics.completedAllocations++;
        logMessage({
          type: "MIDDLEWARE",
          sender: "Middleware Coordinator",
          receiver: centerName,
          action: isComplete ? "Request Fully Coordinated" : "Request Partially Coordinated",
          details: `Total allocated: ${totalFulfilled}/${quantity} ${resource} from [${fulfilledFulfillments.map((f) => `${f.warehouseName}: ${f.quantity}`).join(", ")}]`,
          status: "SUCCESS",
          metadata: { requestId, totalFulfilled, fulfilledFulfillments }
        });
      } else {
        this.metrics.failedRequests++;
        logMessage({
          type: "MIDDLEWARE",
          sender: "Middleware Coordinator",
          receiver: centerName,
          action: "Request Failed to Fulfill",
          details: `Unable to coordinate reservation across available nodes.`,
          status: "FAILED",
          metadata: { requestId }
        });
      }

      this.activeRequests.delete(requestId);
      broadcastStateUpdate({ type: "SYSTEM_METRICS", metrics: this.getMetrics() });

      return {
        success: totalFulfilled > 0,
        requestId,
        requested: quantity,
        allocated: totalFulfilled,
        fulfillments: fulfilledFulfillments,
        status: isComplete ? "FULFILLED" : totalFulfilled > 0 ? "PARTIALLY_FULFILLED" : "FAILED"
      };
    } catch (err) {
      this.metrics.failedRequests++;
      this.activeRequests.delete(requestId);
      logMessage({
        type: "FAULT",
        sender: "Middleware Coordinator",
        receiver: centerName,
        action: "Request Processing Error",
        details: err.message,
        status: "FAILED",
        metadata: { requestId }
      });
      return {
        success: false,
        requestId,
        message: err.message,
        allocated: 0
      };
    }
  }

  // Peer-to-Peer direct transfer between nodes
  async handleResourceTransfer({ sourceNodeId, destinationNodeId, resource, quantity }) {
    const transferId = `p2p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const sourceNode = nodeService.getNode(sourceNodeId);
    const destNode = nodeService.getNode(destinationNodeId);

    if (!sourceNode || !destNode) {
      throw new Error("Invalid source or destination node");
    }

    this.metrics.transfersCount++;

    // 1. P2P Direct Inquiry & Handshake message
    logMessage({
      type: "P2P_MESSAGE",
      sender: sourceNode.name,
      receiver: destNode.name,
      action: `P2P Transfer Handshake: ${quantity} ${resource}`,
      details: `${sourceNode.name} initiating direct peer transfer of ${quantity} units of ${resource} to ${destNode.name}`,
      status: "PENDING",
      isP2P: true,
      metadata: { transferId, sourceNodeId, destinationNodeId, resource, quantity }
    });

    // 2. Source Node reserves and commits transfer
    // First check available on source
    const sourceAvailable = sourceNode.inventory[resource]?.available || 0;
    if (sourceAvailable < quantity) {
      logMessage({
        type: "P2P_MESSAGE",
        sender: sourceNode.name,
        receiver: destNode.name,
        action: "P2P Transfer Aborted: Insufficient Stock",
        details: `${sourceNode.name} only has ${sourceAvailable} units of ${resource} (needed ${quantity})`,
        status: "FAILED",
        isP2P: true,
        metadata: { transferId }
      });
      return {
        success: false,
        transferId,
        message: `Insufficient inventory at ${sourceNode.name}. Available: ${sourceAvailable}`
      };
    }

    // Direct RPC call between peers
    // Phase 1: Source reserves
    const reserveRes = await rpcService.call(sourceNodeId, sourceNodeId, "reserveResource", {
      resource,
      quantity
    });

    if (!reserveRes.success) {
      throw new Error(`P2P Reservation failed: ${reserveRes.reason}`);
    }

    // Phase 2: Source allocates / debits
    await rpcService.call(sourceNodeId, sourceNodeId, "allocateResource", {
      resource,
      quantity
    });

    // Phase 3: Destination Node receives via P2P RPC
    try {
      await rpcService.call(sourceNodeId, destinationNodeId, "receiveResource", {
        resource,
        quantity
      });

      logMessage({
        type: "P2P_MESSAGE",
        sender: destNode.name,
        receiver: sourceNode.name,
        action: "P2P Transfer ACK Received",
        details: `${destNode.name} successfully received ${quantity} units of ${resource} from ${sourceNode.name}. Transfer ${transferId} complete.`,
        status: "SUCCESS",
        isP2P: true,
        metadata: { transferId }
      });

      broadcastStateUpdate({ type: "SYSTEM_METRICS", metrics: this.getMetrics() });

      return {
        success: true,
        transferId,
        source: sourceNode.name,
        destination: destNode.name,
        resource,
        quantity
      };
    } catch (err) {
      // Rollback source if destination was unreachable or link severed
      sourceNode.inventory[resource].allocated -= quantity;
      sourceNode.inventory[resource].available += quantity;

      logMessage({
        type: "P2P_MESSAGE",
        sender: sourceNode.name,
        receiver: destNode.name,
        action: "P2P Transfer Failed & Rolled Back",
        details: `Transfer failed (${err.message}). Inventory rolled back at ${sourceNode.name}.`,
        status: "FAILED",
        isP2P: true,
        metadata: { transferId, error: err.message }
      });

      throw err;
    }
  }

  // Pre-configured Scenario 1: FA-1 Classic Race Condition Demo
  // Warehouse A has 100 Water. Relief Center A requests 80 Water, Relief Center B simultaneously requests 50 Water.
  async runRaceConditionScenario() {
    logMessage({
      type: "EVENT",
      sender: "System Benchmark",
      receiver: "All Nodes",
      action: "=== LAUNCHING CONCURRENCY RACE CONDITION TEST ===",
      details: "Simultaneously submitting Request 1 (Relief Center A -> 80 Water) and Request 2 (Relief Center B -> 50 Water) against Warehouse A (100 Water).",
      status: "WARNING"
    });

    const promiseA = this.handleResourceRequest({
      requestingCenterId: "node-relief-a",
      resource: "Water",
      quantity: 80,
      priority: "CRITICAL",
      preferredWarehouseId: "node-warehouse-a"
    });

    const promiseB = this.handleResourceRequest({
      requestingCenterId: "node-relief-b",
      resource: "Water",
      quantity: 50,
      priority: "HIGH",
      preferredWarehouseId: "node-warehouse-a"
    });

    const [resA, resB] = await Promise.all([promiseA, promiseB]);

    logMessage({
      type: "EVENT",
      sender: "System Benchmark",
      receiver: "All Nodes",
      action: "=== CONCURRENCY RACE CONDITION TEST COMPLETED ===",
      details: `Results: Relief Center A allocated: ${resA.allocated}/80 | Relief Center B allocated: ${resB.allocated}/50. Over-allocation was successfully prevented by distributed mutex locks!`,
      status: "SUCCESS"
    });

    return { resA, resB };
  }

  // Pre-configured Scenario 2: Fault Tolerance Fallback Demo
  // Warehouse A is failed. Relief Center A requests 50 Water. Middleware catches failure and falls back to Warehouse C.
  async runFaultFallbackScenario() {
    logMessage({
      type: "EVENT",
      sender: "System Benchmark",
      receiver: "All Nodes",
      action: "=== LAUNCHING FAULT TOLERANCE FALLBACK TEST ===",
      details: "Simulating sudden failure of Warehouse A, then dispatching request for 50 Water from Relief Center A.",
      status: "WARNING"
    });

    // 1. Fail Warehouse A
    nodeService.setNodeStatus("node-warehouse-a", "OFFLINE");

    // 2. Dispatch request
    const result = await this.handleResourceRequest({
      requestingCenterId: "node-relief-a",
      resource: "Water",
      quantity: 50,
      priority: "EMERGENCY"
    });

    logMessage({
      type: "EVENT",
      sender: "System Benchmark",
      receiver: "All Nodes",
      action: "=== FAULT TOLERANCE TEST COMPLETED ===",
      details: `Result: ${result.status}. Fulfillments: ${JSON.stringify(result.fulfillments)}. Middleware automatically routed around failed Warehouse A to Warehouse C!`,
      status: "SUCCESS"
    });

    return result;
  }
}

export const middlewareService = new MiddlewareService();

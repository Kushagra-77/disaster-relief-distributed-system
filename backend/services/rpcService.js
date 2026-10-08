import { nodeService } from "./nodeService.js";
import { logMessage } from "./messageService.js";
import { lamportService } from "./lamportService.js";

class RPCService {
  constructor() {
    this.simulatedLatency = 60; // ms
  }

  setLatency(ms) {
    this.simulatedLatency = ms;
  }

  async _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async call(callerId, targetId, method, params = {}) {
    const txId = `rpc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const callerName = callerId === "middleware" ? "Middleware Coordinator" : nodeService.getNodeName(callerId);
    const targetName = nodeService.getNodeName(targetId);

    // Lamport clock update for caller (send event)
    const senderClock = callerId !== "middleware" ? lamportService.tick(callerId, `RPC Send: ${method}`) : 0;

    // 1. Check if caller and target link is severed
    if (callerId !== "middleware" && targetId !== "middleware") {
      const linkStatus = nodeService.getLinkStatus(callerId, targetId);
      if (linkStatus === "SEVERED") {
        logMessage({
          type: "RPC_CALL",
          sender: callerName,
          receiver: targetName,
          action: `RPC ${method}() [FAILED - LINK SEVERED]`,
          details: `Communication channel ${callerName} <-> ${targetName} is severed. RPC dropped.`,
          status: "FAILED",
          rpcDetails: { txId, method, params, error: "ERR_LINK_SEVERED", lamportClock: senderClock },
          isP2P: callerId !== "middleware",
          metadata: { lamportClock: senderClock }
        });
        throw new Error(`RPC Failure: Network link between ${callerName} and ${targetName} is severed`);
      }
    }

    // 2. Check if target node is OFFLINE
    const targetNode = nodeService.getNode(targetId);
    if (!targetNode || targetNode.status === "OFFLINE") {
      logMessage({
        type: "RPC_CALL",
        sender: callerName,
        receiver: targetName || targetId,
        action: `RPC ${method}() [FAILED - NODE OFFLINE]`,
        details: `Remote node ${targetName || targetId} is OFFLINE. RPC call failed.`,
        status: "FAILED",
        rpcDetails: { txId, method, params, error: "ERR_NODE_OFFLINE", lamportClock: senderClock },
        isP2P: callerId !== "middleware",
        metadata: { lamportClock: senderClock }
      });
      throw new Error(`RPC Failure: Node ${targetName || targetId} is unavailable (OFFLINE)`);
    }

    // 3. Log outgoing RPC request
    logMessage({
      type: "RPC_CALL",
      sender: callerName,
      receiver: targetName,
      action: `RPC Call: ${method}()`,
      details: `Invoking remote method ${method} with parameters: ${JSON.stringify(params)}`,
      status: "PENDING",
      rpcDetails: { txId, method, params, lamportClock: senderClock },
      isP2P: callerId !== "middleware",
      metadata: { lamportClock: senderClock }
    });

    // Simulate network transit latency
    if (this.simulatedLatency > 0) {
      await this._delay(this.simulatedLatency);
    }

    // Target node receives RPC (Lamport receive rule: max(local, recv) + 1)
    if (targetId && targetId !== "middleware") {
      lamportService.updateOnReceive(targetId, senderClock, `RPC Execute: ${method}`);
    }

    // 4. Dispatch procedure on target node
    let result;
    try {
      switch (method) {
        case "getInventory":
          result = nodeService.getInventory(targetId);
          break;
        case "reserveResource":
          result = await nodeService.reserveResource(targetId, params.resource, params.quantity, txId);
          break;
        case "allocateResource":
          result = await nodeService.allocateResource(targetId, params.resource, params.quantity, txId);
          break;
        case "releaseReservation":
          result = await nodeService.releaseReservation(targetId, params.resource, params.quantity, txId);
          break;
        case "receiveResource":
          result = await nodeService.receiveResource(targetId, params.resource, params.quantity);
          break;
        case "getNodeStatus":
          result = { id: targetNode.id, name: targetNode.name, status: targetNode.status };
          break;
        default:
          throw new Error(`Unknown RPC method: ${method}`);
      }

      const responseClock = targetId !== "middleware" ? lamportService.getClock(targetId) : 0;

      // Log successful RPC response
      logMessage({
        type: "RPC_RESPONSE",
        sender: targetName,
        receiver: callerName,
        action: `RPC Response: ${method}() [OK]`,
        details: result.success === false
          ? `RPC executed with failure result: ${result.reason}`
          : `Procedure completed successfully. Payload: ${JSON.stringify(result)}`,
        status: result.success === false ? "WARNING" : "SUCCESS",
        rpcDetails: { txId, method, result, lamportClock: responseClock },
        isP2P: callerId !== "middleware",
        metadata: { lamportClock: responseClock }
      });

      return result;
    } catch (err) {
      const errClock = targetId !== "middleware" ? lamportService.getClock(targetId) : 0;
      logMessage({
        type: "RPC_RESPONSE",
        sender: targetName,
        receiver: callerName,
        action: `RPC Response: ${method}() [ERROR]`,
        details: `Procedure execution threw an error: ${err.message}`,
        status: "FAILED",
        rpcDetails: { txId, method, error: err.message, lamportClock: errClock },
        isP2P: callerId !== "middleware",
        metadata: { lamportClock: errClock }
      });
      throw err;
    }
  }
}

export const rpcService = new RPCService();

import { nodeService } from "./nodeService.js";
import { rpcService } from "./rpcService.js";
import { middlewareService } from "./middlewareService.js";
import { clearMessageLog, logMessage, broadcastStateUpdate } from "./messageService.js";

class FaultToleranceService {
  failNode(nodeId) {
    const success = nodeService.setNodeStatus(nodeId, "OFFLINE");
    return { success, nodeId, status: "OFFLINE" };
  }

  recoverNode(nodeId) {
    const success = nodeService.setNodeStatus(nodeId, "ONLINE");
    return { success, nodeId, status: "ONLINE" };
  }

  failLink(nodeIdA, nodeIdB) {
    const success = nodeService.setLinkStatus(nodeIdA, nodeIdB, "SEVERED");
    return { success, nodeIdA, nodeIdB, status: "SEVERED" };
  }

  restoreLink(nodeIdA, nodeIdB) {
    const success = nodeService.setLinkStatus(nodeIdA, nodeIdB, "ACTIVE");
    return { success, nodeIdA, nodeIdB, status: "ACTIVE" };
  }

  setLatency(ms) {
    rpcService.setLatency(ms);
    logMessage({
      type: "EVENT",
      sender: "Network Controller",
      receiver: "All Nodes",
      action: "Network Latency Adjusted",
      details: `Simulated RPC network latency set to ${ms}ms`,
      status: "INFO"
    });
    return { latency: ms };
  }

  resetSystem() {
    nodeService.reset();
    middlewareService.reset();
    clearMessageLog();
    logMessage({
      type: "RECOVERY",
      sender: "System Supervisor",
      receiver: "All Nodes",
      action: "Cluster Reset to Initial Baseline",
      details: "Distributed nodes, inventories, locks, and network links have been restored.",
      status: "SUCCESS"
    });
    return { success: true };
  }
}

export const faultToleranceService = new FaultToleranceService();

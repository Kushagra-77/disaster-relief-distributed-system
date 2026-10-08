import { broadcastStateUpdate, logMessage } from "./messageService.js";
import { lamportService } from "./lamportService.js";

class ElectionService {
  constructor() {
    this.candidates = [
      { id: "node-warehouse-a", name: "Warehouse A", priority: 3 },
      { id: "node-warehouse-b", name: "Warehouse B", priority: 2 },
      { id: "node-warehouse-c", name: "Warehouse C", priority: 1 }
    ];
    this.currentLeader = "node-warehouse-a";
    this.leaderStatus = "ACTIVE"; // ACTIVE, FAILED
    this.electionStatus = "IDLE"; // IDLE, RUNNING, COMPLETED
    this.electionHistory = [];
  }

  getLeaderInfo() {
    const leaderCandidate = this.candidates.find((c) => c.id === this.currentLeader);
    return {
      currentLeader: this.currentLeader,
      leaderName: leaderCandidate ? leaderCandidate.name : this.currentLeader,
      leaderStatus: this.leaderStatus,
      electionStatus: this.electionStatus,
      candidates: this.candidates,
      history: this.electionHistory.slice(0, 10)
    };
  }

  async startElection(nodeServiceRef, reason = "Manual Trigger") {
    this.electionStatus = "RUNNING";
    broadcastStateUpdate({ type: "ELECTION_UPDATE", election: this.getLeaderInfo() });

    const clock1 = lamportService.tick("node-warehouse-b", "Participating in Leader Election");

    logMessage({
      type: "ELECTION",
      sender: "Election Coordinator",
      receiver: "All Warehouses",
      action: `[Leader Election] Election Initiated (${reason})`,
      details: `Starting Bully/Priority Election among active warehouses. Priority: Warehouse A (3) > Warehouse B (2) > Warehouse C (1)`,
      status: "WARNING",
      metadata: { reason, electionStatus: "RUNNING", lamportClock: clock1 }
    });

    await new Promise((r) => setTimeout(r, 300));

    // Discover online warehouses
    const allNodes = nodeServiceRef.getAllNodes();
    const onlineWarehouses = this.candidates.filter((cand) => {
      const node = allNodes.find((n) => n.id === cand.id);
      return node && node.status === "ONLINE";
    });

    // Election algorithm: Highest priority online candidate wins
    onlineWarehouses.sort((a, b) => b.priority - a.priority);

    const winner = onlineWarehouses[0] || null;

    if (winner) {
      this.currentLeader = winner.id;
      this.leaderStatus = "ACTIVE";
      this.electionStatus = "COMPLETED";

      const winnerClock = lamportService.tick(winner.id, `Elected as Cluster Leader`);

      const entry = {
        timestamp: new Date().toISOString(),
        winner: winner.name,
        reason,
        participating: onlineWarehouses.map((w) => w.name)
      };
      this.electionHistory.unshift(entry);

      logMessage({
        type: "ELECTION",
        sender: winner.name,
        receiver: "All Nodes",
        action: `[Leader Election] New Leader Elected: ${winner.name}`,
        details: `${winner.name} won election with highest priority (${winner.priority}). Status: Active Coordinator.`,
        status: "SUCCESS",
        metadata: { leaderId: winner.id, leaderName: winner.name, lamportClock: winnerClock }
      });
    } else {
      this.currentLeader = "None";
      this.leaderStatus = "FAILED";
      this.electionStatus = "COMPLETED";

      logMessage({
        type: "ELECTION",
        sender: "Election Coordinator",
        receiver: "All Nodes",
        action: `[Leader Election] No Leader Available`,
        details: `All warehouses are OFFLINE. Cluster has no active leader coordinator.`,
        status: "FAILED"
      });
    }

    broadcastStateUpdate({ type: "ELECTION_UPDATE", election: this.getLeaderInfo() });
    return this.getLeaderInfo();
  }

  async onNodeStatusChanged(nodeServiceRef, nodeId, status) {
    if (nodeId === this.currentLeader && status === "OFFLINE") {
      this.leaderStatus = "FAILED";
      logMessage({
        type: "ELECTION",
        sender: "Cluster Watchdog",
        receiver: "All Nodes",
        action: `[Leader Election] Leader Failure Detected!`,
        details: `Current Leader [${this.candidates.find((c) => c.id === nodeId)?.name || nodeId}] went OFFLINE. Automatically triggering emergency election.`,
        status: "FAILED"
      });
      broadcastStateUpdate({ type: "ELECTION_UPDATE", election: this.getLeaderInfo() });

      // Trigger automatic election
      await this.startElection(nodeServiceRef, `Leader ${nodeId} Failed`);
    } else if (status === "ONLINE") {
      // If a higher priority node came back online, check if re-election is needed
      const currentWinner = this.candidates.find((c) => c.id === this.currentLeader);
      const recoveredCandidate = this.candidates.find((c) => c.id === nodeId);
      if (recoveredCandidate && (!currentWinner || recoveredCandidate.priority > currentWinner.priority)) {
        await this.startElection(nodeServiceRef, `Higher Priority Node ${recoveredCandidate.name} Recovered`);
      }
    }
  }

  reset() {
    this.currentLeader = "node-warehouse-a";
    this.leaderStatus = "ACTIVE";
    this.electionStatus = "IDLE";
    this.electionHistory = [];
  }
}

export const electionService = new ElectionService();

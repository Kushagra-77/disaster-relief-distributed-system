import React, { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

import Navbar from "./components/Navbar.jsx";
import SystemStats from "./components/SystemStats.jsx";
import ScenarioPresets from "./components/ScenarioPresets.jsx";
import FA2Dashboard from "./components/FA2Dashboard.jsx";
import NodeCard from "./components/NodeCard.jsx";
import InventoryTable from "./components/InventoryTable.jsx";
import RequestForm from "./components/RequestForm.jsx";
import TransferForm from "./components/TransferForm.jsx";
import MessageLog from "./components/MessageLog.jsx";
import FaultControl from "./components/FaultControl.jsx";
import NetworkTopology from "./components/NetworkTopology.jsx";

const API_BASE = "";

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [links, setLinks] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [messages, setMessages] = useState([]);
  const [latency, setLatency] = useState(60);
  const [resetting, setResetting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // FA-2 States
  const [lamportClocks, setLamportClocks] = useState([]);
  const [mutexLocks, setMutexLocks] = useState([]);
  const [electionInfo, setElectionInfo] = useState(null);
  const [blockchain, setBlockchain] = useState({ blocks: [], totalBlocks: 0 });
  const [verificationResult, setVerificationResult] = useState(null);

  // Fetch full cluster state from backend
  const fetchClusterState = useCallback(async () => {
    try {
      const [nodesRes, invRes, linksRes, metricsRes, msgRes, fa2Res] = await Promise.all([
        fetch(`${API_BASE}/api/nodes`).then((r) => r.json()),
        fetch(`${API_BASE}/api/inventory`).then((r) => r.json()),
        fetch(`${API_BASE}/api/links`).then((r) => r.json()),
        fetch(`${API_BASE}/api/metrics`).then((r) => r.json()),
        fetch(`${API_BASE}/api/messages?limit=150`).then((r) => r.json()),
        fetch(`${API_BASE}/api/fa2/status`).then((r) => r.json())
      ]);

      if (nodesRes && nodesRes.success) setNodes(nodesRes.nodes);
      if (invRes && invRes.success) setInventories(invRes.inventory);
      if (linksRes && linksRes.success) setLinks(linksRes.links);
      if (metricsRes && metricsRes.success) setMetrics(metricsRes.metrics);
      if (msgRes && msgRes.success) setMessages(msgRes.messages);

      if (fa2Res && fa2Res.success) {
        setLamportClocks(fa2Res.lamport || []);
        setMutexLocks(fa2Res.mutex || []);
        setElectionInfo(fa2Res.election || null);
        setBlockchain(fa2Res.blockchain || { blocks: [], totalBlocks: 0 });
      }
    } catch (err) {
      console.error("Error fetching cluster state:", err);
    }
  }, []);

  // WebSocket subscriptions
  useEffect(() => {
    fetchClusterState();

    const socket = io({
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("message:new", (newMsg) => {
      setMessages((prev) => [newMsg, ...prev.slice(0, 199)]);
      fetchClusterState();
    });

    socket.on("message:cleared", () => {
      setMessages([]);
    });

    socket.on("system:state_update", () => {
      fetchClusterState();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchClusterState]);

  // Actions
  const handleToggleNode = async (nodeId, status) => {
    try {
      await fetch(`${API_BASE}/api/nodes/${nodeId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchClusterState();
    } catch (err) {
      console.error("Error toggling node status:", err);
    }
  };

  const handleToggleLink = async (nodeIdA, nodeIdB, status) => {
    try {
      await fetch(`${API_BASE}/api/links/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeIdA, nodeIdB, status })
      });
      fetchClusterState();
    } catch (err) {
      console.error("Error toggling link status:", err);
    }
  };

  const handleRequestSubmit = async (payload) => {
    setIsSubmittingRequest(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      fetchClusterState();
      return data;
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleTransferSubmit = async (payload) => {
    setIsSubmittingTransfer(true);
    try {
      const res = await fetch(`${API_BASE}/api/transfers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      fetchClusterState();
      return data;
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // FA-1 Demo actions
  const handleRunRaceScenario = async () => {
    const res = await fetch(`${API_BASE}/api/scenarios/race-condition`, { method: "POST" });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleRunFaultScenario = async () => {
    const res = await fetch(`${API_BASE}/api/scenarios/fault-fallback`, { method: "POST" });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleRunP2PTransfer = async () => {
    return handleTransferSubmit({
      sourceNodeId: "node-warehouse-b",
      destinationNodeId: "node-warehouse-c",
      resource: "Medicines",
      quantity: 10
    });
  };

  // FA-2 Demo Actions
  const handleRunLamportDemo = async () => {
    const res = await fetch(`${API_BASE}/api/fa2/lamport/demo`, { method: "POST" });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleRunMutexDemo = async () => {
    const res = await fetch(`${API_BASE}/api/fa2/mutex/demo`, { method: "POST" });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleRunElection = async () => {
    const res = await fetch(`${API_BASE}/api/fa2/election/run`, { method: "POST" });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleVerifyBlockchain = async () => {
    const res = await fetch(`${API_BASE}/api/fa2/blockchain/verify`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setVerificationResult(data.verification);
    }
    fetchClusterState();
    return data;
  };

  const handleCreateBlock = async (payload) => {
    const res = await fetch(`${API_BASE}/api/fa2/blockchain/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleTamperBlock = async () => {
    const res = await fetch(`${API_BASE}/api/fa2/blockchain/tamper`, { method: "POST" });
    const data = await res.json();
    fetchClusterState();
    return data;
  };

  const handleReset = async () => {
    setResetting(true);
    setMessages([]);
    setVerificationResult(null);
    setResetKey((prev) => prev + 1);
    try {
      await fetch(`${API_BASE}/api/system/reset`, { method: "POST" });
      await fetchClusterState();
    } catch (err) {
      console.error("Error resetting cluster:", err);
    } finally {
      setResetting(false);
    }
  };

  const handleClearLog = async () => {
    setMessages([]);
    try {
      await fetch(`${API_BASE}/api/messages`, { method: "DELETE" });
      await fetchClusterState();
    } catch (err) {
      console.error("Error clearing log:", err);
    }
  };

  const handleLatencyChange = async (ms) => {
    setLatency(ms);
    await fetch(`${API_BASE}/api/system/latency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latency: ms })
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        isConnected={isConnected}
        onReset={handleReset}
        latency={latency}
        onLatencyChange={handleLatencyChange}
        resetting={resetting}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Strip */}
        <SystemStats metrics={metrics} />

        {/* 1-Click Evaluation Demonstration Hub */}
        <ScenarioPresets
          onRunRaceScenario={handleRunRaceScenario}
          onRunFaultScenario={handleRunFaultScenario}
          onRunP2PTransfer={handleRunP2PTransfer}
          onRunLamportDemo={handleRunLamportDemo}
          onRunMutexDemo={handleRunMutexDemo}
          onRunElection={handleRunElection}
          onVerifyBlockchain={handleVerifyBlockchain}
          onReset={handleReset}
        />

        {/* FA-2 Distributed Systems 4-Card Section */}
        <FA2Dashboard
          lamportClocks={lamportClocks}
          mutexLocks={mutexLocks}
          electionInfo={electionInfo}
          blockchain={blockchain}
          onRunLamportDemo={handleRunLamportDemo}
          onRunMutexDemo={handleRunMutexDemo}
          onRunElection={handleRunElection}
          onVerifyBlockchain={handleVerifyBlockchain}
          onCreateBlock={handleCreateBlock}
          onTamperBlock={handleTamperBlock}
          verificationResult={verificationResult}
        />

        {/* Section 1: Distributed Node Dashboard */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Distributed Node Cluster (5 Nodes)
              </h2>
              <p className="text-xs text-slate-400">
                Independent in-memory local state per warehouse depot and field relief center.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              In-Memory Node Objects
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                onToggleStatus={handleToggleNode}
              />
            ))}
          </div>
        </div>

        {/* Section 2: Operations & Real-Time Communication Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Requests, Transfers, Topology Map */}
          <div className="lg:col-span-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RequestForm
                key={`req-${resetKey}`}
                nodes={nodes}
                onRequestSubmit={handleRequestSubmit}
                isSubmitting={isSubmittingRequest}
              />
              <TransferForm
                key={`trans-${resetKey}`}
                nodes={nodes}
                onTransferSubmit={handleTransferSubmit}
                isSubmitting={isSubmittingTransfer}
              />
            </div>

            {/* Network Topology Visualizer */}
            <NetworkTopology
              nodes={nodes}
              links={links}
              onToggleNode={handleToggleNode}
            />
          </div>

          {/* Right Column: Live Message & RPC Stream */}
          <div className="lg:col-span-6">
            <MessageLog
              messages={messages}
              onClearLog={handleClearLog}
            />
          </div>
        </div>

        {/* Section 3: Inventory Master Table */}
        <InventoryTable inventories={inventories} />

        {/* Section 4: Fault Tolerance & Link Severing Control Center */}
        <FaultControl
          nodes={nodes}
          links={links}
          onToggleNode={handleToggleNode}
          onToggleLink={handleToggleLink}
          onReset={handleReset}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Distributed Disaster Relief Inventory Coordination System • FA-1 + FA-2 Distributed Systems</span>
          <span className="font-mono text-[11px] text-cyan-400">
            Node.js (In-Memory) + React + WebSockets (Socket.IO) + Lamport + Mutex + Election + Blockchain
          </span>
        </div>
      </footer>
    </div>
  );
}

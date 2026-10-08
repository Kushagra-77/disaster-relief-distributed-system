# Distributed Disaster Relief Inventory Coordination System 🚨📦

A web-based, fault-tolerant **Distributed Systems Project (FA-1 + FA-2)** demonstrating real-time decentralized coordination, Remote Procedure Calls (RPC), Message-Oriented & Peer-to-Peer (P2P) event streams, Lamport Logical Clocks, Distributed Mutual Exclusion, Deterministic Leader Election, and Blockchain-Based Resource Auditing across simulated disaster relief warehouses and field camps.

---

## 🏛️ System Architecture

```
Frontend Dashboard (React 18 + Tailwind CSS + Lucide Icons)
       ▲
       │  (WebSockets / Socket.IO & REST)
       ▼
Backend Coordinator Server (Node.js / Express)
 ├── Lamport Logical Clock Engine
 ├── Distributed Mutual Exclusion (Resource Locks)
 ├── Deterministic Leader Election (Warehouse Priority)
 ├── Cryptographic Blockchain Audit Ledger (SHA-256)
 ├── RPC Dispatcher & Latency Simulator
 └── Message-Oriented & P2P Event Bus
       ▲
       │  (In-Memory Local State & Mutex)
       ▼
Simulated In-Memory Distributed Nodes
 ├── Warehouse A (Water: 100, Food: 50 | Priority 3 | Leader)
 ├── Warehouse B (Medicines: 30, Food: 20 | Priority 2)
 ├── Warehouse C (Water: 70, Equipment: 15 | Priority 1)
 ├── Relief Center A (District 4 Field Camp)
 └── Relief Center B (Coastal Sector Clinic)
```

---

## 🌟 Distributed Systems Concepts Implemented

### FA-1 Concepts:
1. **Distributed Autonomous Nodes**: Independent in-memory state for each warehouse and relief camp (No centralized database).
2. **Middleware Layer**: Coordinates node discovery, multi-node allocation slicing, 2-phase reservation (`reserveResource` $\rightarrow$ `allocateResource`), and transaction rollback.
3. **Remote Procedure Calls (RPC)**: Standardized RPC dispatcher simulating network transit latency and error boundaries (`RPC_NODE_OFFLINE`, `RPC_LINK_SEVERED`).
4. **Message-Oriented & P2P Event Bus**: Real-time packet activity log streaming all node-to-node and middleware communication via Socket.IO.
5. **Peer-to-Peer (P2P) Transfers**: Direct inter-node resource negotiation and atomic debit/credit without central inventory storage.
6. **Fault Tolerance & Dynamic Fallback**: Interactive node crash/recovery and mesh link severing with automatic failover routing around offline nodes.

### FA-2 Extensions:
1. **Lamport Logical Clocks**:
   - Each node maintains a logical clock $L(e)$.
   - Local / Send Event: $L = L + 1$.
   - Receive Event: $L = \max(L_{\text{local}}, L_{\text{received}}) + 1$.
   - All messages and RPC calls carry Lamport timestamps.
2. **Distributed Mutual Exclusion**:
   - Critical section resource locks (e.g. `Warehouse A:Water`).
   - Prevents simultaneous write conflicts and race conditions.
   - States: `AVAILABLE`, `LOCKED`, `WAITING` queue.
3. **Leader Election**:
   - Deterministic Bully/Priority algorithm among warehouses: `Warehouse A (3) > Warehouse B (2) > Warehouse C (1)`.
   - Automatically detects current leader failure and elects highest-priority active node as new cluster coordinator.
4. **Blockchain-Based Resource Audit Ledger**:
   - Immutable SHA-256 in-memory ledger recording all critical events (`RESOURCE_RESERVED`, `RESOURCE_ALLOCATED`, `RESOURCE_TRANSFERRED`, `NODE_FAILED`, `LEADER_ELECTED`).
   - One-click blockchain cryptographic integrity verification (`verifyChain()`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### Running the Application

```bash
# 1. Navigate to backend
cd backend

# 2. Start server
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🎯 Demonstration Guide (For Presentation / Professor Evaluation)

### FA-2 Demonstrations:
- **Demo 1: Lamport Clocks**: Click **"Run Lamport Clock Demo"** $\rightarrow$ Warehouse A ticks locally, sends timestamped message to Warehouse B, Warehouse B synchronizes via $\max(L_{\text{local}}, L_{\text{recv}}) + 1$.
- **Demo 2: Mutual Exclusion**: Click **"Run Mutual Exclusion Demo"** $\rightarrow$ Relief Center A requests 80 Water and gets lock, Relief Center B requests 50 Water and waits in queue; lock releases and Center B safely finishes with zero over-allocation.
- **Demo 3: Leader Election**: Click **"Run Leader Election"** (or click "Simulate Crash" on Warehouse A) $\rightarrow$ Failure detected, election runs, Warehouse B elected as leader.
- **Demo 4: Blockchain Audit**: Perform any transfer or click **"Create Audit Block"**, then click **"Verify Blockchain"** $\rightarrow$ Recalculates SHA-256 hashes and confirms `BLOCKCHAIN INTEGRITY: VALID`.

### FA-1 Demonstrations:
- **Race Condition Demo**: Simultaneous 80 + 50 Water on 100 stock.
- **Fault Fallback Demo**: Warehouse A fails $\rightarrow$ Auto-routes to Warehouse C.
- **P2P Transfer Demo**: Warehouse B transfers 10 Medicines directly to Warehouse C.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, CORS, Node Crypto (SHA-256)
- **Storage**: Strictly In-Memory Data Structures (No Database)

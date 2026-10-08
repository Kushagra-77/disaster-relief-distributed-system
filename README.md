# Distributed Disaster Relief Inventory Coordination System 🚨📦

A web-based, fault-tolerant **Distributed Systems Project (FA-1)** demonstrating real-time decentralized coordination, Remote Procedure Calls (RPC), Message-Oriented & Peer-to-Peer (P2P) event streams, distributed concurrency locking, and dynamic failover routing across simulated disaster relief warehouses and field camps.

---

## 🏛️ System Architecture

```
Frontend (React + Tailwind CSS)
       ▲
       │  (WebSockets / Socket.IO & REST)
       ▼
Backend Coordinator Server (Node.js / Express)
       ▲
       │  (RPC Service Layer & Event Bus)
       ▼
Simulated In-Memory Distributed Nodes
 ├── Warehouse A (Water: 100, Food: 50)
 ├── Warehouse B (Medicines: 30, Food: 20)
 ├── Warehouse C (Water: 70, Equipment: 15)
 ├── Relief Center A (Field Camp Node)
 └── Relief Center B (Clinic Node)
```

---

## 🌟 Distributed Systems Concepts Implemented (FA-1)

1. **Distributed Autonomous Nodes**: Independent in-memory state for each warehouse and relief camp (No centralized database).
2. **Middleware Layer**: Coordinates node discovery, multi-node allocation slicing, 2-phase reservation (`reserveResource` $\rightarrow$ `allocateResource`), and transaction rollback.
3. **Remote Procedure Calls (RPC)**: Standardized RPC dispatcher simulating network transit latency and error boundaries (`RPC_NODE_OFFLINE`, `RPC_LINK_SEVERED`).
4. **Message-Oriented & P2P Event Bus**: Real-time packet activity log streaming all node-to-node and middleware communication via Socket.IO.
5. **Peer-to-Peer (P2P) Transfers**: Direct inter-node resource negotiation and atomic debit/credit without central inventory storage.
6. **Concurrency Race Prevention**: Distributed resource-level mutex locks preventing over-allocation during simultaneous resource requests (e.g. 80 + 50 Water on 100 stock).
7. **Fault Tolerance & Dynamic Fallback**: Interactive node crash/recovery and mesh link severing with automatic failover routing around offline nodes.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation & Running

#### Option 1: Quick Unified Mode (Recommended)
The backend serves both the API and the pre-built React frontend:

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Start server
npm start
```
Open **`http://localhost:5000`** in your browser.

#### Option 2: Development Mode (Hot Reloading)

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🎯 1-Click Demonstration Scenarios

- **Scenario 1 (Concurrency Race Condition)**: Simultaneous requests for 80 and 50 Water from Relief Centers against Warehouse A (100 stock) $\rightarrow$ Demonstrates mutex lock & partial allocation from Warehouse C.
- **Scenario 2 (Fault Tolerance & Failover)**: Crashes Warehouse A and submits a request for 50 Water $\rightarrow$ Demonstrates automatic routing to Warehouse C.
- **Scenario 3 (P2P Inter-Warehouse Transfer)**: Warehouse B transfers 10 Medicines directly to Warehouse C $\rightarrow$ Demonstrates P2P messaging and debit/credit.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, CORS
- **Storage**: Strictly In-Memory Data Structures (No Database)

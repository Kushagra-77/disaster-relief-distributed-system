import React from "react";
import { Network, Server, Warehouse, Tent, Wifi, WifiOff } from "lucide-react";

export default function NetworkTopology({ nodes, links, onToggleNode }) {
  // Coordinated positions for a 5-node topology in SVG coordinates (width: 600, height: 260)
  const nodePositions = {
    "node-warehouse-a": { x: 120, y: 60, type: "Warehouse" },
    "node-warehouse-b": { x: 300, y: 40, type: "Warehouse" },
    "node-warehouse-c": { x: 480, y: 60, type: "Warehouse" },
    "node-relief-a": { x: 180, y: 195, type: "ReliefCenter" },
    "node-relief-b": { x: 420, y: 195, type: "ReliefCenter" }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Distributed Mesh Network Topology</h3>
            <p className="text-[11px] text-slate-400">
              Interactive physical topology map with live link states and node health.
            </p>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-[240px] mt-2 flex items-center justify-center">
        <svg viewBox="0 0 600 240" className="w-full h-full">
          <defs>
            <linearGradient id="activeLinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.6" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="600" height="240" fill="url(#gridPattern)" />

          {/* Render Communication Links */}
          {links &&
            links.map((link) => {
              const posA = nodePositions[link.source];
              const posB = nodePositions[link.target];
              if (!posA || !posB) return null;

              const isSevered = link.status === "SEVERED";

              return (
                <g key={link.key}>
                  <line
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    stroke={isSevered ? "#f43f5e" : "#0284c7"}
                    strokeWidth={isSevered ? "1.5" : "1.8"}
                    strokeDasharray={isSevered ? "4,4" : "none"}
                    opacity={isSevered ? 0.7 : 0.45}
                  />
                </g>
              );
            })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isOnline = node.status === "ONLINE";
            const isWarehouse = node.type === "Warehouse";

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onClick={() => onToggleNode(node.id, isOnline ? "OFFLINE" : "ONLINE")}
              >
                {/* Node outer glow */}
                <circle
                  r="24"
                  fill={isOnline ? (isWarehouse ? "#0284c7" : "#059669") : "#e11d48"}
                  fillOpacity={isOnline ? "0.15" : "0.25"}
                  stroke={isOnline ? (isWarehouse ? "#38bdf8" : "#34d399") : "#f43f5e"}
                  strokeWidth="1.5"
                  className={isOnline ? "" : "animate-ping-slow"}
                />

                {/* Node Center Badge */}
                <circle
                  r="16"
                  fill={isOnline ? "#0f172a" : "#4c0519"}
                  stroke={isOnline ? (isWarehouse ? "#0ea5e9" : "#10b981") : "#f43f5e"}
                  strokeWidth="2"
                />

                {/* Node icon label */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#f8fafc"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {isWarehouse ? "W" : "RC"}
                </text>

                {/* Node Name */}
                <text
                  textAnchor="middle"
                  dy="36"
                  fill={isOnline ? "#cbd5e1" : "#fda4af"}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {node.name}
                </text>

                {/* Status Dot */}
                <circle
                  cx="12"
                  cy="-12"
                  r="4"
                  fill={isOnline ? "#10b981" : "#f43f5e"}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Warehouse
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Relief Center
          </span>
        </div>
        <span className="text-[10px] text-slate-400 italic">
          Click any node icon on map to toggle failure
        </span>
      </div>
    </div>
  );
}

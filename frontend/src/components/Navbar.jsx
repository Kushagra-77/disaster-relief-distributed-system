import React from "react";
import { Activity, RefreshCw, ShieldAlert, Wifi, WifiOff, Clock } from "lucide-react";

export default function Navbar({ isConnected, onReset, latency, onLatencyChange, resetting }) {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title & Branding */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Distributed Disaster Relief System
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                FA-1 + FA-2 Project
              </span>
            </div>
            <p className="text-xs text-slate-400">
              In-Memory Nodes • RPC • P2P Bus • Lamport Clocks • Mutex • Leader Election • Blockchain Audit
            </p>
          </div>
        </div>

        {/* Action Controls & Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Latency Simulator */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">RPC Delay:</span>
            <select
              value={latency}
              onChange={(e) => onLatencyChange(Number(e.target.value))}
              className="bg-slate-900 text-cyan-300 text-xs rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value={0}>0ms (Instant)</option>
              <option value={60}>60ms (Normal)</option>
              <option value={150}>150ms (Medium)</option>
              <option value={300}>300ms (High)</option>
            </select>
          </div>

          {/* Connection Status */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            isConnected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 animate-pulse" />}
            <span>{isConnected ? "Cluster Connected" : "Connecting..."}</span>
          </div>

          {/* Reset Cluster State */}
          <button
            onClick={onReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
            title="Reset in-memory nodes, inventories, FA-2 state, and logs to baseline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin text-cyan-400" : ""}`} />
            <span>Reset Cluster</span>
          </button>
        </div>
      </div>
    </header>
  );
}

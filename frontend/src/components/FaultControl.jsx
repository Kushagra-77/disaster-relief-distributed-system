import React from "react";
import { ShieldAlert, Power, Wifi, WifiOff, RefreshCw, Unplug } from "lucide-react";

export default function FaultControl({ nodes, links, onToggleNode, onToggleLink, onReset }) {
  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Fault Injection & Network Partitioning</h3>
            <p className="text-[11px] text-slate-400">
              Simulate distributed node crashes and communication link failures.
            </p>
          </div>
        </div>
      </div>

      {/* Node Status Controls */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Node Crash Simulator
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {nodes.map((node) => {
            const isOnline = node.status === "ONLINE";
            return (
              <button
                key={node.id}
                onClick={() => onToggleNode(node.id, isOnline ? "OFFLINE" : "ONLINE")}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col justify-between items-start gap-2 ${
                  isOnline
                    ? "bg-slate-950 border-slate-800 hover:border-rose-500/50 text-slate-200"
                    : "bg-rose-950/40 border-rose-800 text-rose-300 animate-pulse"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold">{node.name}</span>
                  {isOnline ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Power className="w-3 h-3 text-slate-400" />
                  <span>{isOnline ? "Simulate Crash" : "Recover Node"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Network Links Simulator */}
      {links && links.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Mesh Communication Channels ({links.length} links)</span>
            <span className="text-[10px] text-slate-400 font-normal">Click to sever / restore peer link</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {links.map((link) => {
              const isActive = link.status === "ACTIVE";
              return (
                <button
                  key={link.key}
                  onClick={() => onToggleLink(link.source, link.target, isActive ? "SEVERED" : "ACTIVE")}
                  className={`p-2 rounded-lg border text-[11px] font-medium transition flex items-center justify-between ${
                    isActive
                      ? "bg-slate-950/60 border-slate-800 hover:border-amber-500/40 text-slate-300"
                      : "bg-rose-950/30 border-rose-800 text-rose-300"
                  }`}
                  title={`${link.sourceName} <-> ${link.targetName} (${link.status})`}
                >
                  <span className="truncate mr-1">
                    {link.sourceName.replace("Warehouse ", "W-").replace("Relief Center ", "RC-")} ↔ {link.targetName.replace("Warehouse ", "W-").replace("Relief Center ", "RC-")}
                  </span>
                  {isActive ? (
                    <Wifi className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Unplug className="w-3 h-3 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

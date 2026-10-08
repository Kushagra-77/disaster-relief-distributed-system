import React from "react";
import { Warehouse, Tent, Wifi, WifiOff, Power, ShieldAlert, Package, CheckCircle2, Lock } from "lucide-react";

export default function NodeCard({ node, onToggleStatus }) {
  const isWarehouse = node.type === "Warehouse";
  const isOnline = node.status === "ONLINE";

  const getResourceColor = (resource) => {
    switch (resource) {
      case "Water":
        return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
      case "Food":
        return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "Medicines":
        return "text-rose-400 border-rose-500/30 bg-rose-500/10";
      case "EmergencyEquipment":
        return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      default:
        return "text-slate-400 border-slate-700 bg-slate-800";
    }
  };

  const formatResourceName = (name) => {
    return name === "EmergencyEquipment" ? "Equipment" : name;
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 relative flex flex-col justify-between ${
        isOnline
          ? isWarehouse
            ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20"
            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20"
          : "bg-rose-950/20 border-rose-900/60 opacity-85"
      }`}
    >
      {/* Top Bar: Icon, Name, Type, Status */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2.5 rounded-xl border ${
                isOnline
                  ? isWarehouse
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {isWarehouse ? <Warehouse className="w-5 h-5" /> : <Tent className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{node.name}</h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isWarehouse
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                      : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  {node.type === "Warehouse" ? "Depot" : "Relief Camp"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{node.location}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-rose-400" />
                <span>OFFLINE</span>
              </>
            )}
          </div>
        </div>

        {/* Inventory Summary List */}
        <div className="space-y-2 my-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-1">
            <span>Local Inventory</span>
            <span className="font-mono text-[10px] text-slate-400">Avail / Rsvd / Alloc</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(node.inventory).map(([resource, counts]) => {
              const total = counts.available + counts.reserved + counts.allocated;
              const hasStock = total > 0;
              return (
                <div
                  key={resource}
                  className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                    hasStock
                      ? getResourceColor(resource)
                      : "bg-slate-900/40 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{formatResourceName(resource)}</span>
                    <span className="font-mono text-sm font-bold">{counts.available}</span>
                  </div>
                  <div className="text-[10px] flex items-center justify-between mt-1 text-slate-400 font-mono">
                    <span title="Available for allocation">A: {counts.available}</span>
                    <span title="Currently reserved by active transaction" className={counts.reserved > 0 ? "text-amber-300 font-bold" : ""}>
                      R: {counts.reserved}
                    </span>
                    <span title="Dispatched / Delivered" className={counts.allocated > 0 ? "text-emerald-300 font-bold" : ""}>
                      D: {counts.allocated}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fault Injection Button */}
      <div className="pt-2 border-t border-slate-800/80 mt-2">
        <button
          onClick={() => onToggleStatus(node.id, isOnline ? "OFFLINE" : "ONLINE")}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition border ${
            isOnline
              ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
              : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? "Simulate Node Failure" : "Recover Node Online"}</span>
        </button>
      </div>
    </div>
  );
}

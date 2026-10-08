import React from "react";
import { Server, CheckCircle2, XCircle, ArrowLeftRight, Activity, Zap, ShieldAlert } from "lucide-react";

export default function SystemStats({ metrics }) {
  const statItems = [
    {
      label: "Total Nodes",
      value: metrics.totalNodes || 5,
      icon: Server,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      subtext: `${metrics.onlineNodes || 5} Online / ${metrics.offlineNodes || 0} Offline`
    },
    {
      label: "Online Status",
      value: `${metrics.onlineNodes || 5}/${metrics.totalNodes || 5}`,
      icon: CheckCircle2,
      color: (metrics.offlineNodes || 0) > 0 ? "text-amber-400" : "text-emerald-400",
      bg: (metrics.offlineNodes || 0) > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20",
      subtext: (metrics.offlineNodes || 0) > 0 ? `${metrics.offlineNodes} Node(s) Failing` : "All Nodes Healthy"
    },
    {
      label: "Coordinated Allocations",
      value: metrics.completedAllocations || 0,
      icon: Zap,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      subtext: `${metrics.totalRequests || 0} Total Requests Handled`
    },
    {
      label: "P2P Transfers",
      value: metrics.transfersCount || 0,
      icon: ArrowLeftRight,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      subtext: "Direct Peer Transfers"
    },
    {
      label: "Severed Mesh Links",
      value: metrics.severedLinks || 0,
      icon: ShieldAlert,
      color: (metrics.severedLinks || 0) > 0 ? "text-rose-400" : "text-slate-400",
      bg: (metrics.severedLinks || 0) > 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-800/40 border-slate-700/40",
      subtext: `${metrics.totalLinks || 10} Total Communication Links`
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border ${item.bg} backdrop-blur-sm flex flex-col justify-between transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="mt-2">
              <div className={`text-2xl font-black ${item.color} font-mono tracking-tight`}>
                {item.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-medium truncate">
                {item.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

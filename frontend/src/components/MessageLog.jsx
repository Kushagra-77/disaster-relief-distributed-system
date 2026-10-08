import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ArrowRight, Trash2, Filter, Radio, ChevronDown, ChevronRight, Activity, Zap, ShieldAlert, Cpu, Clock, Lock, Crown, Link } from "lucide-react";

export default function MessageLog({ messages, onClearLog }) {
  const [filterType, setFilterType] = useState("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [messages, autoScroll]);

  const filteredMessages = messages.filter((msg) => {
    if (filterType === "ALL") return true;
    if (filterType === "FA-2") {
      return ["MUTEX", "ELECTION", "BLOCKCHAIN", "LAMPORT"].includes(msg.type);
    }
    if (filterType === "MUTEX") return msg.type === "MUTEX";
    if (filterType === "ELECTION") return msg.type === "ELECTION";
    if (filterType === "BLOCKCHAIN") return msg.type === "BLOCKCHAIN";
    if (filterType === "LAMPORT") return msg.type === "LAMPORT";
    if (filterType === "P2P") return msg.isP2P || msg.type === "P2P_MESSAGE";
    if (filterType === "RPC") return msg.type.startsWith("RPC");
    if (filterType === "FAULT") return msg.type === "FAULT" || msg.status === "FAILED";
    return true;
  });

  const getBadgeStyle = (msg) => {
    if (msg.type === "LAMPORT") {
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
    if (msg.type === "MUTEX") {
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    }
    if (msg.type === "ELECTION") {
      return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    }
    if (msg.type === "BLOCKCHAIN") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    if (msg.isP2P || msg.type === "P2P_MESSAGE") {
      return "bg-purple-500/20 text-purple-300 border-purple-500/40";
    }
    if (msg.type === "RPC_CALL") {
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
    if (msg.type === "RPC_RESPONSE") {
      return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    }
    if (msg.type === "FAULT" || msg.status === "FAILED") {
      return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
    if (msg.type === "RECOVERY" || msg.type === "ALLOCATION") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    return "bg-slate-700/50 text-slate-300 border-slate-600";
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Distributed Communication Bus</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                {filteredMessages.length} events
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time FA-1 + FA-2 event stream with Lamport timestamps.
            </p>
          </div>
        </div>

        {/* Clear Log Button */}
        <button
          onClick={onClearLog}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 rounded-lg transition border border-slate-700 self-start sm:self-auto"
          title="Clear Message Log"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium my-2.5 overflow-x-auto">
        {[
          { id: "ALL", label: "All Events" },
          { id: "FA-2", label: "✨ FA-2 Only" },
          { id: "LAMPORT", label: "Lamport" },
          { id: "MUTEX", label: "Mutex" },
          { id: "ELECTION", label: "Election" },
          { id: "BLOCKCHAIN", label: "Blockchain" },
          { id: "P2P", label: "P2P" },
          { id: "RPC", label: "RPC" }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-2.5 py-1 rounded-md transition whitespace-nowrap ${
              filterType === f.id
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-mono text-xs"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-xs">No communication messages recorded for this filter.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const hasDetails = msg.rpcDetails || msg.metadata;
            const lamportClock = msg.metadata?.lamportClock ?? msg.rpcDetails?.lamportClock;

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  msg.type === "MUTEX"
                    ? "bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60"
                    : msg.type === "ELECTION"
                    ? "bg-purple-950/20 border-purple-900/50 hover:border-purple-700/60"
                    : msg.type === "BLOCKCHAIN"
                    ? "bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700/60"
                    : msg.type === "LAMPORT"
                    ? "bg-cyan-950/20 border-cyan-900/50 hover:border-cyan-700/60"
                    : msg.isP2P
                    ? "bg-purple-950/20 border-purple-900/50 hover:border-purple-700/60"
                    : msg.type === "FAULT" || msg.status === "FAILED"
                    ? "bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Top Row: Timestamp, Sender -> Receiver, Lamport Clock, Type Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>

                    {/* Lamport Clock Badge */}
                    {lamportClock !== undefined && (
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono">
                        L:{lamportClock}
                      </span>
                    )}

                    {/* Flow */}
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <span className="text-cyan-300 font-sans">{msg.sender}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-blue-300 font-sans">{msg.receiver}</span>
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${getBadgeStyle(
                        msg
                      )}`}
                    >
                      {msg.type}
                    </span>
                    {hasDetails && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                        className="text-slate-400 hover:text-cyan-400 p-0.5"
                        title="Toggle payload details"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Action & Description */}
                <div className="font-sans">
                  <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    {msg.action}
                  </div>
                  {msg.details && (
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {msg.details}
                    </p>
                  )}
                </div>

                {/* Expandable JSON payload */}
                {isExpanded && hasDetails && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] bg-black/40 p-2 rounded-lg text-slate-300 overflow-x-auto">
                    {msg.rpcDetails && (
                      <div>
                        <span className="text-cyan-400 font-bold">RPC Payload:</span>
                        <pre className="mt-0.5 font-mono">{JSON.stringify(msg.rpcDetails, null, 2)}</pre>
                      </div>
                    )}
                    {msg.metadata && Object.keys(msg.metadata).length > 0 && (
                      <div className="mt-1">
                        <span className="text-amber-400 font-bold">Metadata:</span>
                        <pre className="mt-0.5 font-mono">{JSON.stringify(msg.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ArrowRight, Trash2, Filter, Radio, ChevronDown, ChevronRight, Activity, Zap, ShieldAlert, Cpu } from "lucide-react";

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
    if (filterType === "P2P") return msg.isP2P || msg.type === "P2P_MESSAGE";
    if (filterType === "RPC") return msg.type.startsWith("RPC");
    if (filterType === "FAULT") return msg.type === "FAULT" || msg.status === "FAILED";
    if (filterType === "ALLOCATION") return msg.type === "ALLOCATION" || msg.type === "MIDDLEWARE";
    return true;
  });

  const getBadgeStyle = (msg) => {
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
    if (msg.type === "RECOVERY") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    if (msg.type === "ALLOCATION") {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    return "bg-slate-700/50 text-slate-300 border-slate-600";
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col h-[520px]">
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
              Live Message-Oriented & RPC event stream between nodes and middleware.
            </p>
          </div>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
            {["ALL", "P2P", "RPC", "ALLOCATION", "FAULT"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2 py-0.5 rounded-md transition ${
                  filterType === f
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f === "ALL" ? "All" : f === "ALLOCATION" ? "Alloc" : f}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLog}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 rounded-lg transition border border-slate-700"
            title="Clear Message Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-3 font-mono text-xs"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-xs">No communication messages recorded yet.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            const hasDetails = msg.rpcDetails || msg.metadata;

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border transition-all duration-200 ${
                  msg.isP2P
                    ? "bg-purple-950/20 border-purple-900/50 hover:border-purple-700/60"
                    : msg.type === "FAULT" || msg.status === "FAILED"
                    ? "bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60"
                    : msg.type === "RPC_CALL" || msg.type === "RPC_RESPONSE"
                    ? "bg-slate-950/70 border-slate-800 hover:border-cyan-500/40"
                    : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Top Row: Timestamp, Sender -> Receiver, Type Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Timestamp */}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>

                    {/* Channel Flow */}
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

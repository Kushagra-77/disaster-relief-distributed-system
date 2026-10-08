import React, { useState } from "react";
import {
  Clock,
  Lock,
  Unlock,
  Crown,
  Link,
  ShieldCheck,
  AlertCircle,
  Play,
  PlusCircle,
  CheckCircle2,
  RefreshCw,
  Layers,
  Cpu,
  Hourglass
} from "lucide-react";

export default function FA2Dashboard({
  lamportClocks,
  mutexLocks,
  electionInfo,
  blockchain,
  onRunLamportDemo,
  onRunMutexDemo,
  onRunElection,
  onVerifyBlockchain,
  onCreateBlock,
  verificationResult
}) {
  const [runningAction, setRunningAction] = useState(null);

  const handleAction = async (actionKey, fn) => {
    try {
      setRunningAction(actionKey);
      await fn();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                FA-2 Distributed Systems Extensions
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full">
                Advanced Concepts
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Lamport Logical Clocks • Mutual Exclusion Locks • Bully/Priority Leader Election • Blockchain Audit Trail
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core FA-2 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: LAMPORT CLOCKS */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">1. Lamport Logical Clocks</h3>
                  <p className="text-[11px] text-slate-400">
                    C(e) = C + 1 on send/local, max(local, recv) + 1 on receive.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Logical Time
              </span>
            </div>

            {/* Lamport Clocks Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 my-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold bg-slate-900/50">
                    <th className="py-2 px-3">Node</th>
                    <th className="py-2 px-3 text-center">Clock (L)</th>
                    <th className="py-2 px-3">Last Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {lamportClocks && lamportClocks.map((node) => (
                    <tr key={node.nodeId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-200">
                        {node.nodeName}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-cyan-300">
                        <span className="bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full text-xs">
                          {node.clock}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-400 truncate max-w-[180px]">
                        {node.lastEvent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => handleAction("lamport", onRunLamportDemo)}
            disabled={runningAction !== null}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningAction === "lamport" ? "animate-spin" : "fill-current"}`} />
            <span>{runningAction === "lamport" ? "Synchronizing Clocks..." : "Run Lamport Clock Demo"}</span>
          </button>
        </div>

        {/* CARD 2: MUTUAL EXCLUSION (CRITICAL SECTION) */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-amber-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">2. Distributed Mutual Exclusion</h3>
                  <p className="text-[11px] text-slate-400">
                    Critical section resource locks preventing simultaneous write conflicts.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Critical Section
              </span>
            </div>

            {/* Lock Status Display */}
            <div className="space-y-2 my-3 max-h-[185px] overflow-y-auto pr-1">
              {mutexLocks && mutexLocks.map((lock) => {
                const isAvailable = lock.status === "AVAILABLE";
                const isWaiting = lock.status === "WAITING";
                const isLocked = lock.status === "LOCKED";
                const hasWaiters = lock.waitingQueue && lock.waitingQueue.length > 0;

                return (
                  <div
                    key={lock.resourceKey}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1.5 transition ${
                      isWaiting
                        ? "bg-rose-950/20 border-rose-500/40"
                        : isLocked
                        ? "bg-amber-950/20 border-amber-500/40"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 font-mono text-[12px]">{lock.resourceKey}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          isWaiting
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse"
                            : isLocked
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {isWaiting ? (
                          <Hourglass className="w-2.5 h-2.5" />
                        ) : isLocked ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : (
                          <Unlock className="w-2.5 h-2.5" />
                        )}
                        {lock.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        Lock Owner:{" "}
                        <strong className={lock.currentOwner ? "text-amber-300" : "text-slate-500"}>
                          {lock.currentOwner ? lock.currentOwner.requesterName : "None (Available)"}
                        </strong>
                      </div>
                      <div className="text-right">
                        Waiting:{" "}
                        <strong className={hasWaiters ? "text-rose-400" : "text-slate-500"}>
                          {hasWaiters
                            ? `${lock.waitingQueue.map((w) => w.requesterName).join(", ")} (${lock.waitingQueue.length} queued)`
                            : "0 queued"}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleAction("mutex", onRunMutexDemo)}
            disabled={runningAction !== null}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningAction === "mutex" ? "animate-spin" : "fill-current"}`} />
            <span>{runningAction === "mutex" ? "Simulating Mutual Exclusion..." : "Run Mutual Exclusion Demo"}</span>
          </button>
        </div>

        {/* CARD 3: LEADER ELECTION */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-purple-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">3. Warehouse Leader Election</h3>
                  <p className="text-[11px] text-slate-400">
                    Highest-priority active warehouse coordinates cluster allocations.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Bully Priority
              </span>
            </div>

            {/* Current Leader Badge & Priority Matrix */}
            <div className="my-3 space-y-3">
              <div className="p-3 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-900 rounded-xl border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                    <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Current Leader</div>
                    <div className="text-base font-bold text-white">
                      {electionInfo ? electionInfo.leaderName : "Warehouse A"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    electionInfo?.leaderStatus === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}>
                    {electionInfo?.leaderStatus || "ACTIVE"}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Election: {electionInfo?.electionStatus || "IDLE"}
                  </div>
                </div>
              </div>

              {/* Priority Ranking */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span>Priority Order:</span>
                <span className="font-mono font-semibold text-slate-300">
                  Warehouse A (3) &gt; Warehouse B (2) &gt; Warehouse C (1)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAction("election", onRunElection)}
            disabled={runningAction !== null}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningAction === "election" ? "animate-spin" : "fill-current"}`} />
            <span>{runningAction === "election" ? "Running Election..." : "Run Leader Election"}</span>
          </button>
        </div>

        {/* CARD 4: BLOCKCHAIN RESOURCE AUDIT */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                  <Link className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">4. Blockchain-Based Resource Audit</h3>
                  <p className="text-[11px] text-slate-400">
                    Immutable SHA-256 cryptographic ledger of all disaster relief operations.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                SHA-256 Ledger
              </span>
            </div>

            {/* Verification Status Banner */}
            {verificationResult && (
              <div className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-2 mb-2 ${
                verificationResult.isValid
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-300 border-rose-500/30"
              }`}>
                {verificationResult.isValid ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{verificationResult.message}</span>
              </div>
            )}

            {/* Vertical Chain of Blocks */}
            <div className="my-2 space-y-2 max-h-[140px] overflow-y-auto pr-1 font-mono text-[11px]">
              {blockchain?.blocks &&
                blockchain.blocks.slice(-3).map((block) => (
                  <div
                    key={block.blockNumber}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-emerald-400">BLOCK #{block.blockNumber}</span>
                      <span className="text-[10px] text-slate-400">{block.eventType}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{block.sourceNode} → {block.destinationNode}</span>
                      <span>{block.quantity > 0 ? `${block.quantity} ${block.resource}` : block.resource}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      Hash: <span className="text-cyan-400 font-semibold">{block.currentHash}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => handleAction("verify", onVerifyBlockchain)}
              disabled={runningAction !== null}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${runningAction === "verify" ? "animate-spin" : ""}`} />
              <span>Verify Blockchain</span>
            </button>
            <button
              onClick={() =>
                handleAction("createBlock", () =>
                  onCreateBlock({
                    eventType: "RESOURCE_AUDIT_ENTRY",
                    sourceNode: "Warehouse A",
                    destinationNode: "Relief Center A",
                    resource: "Water",
                    quantity: 20,
                    details: "Manual Disaster Audit Verification Block"
                  })
                )
              }
              disabled={runningAction !== null}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Audit Block</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

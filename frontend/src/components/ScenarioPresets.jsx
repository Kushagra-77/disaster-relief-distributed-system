import React, { useState } from "react";
import { Play, Sparkles, AlertTriangle, ShieldCheck, ArrowRightLeft, Cpu } from "lucide-react";

export default function ScenarioPresets({ onRunRaceScenario, onRunFaultScenario, onRunP2PTransfer }) {
  const [runningScenario, setRunningScenario] = useState(null);

  const handleRun = async (scenarioKey, fn) => {
    try {
      setRunningScenario(scenarioKey);
      await fn();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningScenario(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-5 border border-cyan-500/20 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Distributed System Demonstration Scenarios
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                FA-1 Evaluation Presets
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              One-click execution of key distributed coordination, race prevention, and fault tolerance benchmarks.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Scenario 1: Race Condition */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Scenario 1: Concurrency Race
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                Mutex Lock
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Simultaneous Water Request
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Warehouse A has <strong>100 Water</strong>. Relief Center A requests <strong>80</strong> and Relief Center B simultaneously requests <strong>50</strong>. Verifies over-allocation prevention.
            </p>
          </div>
          <button
            onClick={() => handleRun("race", onRunRaceScenario)}
            disabled={runningScenario !== null}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningScenario === "race" ? "animate-spin" : "fill-current"}`} />
            <span>{runningScenario === "race" ? "Simulating Race..." : "Run Race Demo"}</span>
          </button>
        </div>

        {/* Scenario 2: Fault Tolerance Fallback */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Scenario 2: Node Failure
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono">
                Failover Routing
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Warehouse A Crash & Fallback
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fails <strong>Warehouse A</strong>, then requests <strong>50 Water</strong>. Demonstrates Middleware detecting failure and automatically falling back to <strong>Warehouse C</strong>.
            </p>
          </div>
          <button
            onClick={() => handleRun("fault", onRunFaultScenario)}
            disabled={runningScenario !== null}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningScenario === "fault" ? "animate-spin" : "fill-current"}`} />
            <span>{runningScenario === "fault" ? "Simulating Failover..." : "Run Failover Demo"}</span>
          </button>
        </div>

        {/* Scenario 3: P2P Transfer */}
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Scenario 3: Peer-to-Peer
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono">
                P2P RPC
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Inter-Warehouse Medical Transfer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Warehouse B</strong> negotiates directly with <strong>Warehouse C</strong> to transfer <strong>10 Medicines</strong> via peer-to-peer messaging and RPC debit/credit.
            </p>
          </div>
          <button
            onClick={() => handleRun("p2p", onRunP2PTransfer)}
            disabled={runningScenario !== null}
            className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${runningScenario === "p2p" ? "animate-spin" : "fill-current"}`} />
            <span>{runningScenario === "p2p" ? "Transferring..." : "Run P2P Transfer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

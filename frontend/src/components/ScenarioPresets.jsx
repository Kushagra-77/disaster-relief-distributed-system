import React, { useState } from "react";
import { Play, Sparkles, AlertTriangle, ShieldCheck, ArrowRightLeft, Cpu, Clock, Lock, Crown, Link, RefreshCw } from "lucide-react";

export default function ScenarioPresets({
  onRunRaceScenario,
  onRunFaultScenario,
  onRunP2PTransfer,
  onRunLamportDemo,
  onRunMutexDemo,
  onRunElection,
  onVerifyBlockchain,
  onReset
}) {
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
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-5 border border-cyan-500/20 shadow-xl relative overflow-hidden space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Distributed Systems Demonstration Hub
              <span className="text-[10px] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-cyan-500/30">
                FA-1 + FA-2 Evaluation Suite
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              One-click live evaluations for logical clocks, mutual exclusion, leader election, fault tolerance, and blockchain audit.
            </p>
          </div>
        </div>

        {/* Quick Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset All Demos</span>
        </button>
      </div>

      {/* FA-2 Presets Strip */}
      <div>
        <div className="text-[11px] uppercase font-bold text-purple-400 tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          FA-2 Core Concepts Demonstrations:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Lamport Demo */}
          <button
            onClick={() => handleRun("lamport", onRunLamportDemo)}
            disabled={runningScenario !== null}
            className="p-2.5 rounded-xl border bg-cyan-950/30 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-900/30 text-cyan-300 text-xs font-bold transition flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="truncate">1. Lamport Clocks</span>
            </div>
            <Play className={`w-3 h-3 shrink-0 ${runningScenario === "lamport" ? "animate-spin" : "fill-current"}`} />
          </button>

          {/* Mutex Demo */}
          <button
            onClick={() => handleRun("mutex", onRunMutexDemo)}
            disabled={runningScenario !== null}
            className="p-2.5 rounded-xl border bg-amber-950/30 border-amber-500/30 hover:border-amber-400 hover:bg-amber-900/30 text-amber-300 text-xs font-bold transition flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate">2. Mutual Exclusion</span>
            </div>
            <Play className={`w-3 h-3 shrink-0 ${runningScenario === "mutex" ? "animate-spin" : "fill-current"}`} />
          </button>

          {/* Election Demo */}
          <button
            onClick={() => handleRun("election", onRunElection)}
            disabled={runningScenario !== null}
            className="p-2.5 rounded-xl border bg-purple-950/30 border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/30 text-purple-300 text-xs font-bold transition flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 truncate">
              <Crown className="w-4 h-4 shrink-0 text-purple-400" />
              <span className="truncate">3. Leader Election</span>
            </div>
            <Play className={`w-3 h-3 shrink-0 ${runningScenario === "election" ? "animate-spin" : "fill-current"}`} />
          </button>

          {/* Blockchain Verify */}
          <button
            onClick={() => handleRun("blockchain", onVerifyBlockchain)}
            disabled={runningScenario !== null}
            className="p-2.5 rounded-xl border bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/30 text-emerald-300 text-xs font-bold transition flex items-center justify-between gap-2 disabled:opacity-50"
          >
            <div className="flex items-center gap-2 truncate">
              <Link className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="truncate">4. Verify Blockchain</span>
            </div>
            <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${runningScenario === "blockchain" ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* FA-1 Classic Scenarios */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
          FA-1 Core Baseline Demos:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleRun("race", onRunRaceScenario)}
            disabled={runningScenario !== null}
            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-left transition flex items-center justify-between disabled:opacity-50"
          >
            <div>
              <div className="font-bold text-slate-200">Race Condition Scenario</div>
              <div className="text-[10px] text-slate-400">80 + 50 Water on 100 Stock</div>
            </div>
            <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </button>

          <button
            onClick={() => handleRun("fault", onRunFaultScenario)}
            disabled={runningScenario !== null}
            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-left transition flex items-center justify-between disabled:opacity-50"
          >
            <div>
              <div className="font-bold text-slate-200">Fault &amp; Failover Scenario</div>
              <div className="text-[10px] text-slate-400">Warehouse A Crash &rarr; Fallback to C</div>
            </div>
            <Play className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          </button>

          <button
            onClick={() => handleRun("p2p", onRunP2PTransfer)}
            disabled={runningScenario !== null}
            className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-left transition flex items-center justify-between disabled:opacity-50"
          >
            <div>
              <div className="font-bold text-slate-200">P2P Inter-Warehouse Transfer</div>
              <div className="text-[10px] text-slate-400">Warehouse B &rarr; C (10 Medicines)</div>
            </div>
            <Play className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

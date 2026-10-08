import React, { useState } from "react";
import { ArrowLeftRight, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function TransferForm({ nodes, onTransferSubmit, isSubmitting }) {
  const [sourceNodeId, setSourceNodeId] = useState("node-warehouse-b");
  const [destinationNodeId, setDestinationNodeId] = useState("node-warehouse-c");
  const [resource, setResource] = useState("Medicines");
  const [quantity, setQuantity] = useState(10);
  const [lastResult, setLastResult] = useState(null);

  const sourceNode = nodes.find((n) => n.id === sourceNodeId);
  const availableAtSource = sourceNode?.inventory[resource]?.available || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sourceNodeId === destinationNodeId) {
      alert("Source and destination nodes must be different");
      return;
    }
    if (quantity <= 0) return;

    try {
      const res = await onTransferSubmit({
        sourceNodeId,
        destinationNodeId,
        resource,
        quantity: Number(quantity)
      });
      setLastResult(res);
    } catch (err) {
      setLastResult({ success: false, message: err.message });
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30 text-purple-400">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Peer-to-Peer (P2P) Resource Transfer</h3>
            <p className="text-[11px] text-slate-400">
              Direct peer communication and atomic resource transfer between nodes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            {/* Source Node */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Source Node
              </label>
              <select
                value={sourceNodeId}
                onChange={(e) => setSourceNodeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Node */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Destination Node
              </label>
              <select
                value={destinationNodeId}
                onChange={(e) => setDestinationNodeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Resource Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Resource Item
              </label>
              <select
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                <option value="Water">Water</option>
                <option value="Food">Food</option>
                <option value="Medicines">Medicines</option>
                <option value="EmergencyEquipment">Emergency Equipment</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Quantity</label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Avail: <strong className="text-purple-300">{availableAtSource}</strong>
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={availableAtSource || 500}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || availableAtSource === 0}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-purple-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ArrowLeftRight className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
            <span>{isSubmitting ? "Executing P2P Transfer..." : "Execute P2P Transfer"}</span>
          </button>
        </form>
      </div>

      {/* Result feedback */}
      {lastResult && (
        <div
          className={`mt-3 p-3 rounded-lg border text-xs ${
            lastResult.success
              ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {lastResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
            <span>{lastResult.success ? "P2P TRANSFER COMPLETE" : "P2P TRANSFER FAILED"}</span>
          </div>
          <p className="text-[11px] leading-snug">
            {lastResult.message || `Transferred ${lastResult.quantity} units of ${lastResult.resource} from ${lastResult.source} to ${lastResult.destination}.`}
          </p>
        </div>
      )}
    </div>
  );
}

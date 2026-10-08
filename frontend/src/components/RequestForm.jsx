import React, { useState } from "react";
import { Send, AlertCircle, CheckCircle2, ShieldQuestion } from "lucide-react";

export default function RequestForm({ nodes, onRequestSubmit, isSubmitting }) {
  const [requestingCenterId, setRequestingCenterId] = useState("node-relief-a");
  const [resource, setResource] = useState("Water");
  const [quantity, setQuantity] = useState(50);
  const [priority, setPriority] = useState("HIGH");
  const [preferredWarehouseId, setPreferredWarehouseId] = useState("");
  const [lastResult, setLastResult] = useState(null);

  const reliefCenters = nodes.filter((n) => n.type === "ReliefCenter");
  const warehouses = nodes.filter((n) => n.type === "Warehouse");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) return;

    try {
      const res = await onRequestSubmit({
        requestingCenterId,
        resource,
        quantity: Number(quantity),
        priority,
        preferredWarehouseId: preferredWarehouseId || null
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
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30 text-blue-400">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Relief Center Resource Request</h3>
            <p className="text-[11px] text-slate-400">
              Dispatches request to Middleware for discovery, reservation, & allocation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          {/* Requesting Center */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Requesting Relief Center
            </label>
            <select
              value={requestingCenterId}
              onChange={(e) => setRequestingCenterId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {reliefCenters.map((rc) => (
                <option key={rc.id} value={rc.id}>
                  {rc.name} ({rc.location})
                </option>
              ))}
            </select>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="Water">Water (Liters/Cans)</option>
                <option value="Food">Food (Ration Packs)</option>
                <option value="Medicines">Medicines (Kits)</option>
                <option value="EmergencyEquipment">Emergency Equipment</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Priority */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Request Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>

            {/* Optional Preferred Warehouse */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Preferred Depot (Opt)
              </label>
              <select
                value={preferredWarehouseId}
                onChange={(e) => setPreferredWarehouseId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium text-xs"
              >
                <option value="">Auto-Discover (Default)</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className={`w-4 h-4 ${isSubmitting ? "animate-spin" : ""}`} />
            <span>{isSubmitting ? "Coordinating Allocation..." : "Submit to Middleware"}</span>
          </button>
        </form>
      </div>

      {/* Result feedback */}
      {lastResult && (
        <div
          className={`mt-3 p-3 rounded-lg border text-xs ${
            lastResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {lastResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
            <span>{lastResult.status || (lastResult.success ? "SUCCESS" : "FAILED")}</span>
          </div>
          <p className="text-[11px] leading-snug">
            {lastResult.message || `Allocated ${lastResult.allocated} / ${lastResult.requested} units.`}
          </p>
          {lastResult.fulfillments && lastResult.fulfillments.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-emerald-500/20 font-mono text-[10px] space-y-0.5">
              {lastResult.fulfillments.map((f, i) => (
                <div key={i}>
                  ✓ {f.warehouseName}: {f.quantity} units
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

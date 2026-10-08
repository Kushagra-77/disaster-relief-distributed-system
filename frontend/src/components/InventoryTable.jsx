import React, { useState } from "react";
import { Table, Filter, Layers, CheckCircle2, XCircle } from "lucide-react";

export default function InventoryTable({ inventories }) {
  const [filterResource, setFilterResource] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  const filtered = inventories.filter((item) => {
    if (filterResource !== "ALL" && item.resource !== filterResource) return false;
    if (filterType !== "ALL" && item.nodeType !== filterType) return false;
    return true;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Cluster Inventory Master View</h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Resources</option>
              <option value="Water" className="bg-slate-900">Water</option>
              <option value="Food" className="bg-slate-900">Food</option>
              <option value="Medicines" className="bg-slate-900">Medicines</option>
              <option value="EmergencyEquipment" className="bg-slate-900">Equipment</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">All Node Types</option>
              <option value="Warehouse" className="bg-slate-900">Warehouses Only</option>
              <option value="ReliefCenter" className="bg-slate-900">Relief Centers Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3">Node</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Resource</th>
              <th className="py-2.5 px-3 text-right">Available</th>
              <th className="py-2.5 px-3 text-right">Reserved</th>
              <th className="py-2.5 px-3 text-right">Allocated</th>
              <th className="py-2.5 px-3 text-center">Node Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filtered.map((item, idx) => (
              <tr
                key={`${item.nodeId}-${item.resource}-${idx}`}
                className="hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2.5 px-3 font-semibold text-slate-200">
                  {item.nodeName}
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      item.nodeType === "Warehouse"
                        ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                        : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {item.nodeType}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">
                  {item.resource === "EmergencyEquipment" ? "Emergency Equipment" : item.resource}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                  {item.available}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <span className={item.reserved > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>
                    {item.reserved}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono">
                  <span className={item.allocated > 0 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                    {item.allocated}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === "ONLINE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {item.status === "ONLINE" ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" /> ONLINE
                      </>
                    ) : (
                      <>
                        <XCircle className="w-2.5 h-2.5" /> OFFLINE
                      </>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { FaClipboardList } from "react-icons/fa";

export default function Logs({ page, setPage, logs = [], resetLogs, session }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  // Filtrage
  const filtered = (logs || []).filter(log => {
    const matchType = filterType ? log.type === filterType : true;
    const matchText = search ? (log.message || "").toLowerCase().includes(search.toLowerCase()) : true;
    return matchType && matchText;
  });

  const canReset = ["admin", "superadmin"].includes(session?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold flex items-center gap-2 mb-6 text-blue-900 drop-shadow-sm tracking-tight">
          <FaClipboardList className="text-blue-700" /> Journal Véhicules
        </h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Rechercher dans les messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-blue-300 rounded px-3 py-1 w-64"
          />
          {/* Ajoutez ici des filtres par type si besoin */}
          {canReset && (
            <button
              className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded border border-red-300 hover:bg-red-200 text-xs"
              onClick={resetLogs}
            >
              Réinitialiser les logs
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded border border-blue-100 bg-white/90">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Message</th>
                <th className="text-center px-3 py-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-8">Aucun log trouvé.</td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <tr key={i} className="border-b last:border-b-0 hover:bg-blue-50">
                    <td className="px-3 py-2 align-middle text-left text-xs text-blue-900">{log.date}</td>
                    <td className="px-3 py-2 align-middle text-left text-blue-800">{log.message}</td>
                    <td className="px-3 py-2 align-middle text-center text-blue-700 text-xs">{log.type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => setPage("vehicule")}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">
            Retour véhicules
          </button>
          <button onClick={() => setPage("admin")}
            className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">
            Admin véhicules
          </button>
        </div>
      </div>
    </div>
  );
}

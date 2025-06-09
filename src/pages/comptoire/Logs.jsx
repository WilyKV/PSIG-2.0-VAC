import React, { useState } from "react";
import useComptoirData from "../../hooks/useComptoirData";

const typeColor = {
  vente: "bg-blue-100 text-blue-800",
  stock: "bg-purple-100 text-purple-800",
  dette: "bg-yellow-100 text-yellow-800",
  admin: "bg-slate-200 text-slate-800",
};

const typeLabels = {
  vente: "Vente",
  stock: "Stock",
  dette: "Dette",
  admin: "Admin",
};

export default function Logs() {
  const {
    data: { logs },
    session,
    resetLogs
  } = useComptoirData();
  // Suppression du tri interactif, ajout des filtres
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  const canReset = ["admin", "superadmin"].includes(session?.role);

  // Filtrage des logs
  const filteredLogs = logs.filter(log => {
    const matchType = filterType ? log.type === filterType : true;
    const matchText = search ? (log.message || "").toLowerCase().includes(search.toLowerCase()) : true;
    return matchType && matchText;
  });

  // Tri par date descendante (plus récent en haut)
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Liste des types présents dans les logs pour les boutons
  const logTypes = Array.from(new Set(logs.map(l => l.type))).filter(Boolean);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-2xl p-8 mb-6 animate-fade-in">
      <h2 className="text-blue-800 font-extrabold text-2xl mb-6 tracking-tight">Journal des mouvements</h2>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Rechercher dans les messages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1 w-64"
        />
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-semibold text-sm">Filtrer par type :</span>
          <button
            className={`px-2 py-1 rounded border text-xs font-semibold transition ${filterType === '' ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
            onClick={() => setFilterType("")}
          >Tous</button>
          {logTypes.map(type => (
            <button
              key={type}
              className={`px-2 py-1 rounded border text-xs font-semibold transition ${filterType === type ? (typeColor[type] || 'bg-blue-700 text-white border-blue-700') : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
              onClick={() => setFilterType(type)}
            >{typeLabels[type] || type}</button>
          ))}
          {canReset && (
            <button
              className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded border border-red-300 hover:bg-red-200 text-xs"
              onClick={resetLogs}
            >
              Réinitialiser les logs
            </button>
          )}
        </div>
      </div>
      <div className="relative pl-4">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-full"></div>
        <ul className="space-y-4">
          {logs.length === 0 && <li className="text-slate-400">Aucun log</li>}
          {sortedLogs.length === 0 && logs.length > 0 && <li className="text-slate-400">Aucun log ne correspond au filtre</li>}
          {sortedLogs.map(log => (
            <li key={log.id} className="relative bg-white rounded-xl shadow p-4 border-l-4 border-blue-400 animate-fade-in">
              <span className={`absolute -left-3 top-4 w-6 h-6 rounded-full border-4 border-white shadow ${typeColor[log.type]||'bg-slate-200'}`}></span>
              <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${typeColor[log.type]||'bg-slate-200'}`}>{log.type}</span>
              {log.message}
              {log.agent && <span className="ml-2 text-xs text-slate-500">par {log.agent}</span>}
              <span className="block text-xs text-slate-400 mt-1">{new Date(log.date).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

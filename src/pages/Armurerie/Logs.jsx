import React, { useState } from "react";
import useArmurerieData from "../../hooks/useArmurerieData";
import { FaClipboardList, FaEye } from "react-icons/fa";

export default function Logs() {
  const { logs, resetLogs } = useArmurerieData();
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [modalLog, setModalLog] = useState(null);

  // TODO: Replace with real session/role if available
  const session = { role: localStorage.getItem("comptoir-psig-session") ? JSON.parse(localStorage.getItem("comptoir-psig-session")).role : "invite" };
  const canReset = ["admin", "superadmin"].includes(session.role);

  // Filtrage des logs armurerie (tous les logs du fichier armurerie)
  const filteredLogs = logs.filter(log => log.type && log.type.startsWith("armurerie"));
  const filtered = filteredLogs.filter(log => {
    const matchType = filterType ? log.type === filterType : true;
    const matchText = search ? (log.message || "").toLowerCase().includes(search.toLowerCase()) : true;
    return matchType && matchText;
  });
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
  const logTypes = Array.from(new Set(filteredLogs.map(l => l.type))).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold flex items-center gap-2 mb-6 text-blue-900 drop-shadow-sm tracking-tight">
          <FaClipboardList className="text-blue-700" /> Journal Armurerie
        </h1>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Rechercher dans les messages..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-blue-300 rounded px-3 py-1 w-64"
          />
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-semibold text-sm">Filtrer par type :</span>
            <button
              className={"px-2 py-1 rounded text-xs " + (!filterType ? "bg-blue-700 text-white" : "bg-white text-blue-700 border border-blue-300")}
              onClick={() => setFilterType("")}
            >
              Tous
            </button>
            {logTypes.map(type => (
              <button
                key={type}
                className={"px-2 py-1 rounded text-xs " + (filterType === type ? "bg-blue-700 text-white" : "bg-white text-blue-700 border border-blue-300")}
                onClick={() => setFilterType(type)}
              >
                {type.replace("armurerie-", "")}
              </button>
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
        <div className="overflow-x-auto rounded border border-blue-100 bg-white/90">
          <table className="w-full text-sm">
            <colgroup>
              <col style={{ width: '25%' }} />
              <col style={{ width: '65%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Message</th>
                <th className="text-center px-3 py-2">Voir</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((log, i) => (
                <tr key={i} className="border-b last:border-b-0 hover:bg-blue-50">
                  <td className="px-3 py-2 align-middle text-left text-xs text-blue-900">{new Date(log.date).toLocaleString()}</td>
                  <td className="px-3 py-2 align-middle text-left text-blue-800 truncate max-w-xs">{log.message}</td>
                  <td className="px-3 py-2 align-middle text-center">
                    <button onClick={() => setModalLog(log)} className="text-blue-700 hover:text-blue-900" title="Voir le détail du log"><FaEye /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Modal log */}
        {modalLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-2 border-blue-200 animate-fade-in relative">
              <button className="absolute top-2 right-2 text-blue-700 text-xl" onClick={() => setModalLog(null)}>&times;</button>
              <h2 className="text-blue-800 font-bold text-xl mb-4 flex items-center gap-2"><FaClipboardList /> Détail du log</h2>
              <table className="w-full text-sm mb-4 border border-blue-100 rounded">
                <tbody>
                  <tr><td className="font-semibold text-blue-700 w-32">Date</td><td>{new Date(modalLog.date).toLocaleString()}</td></tr>
                  {modalLog.patrouilleId && <tr><td className="font-semibold text-blue-700">Patrouille</td><td>{modalLog.patrouilleId}</td></tr>}
                  {modalLog.retour && <tr><td className="font-semibold text-blue-700">Retour</td><td className="text-green-700 font-semibold">Oui</td></tr>}
                </tbody>
              </table>
              <div className="mb-2"><b>Message :</b></div>
              <div className="bg-blue-50 border border-blue-100 rounded p-3 text-blue-900 whitespace-pre-line break-words">{modalLog.message}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

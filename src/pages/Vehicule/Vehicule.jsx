import React, { useState } from "react";
import { FaCar, FaSearch, FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";
import MenuVehicule from "../../components/MenuVehicule";
import Admin from "./Admin.jsx";
import Logs from "./Logs.jsx";
import useVehiculeData from "../../hooks/useVehiculeData";
import useAdminData from "../../hooks/useAdminData";
import LoginVehicule from "./Login.jsx";

const statutColor = {
  "Disponible": "text-green-600",
  "En mission": "text-blue-600",
  "En maintenance": "text-yellow-600",
};

function VehiculeMain({ vehicules = [], search, setSearch, canAffect, addVehicule }) {
  const { session } = useAdminData();
  const [showAdd, setShowAdd] = useState(false);
  const [newVehicule, setNewVehicule] = useState({ nom: "", type: "", immatriculation: "", statut: "Disponible" });
  const vehiculesFiltres = (vehicules || []).filter(
    v => v.nom.toLowerCase().includes(search.toLowerCase()) ||
         v.immatriculation.toLowerCase().includes(search.toLowerCase())
  );
  const canAdd = ["gestionnaire", "admin", "superadmin"].includes(session?.role);
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold flex items-center gap-2 mb-6 text-blue-900 drop-shadow-sm tracking-tight">
        <FaCar className="text-blue-700" /> Gestion des véhicules
      </h1>
      <div className="flex items-center gap-2 mb-4">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un véhicule ou une immatriculation..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-blue-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        {canAdd && (
          <button className="ml-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-sm" onClick={() => setShowAdd(v => !v)}>
            <FaPlus /> Ajouter
          </button>
        )}
      </div>
      {showAdd && canAdd && (
        <form className="mb-6 bg-blue-50 p-4 rounded shadow flex flex-col gap-2" onSubmit={e => {
          e.preventDefault();
          if (!newVehicule.nom || !newVehicule.type || !newVehicule.immatriculation) return;
          addVehicule(newVehicule);
          setNewVehicule({ nom: "", type: "", immatriculation: "", statut: "Disponible" });
          setShowAdd(false);
        }}>
          <div className="flex gap-2">
            <input className="border px-2 py-1 rounded w-1/3" placeholder="Nom" value={newVehicule.nom} onChange={e => setNewVehicule(v => ({ ...v, nom: e.target.value }))} />
            <input className="border px-2 py-1 rounded w-1/3" placeholder="Type" value={newVehicule.type} onChange={e => setNewVehicule(v => ({ ...v, type: e.target.value }))} />
            <input className="border px-2 py-1 rounded w-1/3" placeholder="Immatriculation" value={newVehicule.immatriculation} onChange={e => setNewVehicule(v => ({ ...v, immatriculation: e.target.value }))} />
            <select className="border px-2 py-1 rounded" value={newVehicule.statut} onChange={e => setNewVehicule(v => ({ ...v, statut: e.target.value }))}>
              <option value="Disponible">Disponible</option>
              <option value="En mission">En mission</option>
              <option value="En maintenance">En maintenance</option>
            </select>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Ajouter</button>
            <button type="button" className="bg-gray-200 px-4 py-1 rounded" onClick={() => setShowAdd(false)}>Annuler</button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <thead className="bg-blue-50">
            <tr>
              <th className="px-4 py-2 text-left">Véhicule</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Immatriculation</th>
              <th className="px-4 py-2 text-left">Statut</th>
            </tr>
          </thead>
          <tbody>
            {vehiculesFiltres.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-8">Aucun véhicule trouvé.</td>
              </tr>
            ) : (
              vehiculesFiltres.map(v => (
                <tr key={v.id} className="border-b last:border-b-0 hover:bg-blue-50">
                  <td className="px-4 py-2 font-medium text-blue-800 align-middle text-left truncate">{v.nom}</td>
                  <td className="px-4 py-2 align-middle text-left">{v.type}</td>
                  <td className="px-4 py-2 align-middle text-left">{v.immatriculation}</td>
                  <td className={"px-4 py-2 align-middle text-left font-semibold " + (statutColor[v.statut] || "")}> 
                    {v.statut === "Disponible" && <FaCheckCircle className="inline text-green-500" />} 
                    {v.statut === "En mission" && <FaCar className="inline text-blue-500" />} 
                    {v.statut === "En maintenance" && <FaTimesCircle className="inline text-yellow-500" />} 
                    {v.statut}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-8 text-gray-500 text-xs text-center">
        {/* Ajoutez ici des infos ou actions contextuelles */}
      </div>
    </div>
  );
}

export default function Vehicule() {
  const [page, setPage] = useState("vehicule");
  const [search, setSearch] = useState("");
  const { data, addVehicule, addLog, resetLogs } = useVehiculeData();
  const vehicules = data?.vehicules || [];
  const logs = data?.logs || [];

  // Utiliser la session centralisée
  const { session, logout } = useAdminData();
  const [showLogin, setShowLogin] = useState(false);

  // Afficher la page de connexion seulement si showLogin est vrai
  if (showLogin) {
    return <LoginVehicule onLogin={() => setShowLogin(false)} />;
  }

  let content = null;
  if (page === "vehicule") {
    content = <VehiculeMain vehicules={vehicules} search={search} setSearch={setSearch} canAffect={["gestionnaire","admin","superadmin"].includes(session.role)} addVehicule={addVehicule} />;
  } else if (page === "admin") {
    // Blocage accès admin si non connecté
    if (!session || !["admin","superadmin","gestionnaire"].includes(session.role)) {
      return <LoginVehicule onLogin={() => setShowLogin(false)} />;
    }
    content = <Admin page={page} setPage={setPage} />;
  } else if (page === "logs") {
    content = <Logs page={page} setPage={setPage} logs={logs} resetLogs={resetLogs} session={session} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <MenuVehicule page={page} setPage={setPage} session={session} logout={logout} onLoginClick={() => setShowLogin(true)} />
      {content}
    </div>
  );
}

import { useState, useEffect } from "react";
import useAdminData from "./useAdminData";
import useGeneralData from "./useGeneralData";

// Fixtures véhicules (complète, à adapter si besoin)
const vehiculesFixtures = [
  { id: 1, nom: "Opel", type: "Break", immatriculation: "AA-123-AA", statut: "Disponible" },
  { id: 2, nom: "Kodiak", type: "SUV", immatriculation: "BB-234-BB", statut: "Disponible" },
  { id: 3, nom: "5008B", type: "SUV", immatriculation: "CC-345-CC", statut: "En mission" },
  { id: 4, nom: "5008S", type: "SUV", immatriculation: "DD-456-DD", statut: "Disponible" },
  { id: 5, nom: "3008 GE", type: "SUV", immatriculation: "EE-567-EE", statut: "En maintenance" },
  { id: 6, nom: "3008 GB", type: "SUV", immatriculation: "FF-678-FF", statut: "Disponible" },
  { id: 7, nom: "Expert CDT", type: "Fourgon", immatriculation: "GG-789-GG", statut: "Disponible" },
  { id: 8, nom: "Expert 597", type: "Fourgon", immatriculation: "HH-890-HH", statut: "Disponible" }
];

const STORAGE_KEY = "vehicule-psig-data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { vehicules: vehiculesFixtures, logs: [] };
    const parsed = JSON.parse(raw);
    if (!parsed.vehicules?.length) return { vehicules: vehiculesFixtures, logs: [] };
    return parsed;
  } catch {
    return { vehicules: vehiculesFixtures, logs: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function useVehiculeData() {
  const admin = useAdminData();
  const general = useGeneralData();
  const [data, setData] = useState(loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  // CRUD véhicules
  const addVehicule = (vehicule) => {
    setData(d => ({ ...d, vehicules: [...d.vehicules, { ...vehicule, id: Date.now() }] }));
  };
  const updateVehicule = (id, updates) => {
    setData(d => ({ ...d, vehicules: d.vehicules.map(v => v.id === id ? { ...v, ...updates } : v) }));
  };
  const removeVehicule = (id) => {
    setData(d => ({ ...d, vehicules: d.vehicules.filter(v => v.id !== id) }));
  };

  // Logs véhicules
  const addLog = (log) => {
    setData(d => ({ ...d, logs: [...d.logs, { ...log, id: Date.now() }] }));
  };
  const resetLogs = () => {
    setData(d => ({ ...d, logs: [] }));
  };

  // Reset data
  const resetData = () => {
    setData({ vehicules: vehiculesFixtures, logs: [] });
  };

  // Export/Import
  const exportData = () => JSON.stringify(data, null, 2);
  const importData = (json) => {
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      setData(parsed);
      return true;
    } catch {
      return false;
    }
  };

  return {
    ...admin,
    ...general,
    data,
    addVehicule,
    updateVehicule,
    removeVehicule,
    addLog,
    resetLogs,
    resetData,
    exportData,
    importData
  };
}

import { useState, useEffect } from "react";
import useComptoirData from "./useComptoirData";
import useAdminData from "./useAdminData";
import useGeneralData from "./useGeneralData";

const STORAGE_KEY = "armurerie-psig-data";

const defaultData = {
  produits: [
    { id: 1, nom: "UMP9", numeros: [1,2,3,4,5,6] },
    { id: 2, nom: "Chargeurs UMP9", numeros: [1,2,3,4,5,6,7,8,9,10,11,12] },
    { id: 3, nom: "G36", numeros: [1,2] },
    { id: 4, nom: "Chargeurs G36", numeros: [1,2,3,4,5,6,7,8,9,10,11,12] },
    { id: 5, nom: "Tazer", numeros: [1,2,3,4,5] },
    { id: 6, nom: "LBD", numeros: [1,2,3] },
    { id: 7, nom: "Polarion", numeros: [1,2] },
    { id: 8, nom: "GENL", numeros: [2,3], unique: true },
    { id: 9, nom: "MP7", numeros: [2,3], unique: true }
  ],
  logs: [],
  fiches: [], // Ajout fiches de perception
  patrouilles: [] // Ajout patrouilles en cours
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    if (!parsed.produits?.length) return defaultData;
    return parsed;
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function useArmurerieData() {
  const admin = useAdminData();
  const general = useGeneralData();
  const [data, setData] = useState(loadData());
  const { data: comptoirData, session } = useComptoirData();

  // Lecture dynamique des véhicules à chaque appel
  const getVehicules = () => {
    try {
      const raw = localStorage.getItem("vehicule-psig-data");
      if (raw) {
        const vehiculesVehicule = JSON.parse(raw).vehicules || [];
        return vehiculesVehicule;
      }
    } catch {}
    return [];
  };

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Produits
  const addProduit = (produit) => {
    setData((d) => ({
      ...d,
      produits: [
        ...d.produits,
        { ...produit, id: Date.now() }
      ]
    }));
  };
  const updateProduit = (id, updates) => {
    setData((d) => ({
      ...d,
      produits: d.produits.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
  };
  const removeProduit = (id) => {
    setData((d) => ({ ...d, produits: d.produits.filter((p) => p.id !== id) }));
  };

  // Fiches de perception
  const addFiche = (fiche) => {
    setData((d) => ({ ...d, fiches: [...(d.fiches || []), { ...fiche, id: Date.now() }] }));
  };

  // Patrouilles en cours (persistantes)
  const setPatrouilles = (patrouilles) => {
    setData((d) => ({ ...d, patrouilles }));
  };

  // Logs
  const addLog = (log) => {
    setData((d) => ({ ...d, logs: [...d.logs, { ...log, id: Date.now() }] }));
  };
  const resetLogs = () => {
    setData((d) => ({ ...d, logs: [] }));
  };
  const resetData = () => {
    setData(defaultData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  };

  // Only keep armurerie-specific data logic. Remove all local session/account logic.
  // Expose session, login, logout from useAdminData
  return {
    ...admin,
    ...general,
    produits: data.produits,
    logs: data.logs,
    fiches: data.fiches || [],
    patrouilles: data.patrouilles || [],
    vehicules: getVehicules(),
    addProduit,
    updateProduit,
    removeProduit,
    addLog,
    resetLogs,
    resetData,
    setData,
    addFiche,
    setPatrouilles,
  };
}

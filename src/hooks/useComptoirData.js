import { useState, useEffect } from "react";
import useAdminData from "./useAdminData";
import useGeneralData from "./useGeneralData";

// Schémas de données
const defaultData = {
  produits: [
    { id: 1, nom: "Twix", prix: 0.60, stock: 20 },
    { id: 2, nom: "Canette", prix: 0.70, stock: 15 },
    { id: 3, nom: "Barre chocolatée", prix: 2, stock: 10 },
    { id: 4, nom: "Eau", prix: 0.5, stock: 30 }
  ],
  ventes: [
  ],
  dettes: [
  ],
  logs: [
  ]
};

const STORAGE_KEY = "comptoir-psig-data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    // Si une des clés principales est absente ou vide, on restaure les valeurs par défaut
    if (!parsed.produits?.length) return defaultData;
    return parsed;
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function useComptoirData() {
  const admin = useAdminData();
  const general = useGeneralData();
  const [data, setData] = useState(loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Produits
  const addProduit = (produit) => {
    setData((d) => ({ ...d, produits: [...d.produits, { ...produit, id: Date.now() }] }));
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

  // Ventes
  const addVente = (vente) => {
    setData((d) => ({ ...d, ventes: [...d.ventes, { ...vente, id: Date.now() }] }));
  };

  // Dettes
  const addDette = (dette) => {
    setData((d) => ({ ...d, dettes: [...d.dettes, { ...dette, id: Date.now() }] }));
  };
  const payerDette = (id) => {
    setData((d) => ({
      ...d,
      dettes: d.dettes.map((dt) => (dt.id === id ? { ...dt, payee: true } : dt))
    }));
  };
  // Paiement partiel d'une dette (crée une nouvelle dette pour le reste)
  const addDettePartielle = (ancienneDette, montantPaye) => {
    // Marque l'ancienne comme payée et ajuste son montant au montant payé
    setData((d) => {
      const reste = ancienneDette.montant - montantPaye;
      return {
        ...d,
        dettes: d.dettes.map(dt =>
          dt.id === ancienneDette.id
            ? { ...dt, montant: montantPaye, payee: true }
            : dt
        ).concat(
          reste > 0.01
            ? [{ ...ancienneDette, id: Date.now(), montant: reste, payee: false, date: new Date().toISOString() }]
            : []
        )
      };
    });
  };

  // Logs
  const addLog = (log) => {
    setData((d) => ({ ...d, logs: [...d.logs, { ...log, id: Date.now() }] }));
  };

  // Reset uniquement les logs
  const resetLogs = () => {
    setData((d) => ({ ...d, logs: [] }));
  };

  // Reset
  const resetData = () => {
    setData(defaultData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  };
  // Reset complet (fixtures, comptes, session invité)
  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(defaultData);
  };

  // Export/Import
  const exportData = () => JSON.stringify(data, null, 2);
  const importData = (json) => {
    try {
      const imported = JSON.parse(json);
      setData({ ...defaultData, ...imported });
      return true;
    } catch {
      return false;
    }
  };

  return {
    ...admin,
    ...general,
    data,
    addProduit,
    updateProduit,
    removeProduit,
    addVente,
    addDette,
    addDettePartielle,
    payerDette,
    addLog,
    resetData,
    exportData,
    importData,
    setData, // pour usage avancé
    resetLogs,
    resetAll, // <- expose le reset complet
  };
}

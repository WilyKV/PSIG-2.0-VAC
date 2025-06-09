import { useState, useEffect } from "react";

const STORAGE_KEY = "psig-general-utilisateurs";
const defaultUtilisateurs = [
  { id: 1, nom: "Steve" },
  { id: 2, nom: "Mehdi" },
  { id: 3, nom: "Amine" }
];

function loadUtilisateurs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultUtilisateurs;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) return defaultUtilisateurs;
    return parsed;
  } catch {
    return defaultUtilisateurs;
  }
}

function saveUtilisateurs(utilisateurs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(utilisateurs));
}

export default function useGeneralData() {
  const [utilisateurs, setUtilisateurs] = useState(loadUtilisateurs());

  useEffect(() => {
    saveUtilisateurs(utilisateurs);
  }, [utilisateurs]);

  const addUtilisateur = (utilisateur) => {
    setUtilisateurs(u => [
      ...u,
      { ...utilisateur, id: Date.now() }
    ]);
  };
  const removeUtilisateur = (id) => {
    setUtilisateurs(u => u.filter(user => user.id !== id));
  };
  const updateUtilisateur = (id, updates) => {
    setUtilisateurs(u => u.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  return {
    utilisateurs,
    addUtilisateur,
    removeUtilisateur,
    updateUtilisateur
  };
}

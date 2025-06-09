import { useState, useEffect } from "react";

// Fixtures utilisateurs communs (gendarme/admin)
const utilisateursFixtures = [
  { id: 1, nom: "Steve", admin: true },
  { id: 2, nom: "Mehdi", admin: false },
  { id: 3, nom: "Amine", admin: false }
];

const defaultAccounts = {
  Steve: { mdp: "psig2024*", role: "superadmin" },
};

const STORAGE_KEY = "admin-psig-data";
const ACCOUNTS_KEY = "admin-psig-accounts";
const SESSION_KEY = "admin-psig-session";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { utilisateurs: utilisateursFixtures };
    const parsed = JSON.parse(raw);
    if (!parsed.utilisateurs?.length) return { utilisateurs: utilisateursFixtures };
    return parsed;
  } catch {
    return { utilisateurs: utilisateursFixtures };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return defaultAccounts;
    return { ...defaultAccounts, ...JSON.parse(raw) };
  } catch {
    return defaultAccounts;
  }
}
function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { identifiant: "invité", role: "invite" };
    return JSON.parse(raw);
  } catch {
    return { identifiant: "invité", role: "invite" };
  }
}
function saveSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export default function useAdminData() {
  const [data, setData] = useState(loadData());
  const [accounts, setAccounts] = useState(loadAccounts());
  const [session, setSession] = useState(loadSession());

  // Sync data and accounts to localStorage
  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { saveAccounts(accounts); }, [accounts]);
  // Sync session to localStorage
  useEffect(() => { saveSession(session); }, [session]);
  // Listen to storage events for session sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) {
        setSession(loadSession());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Login/logout logic
  const login = (identifiant, mdp) => {
    const user = accounts[identifiant];
    if (user && user.mdp === mdp) {
      const sessionObj = { identifiant, role: user.role };
      setSession(sessionObj);
      saveSession(sessionObj);
      return { success: true, role: user.role };
    }
    return { success: false };
  };
  const logout = () => {
    setSession({ identifiant: "invité", role: "invite" });
    saveSession({ identifiant: "invité", role: "invite" });
  };

  // Utilisateurs
  const addUtilisateur = (utilisateur) => {
    setData(d => ({
      ...d,
      utilisateurs: [
        ...d.utilisateurs,
        { ...utilisateur, id: Date.now(), admin: !!utilisateur.admin }
      ]
    }));
  };
  const removeUtilisateur = (id) => {
    setData(d => ({ ...d, utilisateurs: d.utilisateurs.filter(u => u.id !== id) }));
  };
  const updateUtilisateur = (id, updates) => {
    setData(d => ({
      ...d,
      utilisateurs: d.utilisateurs.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  // Comptes privilégiés
  const addAccount = (identifiant, mdp, role) => {
    setAccounts(a => ({ ...a, [identifiant]: { mdp, role } }));
  };
  const removeAccount = (identifiant) => {
    setAccounts(a => { const b = { ...a }; delete b[identifiant]; return b; });
  };
  const promoteAccount = (identifiant, newRole) => {
    setAccounts(a => ({ ...a, [identifiant]: { ...a[identifiant], role: newRole } }));
  };
  const changePassword = (identifiant, newMdp) => {
    setAccounts(a => ({ ...a, [identifiant]: { ...a[identifiant], mdp: newMdp } }));
  };

  // Export/Import
  const exportData = () => JSON.stringify(data, null, 2);
  const importData = (json) => {
    try {
      const imported = JSON.parse(json);
      setData({ ...data, ...imported });
      return true;
    } catch {
      return false;
    }
  };

  return {
    data,
    addUtilisateur,
    removeUtilisateur,
    updateUtilisateur,
    accounts,
    addAccount,
    removeAccount,
    promoteAccount,
    changePassword,
    exportData,
    importData,
    setData,
    setAccounts,
    session,
    login,
    logout
  };
}

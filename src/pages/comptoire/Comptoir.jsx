import React, { useState, useEffect } from "react";
import MenuComptoire from "../../components/MenuComptoire";
import Vente from "./Vente";
import Stock from "./Stock";
import Dettes from "./Dettes";
import Logs from "./Logs";
import Admin from "./Admin";
import Login from "./Login";
import useAdminData from "../../hooks/useAdminData";

const PAGES = {
  vente: <Vente />,
  stock: <Stock />,
  dettes: <Dettes />,
  logs: <Logs />,
  admin: <Admin />,
};

export default function Comptoir() {
  const [page, setPage] = useState("vente");
  const { session, logout } = useAdminData();
  const [showLogin, setShowLogin] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    setSessionKey(k => k + 1);
  }, [session.role]);

  // Si invité et demande de connexion, afficher la page de login
  if (showLogin) {
    return <Login onLogin={() => {
      setShowLogin(false);
      setPage("vente");
      window.location.reload();
    }} />;
  }
  // Forcer la page sur "vente", "dettes" ou "logs" si on repasse en invité après reset
  if (session?.role === "invite" && !["vente", "dettes", "logs"].includes(page)) {
    setPage("vente");
  }
  // Adapter les droits selon le rôle
  const isSuperadmin = session.role === "superadmin";
  const isAdmin = session.role === "admin" || isSuperadmin;
  // Pages visibles selon le rôle
  const visiblePages = { vente: <Vente />, stock: <Stock />, dettes: <Dettes />, logs: <Logs /> };
  if (isAdmin) visiblePages.admin = <Admin />;
  if (session.role === "invite") {
    visiblePages.dettes = <Dettes />;
    visiblePages.logs = <Logs />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200 font-sans" key={sessionKey}>
      <div className="fixed inset-0 bg-white/70 backdrop-blur-xl -z-10" />
      <MenuComptoire page={page} setPage={setPage} session={session} logout={logout} onLoginClick={() => setShowLogin(true)} />
      <main className="max-w-4xl mx-auto px-2 py-8 animate-fade-in">
        {visiblePages[page] || <div className="text-center text-slate-400">Accès refusé</div>}
      </main>
    </div>
  );
}

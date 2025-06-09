import React, { useState } from "react";
import useAdminData from "../../hooks/useAdminData";

export default function LoginArmurerie({ onLogin }) {
  const { login } = useAdminData();
  const [identifiant, setIdentifiant] = useState("");
  const [mdp, setMdp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(identifiant, mdp);
    if (res.success) {
      setError("");
      onLogin && onLogin();
    } else {
      setError("Identifiant ou mot de passe incorrect");
    }
  };

  const handleRetour = () => {
    window.location.href = "/";
  };

  return (
    <div>
      <button
        type="button"
        className="mb-4 self-start text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 transition"
        onClick={handleRetour}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
        Retour
      </button>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-8 w-full max-w-xs flex flex-col gap-4 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">Connexion Armurerie</h2>
          <input
            className="border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            placeholder="Identifiant"
            value={identifiant}
            onChange={e => setIdentifiant(e.target.value)}
            autoFocus
          />
          <input
            className="border border-slate-300 rounded px-3 py-2 focus:border-blue-500 outline-none"
            placeholder="Mot de passe"
            type="password"
            value={mdp}
            onChange={e => setMdp(e.target.value)}
          />
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

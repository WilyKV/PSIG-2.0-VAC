import React, { useState } from "react";
import useAdminData from "../../hooks/useAdminData";
import useComptoirData from "../../hooks/useComptoirData";
import useArmurerieData from "../../hooks/useArmurerieData";
import useVehiculeData from "../../hooks/useVehiculeData";
import useGeneralData from "../../hooks/useGeneralData";

export default function Admin({ context = "admin" }) {
  const general = useGeneralData();
  // Sélection du hook selon le contexte
  let dataHook;
  if (context === "comptoir") dataHook = useComptoirData();
  else if (context === "armurerie") dataHook = useArmurerieData();
  else if (context === "vehicule") dataHook = useVehiculeData();
  else dataHook = useAdminData();

  // Pour compatibilité, fallback sur admin si pas de context reconnu
  const isComptoir = context === "comptoir";
  const isArmurerie = context === "armurerie";
  const isVehicule = context === "vehicule";
  const isAdminContext = context === "admin";

  // Extraction des méthodes et données selon le hook
  let utilisateurs = general.utilisateurs;
  let addUtilisateur = general.addUtilisateur;
  let removeUtilisateur = general.removeUtilisateur;
  let updateUtilisateur = general.updateUtilisateur;
  let exportData, importData;
  let accounts, addAccount, removeAccount, promoteAccount, changePassword, session, addLog, resetLogs, resetAll;
  if (isComptoir) {
    exportData = dataHook.exportData;
    importData = dataHook.importData;
    session = dataHook.session;
    addLog = dataHook.addLog;
    accounts = dataHook.accounts;
    addAccount = dataHook.addAccount;
    removeAccount = dataHook.removeAccount;
    promoteAccount = dataHook.promoteAccount;
    changePassword = dataHook.changePassword;
    resetLogs = dataHook.resetLogs;
    resetAll = dataHook.resetAll;
  } else if (isArmurerie) {
    exportData = () => JSON.stringify({
      produits: dataHook.produits,
      utilisateurs: general.utilisateurs,
      fiches: dataHook.fiches,
      patrouilles: dataHook.patrouilles,
      logs: dataHook.logs
    }, null, 2);
    importData = (json) => {
      try {
        const imported = JSON.parse(json);
        if (imported.produits || imported.fiches || imported.patrouilles) {
          dataHook.setData({
            ...dataHook,
            produits: imported.produits || [],
            fiches: imported.fiches || [],
            patrouilles: imported.patrouilles || [],
            logs: imported.logs || []
          });
          if (imported.utilisateurs) general.setUtilisateurs(imported.utilisateurs);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };
    session = dataHook.session;
    addLog = dataHook.addLog;
    accounts = dataHook.accounts || {};
    addAccount = removeAccount = promoteAccount = changePassword = resetLogs = resetAll = () => {};
  } else if (isVehicule) {
    exportData = dataHook.exportData;
    importData = dataHook.importData;
    session = dataHook.session;
    addLog = () => {};
    accounts = {};
    addAccount = removeAccount = promoteAccount = changePassword = resetLogs = resetAll = () => {};
  } else {
    utilisateurs = dataHook.data.utilisateurs || [];
    addUtilisateur = dataHook.addUtilisateur;
    removeUtilisateur = dataHook.removeUtilisateur;
    updateUtilisateur = dataHook.updateUtilisateur;
    exportData = dataHook.exportData;
    importData = dataHook.importData;
    accounts = dataHook.accounts;
    addAccount = dataHook.addAccount;
    removeAccount = dataHook.removeAccount;
    promoteAccount = dataHook.promoteAccount;
    changePassword = dataHook.changePassword;
    session = dataHook.session || { identifiant: "Steve", role: "superadmin" };
    addLog = dataHook.addLog || (()=>{});
    resetLogs = dataHook.resetLogs || (()=>{});
    resetAll = dataHook.resetAll || (()=>{});
  }

  const [nom, setNom] = useState("");
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const [newAccount, setNewAccount] = useState({ identifiant: "", mdp: "", role: "admin" });
  const [pwChange, setPwChange] = useState({ identifiant: "", mdp: "" });

  const isSuperadmin = session?.role === "superadmin";
  const isAdmin = session?.role === "admin" || isSuperadmin;

  // Utilisateurs (gendarmes)
  const handleAdd = () => {
    if (!nom) { setMessage("Nom requis"); return; }
    addUtilisateur({ nom });
    addLog && addLog({ type: "admin", message: `Ajout utilisateur ${nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setNom(""); setMessage("Utilisateur ajouté !");
  };
  const handleDelete = (id, nom) => {
    removeUtilisateur(id);
    addLog && addLog({ type: "admin", message: `Suppression utilisateur ${nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setMessage("Utilisateur supprimé.");
  };
  // Edition nom utilisateur
  const handleEditNom = (u) => {
    const nouveauNom = prompt('Nouveau nom pour ' + u.nom, u.nom);
    if (nouveauNom && nouveauNom.trim() && nouveauNom !== u.nom) {
      if (typeof updateUtilisateur === 'function' && updateUtilisateur !== (()=>{})) {
        updateUtilisateur(u.id, { nom: nouveauNom.trim() });
      } else {
        removeUtilisateur(u.id);
        addUtilisateur({ nom: nouveauNom.trim() });
      }
      addLog && addLog({ type: "admin", message: `Renommage utilisateur ${u.nom} en ${nouveauNom.trim()} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
      setMessage("Nom modifié !");
    }
  };
  // Comptes privilégiés
  const handleAddAccount = () => {
    if (!newAccount.identifiant || !newAccount.mdp) { setMessage("Identifiant et mot de passe requis"); return; }
    addAccount(newAccount.identifiant, newAccount.mdp, newAccount.role);
    addLog && addLog({ type: "admin", message: `Ajout compte ${newAccount.identifiant} (${newAccount.role}) par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setNewAccount({ identifiant: "", mdp: "", role: "admin" });
    setMessage("Compte ajouté !");
  };
  const handleRemoveAccount = (identifiant) => {
    removeAccount(identifiant);
    addLog && addLog({ type: "admin", message: `Suppression compte ${identifiant} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setMessage("Compte supprimé.");
  };
  const handlePromote = (identifiant, newRole) => {
    promoteAccount(identifiant, newRole);
    addLog && addLog({ type: "admin", message: `Promotion compte ${identifiant} en ${newRole} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setMessage("Promotion effectuée (déconnexion automatique)");
  };
  const handleChangePw = () => {
    if (!pwChange.identifiant || !pwChange.mdp) { setMessage("Identifiant et nouveau mot de passe requis"); return; }
    changePassword(pwChange.identifiant, pwChange.mdp);
    addLog && addLog({ type: "admin", message: `Changement mot de passe pour ${pwChange.identifiant} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setPwChange({ identifiant: "", mdp: "" });
    setMessage("Mot de passe changé !");
  };
  const handleResetLogs = () => {
    resetLogs && resetLogs();
    addLog && addLog({ type: "admin", message: `Suppression de tous les logs par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setMessage("Logs supprimés.");
  };
  const handleReset = () => {
    resetAll && resetAll();
    setMessage("Données, comptes et session réinitialisés. Retour en mode invité.");
  };
  // Import/export
  const handleImport = () => {
    if (importData(importText)) {
      addLog && addLog({ type: "admin", message: `Import de données par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
      setMessage("Import réussi.");
    } else {
      setMessage("Erreur d'import (JSON invalide)");
    }
  };

  // --- Gestion des comptes privilégiés : toujours via useAdminData ---
  const adminData = useAdminData();
  const privilegedAccounts = adminData.accounts;
  const addPrivAccount = adminData.addAccount;
  const removePrivAccount = adminData.removeAccount;
  const promotePrivAccount = adminData.promoteAccount;
  const changePrivPassword = adminData.changePassword;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-100 rounded-xl shadow-2xl p-8 mb-6 animate-fade-in">
      <h2 className="text-blue-800 font-extrabold text-2xl mb-6 tracking-tight">Administration</h2>
      <div className="mb-2 text-slate-600 text-sm">Connecté en tant que <b>{session?.identifiant}</b> (<b>{session?.role}</b>)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Utilisateurs (gendarmes) */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3 border border-slate-100">
          <h3 className="font-bold text-blue-700 mb-2">Ajouter un utilisateur</h3>
          <input className="border-2 border-blue-200 focus:border-blue-500 rounded px-3 py-2 transition outline-none" placeholder="Nom utilisateur" value={nom} onChange={e=>setNom(e.target.value)} />
          <button className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 font-semibold shadow hover:scale-105 transition" onClick={handleAdd}>Ajouter utilisateur</button>
          {message && <div className="text-green-700 font-semibold mt-2 animate-bounce-in">{message}</div>}
        </div>
        <div className="bg-white rounded-xl shadow p-6 border border-slate-100">
          <h3 className="font-bold text-blue-700 mb-2">Utilisateurs</h3>
          <table className="w-full text-sm">
            <colgroup>
              <col style={{ width: '70%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-3 py-2">Utilisateur</th>
                <th className="text-center px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.length === 0 && <tr><td colSpan={2} className="text-slate-400 text-center px-3 py-2">Aucun utilisateur</td></tr>}
              {utilisateurs.map(u => (
                <tr key={u.id} className="hover:bg-blue-50 transition">
                  <td className="font-semibold text-left px-3 py-2">{u.nom}</td>
                  <td className="text-center px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="text-blue-600 hover:scale-125 transition"
                        title="Modifier le nom"
                        onClick={()=>handleEditNom(u)}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16.862 5.487a2.1 2.1 0 0 1 2.97 2.97L8.5 19.79l-4.5 1.5 1.5-4.5 12.362-12.303Z"/><path d="M19 7l-2-2"/></svg>
                      </button>
                      <button
                        className="text-red-600 hover:scale-125 transition"
                        title="Supprimer"
                        onClick={()=>handleDelete(u.id, u.nom)}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Comptes privilégiés : TOUJOURS visible sous la liste des utilisateurs */}
      <div className="mb-8">
        <h3 className="font-bold text-blue-700 mb-2">Comptes privilégiés</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 bg-white rounded-xl shadow p-4 border border-slate-100">
            <h4 className="font-semibold mb-2">Ajouter un compte</h4>
            <input className="border border-slate-300 rounded px-2 py-1 mb-1 w-full" placeholder="Identifiant" value={newAccount.identifiant} onChange={e=>setNewAccount(a=>({...a,identifiant:e.target.value}))} />
            <input className="border border-slate-300 rounded px-2 py-1 mb-1 w-full" placeholder="Mot de passe" type="password" value={newAccount.mdp} onChange={e=>setNewAccount(a=>({...a,mdp:e.target.value}))} />
            <select className="border border-slate-300 rounded px-2 py-1 mb-2 w-full" value={newAccount.role} onChange={e=>setNewAccount(a=>({...a,role:e.target.value}))}>
              <option value="admin">admin</option>
              <option value="gestionnaire">gestionnaire</option>
              {isSuperadmin && <option value="superadmin">superadmin</option>}
            </select>
            <button className="bg-blue-700 text-white px-3 py-1" onClick={() => {
              addPrivAccount(newAccount.identifiant, newAccount.mdp, newAccount.role);
              setNewAccount({ identifiant: "", mdp: "", role: "admin" });
              setMessage("Compte ajouté !");
            }} disabled={!(isAdmin || isSuperadmin)}>Ajouter compte</button>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow p-4 border border-slate-100">
            <h4 className="font-semibold mb-2">Changer mot de passe</h4>
            <input className="border border-slate-300 rounded px-2 py-1 mb-1 w-full" placeholder="Identifiant" value={pwChange.identifiant} onChange={e=>setPwChange(a=>({...a,identifiant:e.target.value}))} />
            <input className="border border-slate-300 rounded px-2 py-1 mb-2 w-full" placeholder="Nouveau mot de passe" type="password" value={pwChange.mdp} onChange={e=>setPwChange(a=>({...a,mdp:e.target.value}))} />
            <button className="bg-blue-700 text-white px-3 py-1" onClick={() => {
              changePrivPassword(pwChange.identifiant, pwChange.mdp);
              setPwChange({ identifiant: "", mdp: "" });
              setMessage("Mot de passe changé !");
            }} disabled={!(isAdmin || isSuperadmin)}>Changer mot de passe</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '55%' }} />
            </colgroup>
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left px-3 py-2">Identifiant</th>
                <th className="text-center px-3 py-2">Rôle</th>
                <th className="text-center px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {privilegedAccounts && Object.entries(privilegedAccounts).length === 0 && (
                <tr><td colSpan={3} className="text-slate-400 text-center px-3 py-2">Aucun compte privilégié</td></tr>
              )}
              {privilegedAccounts && Object.entries(privilegedAccounts).map(([identifiant, acc]) => (
                <tr key={identifiant} className="hover:bg-blue-50 transition">
                  <td className="text-left px-3 py-2">{identifiant}</td>
                  <td className="text-center px-3 py-2">{acc.role}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {isSuperadmin && acc.role !== "superadmin" && (
                        <button className="text-green-700 text-xs border border-green-300 rounded px-2 py-1" onClick={()=>promotePrivAccount(identifiant,"superadmin")}>Promouvoir superadmin</button>
                      )}
                      {isAdmin && acc.role !== "admin" && (
                        <button className="text-blue-700 text-xs border border-blue-300 rounded px-2 py-1" onClick={()=>promotePrivAccount(identifiant,"admin")}>Promouvoir admin</button>
                      )}
                      {isAdmin && acc.role !== "gestionnaire" && (
                        <button className="text-purple-700 text-xs border border-purple-300 rounded px-2 py-1" onClick={()=>promotePrivAccount(identifiant,"gestionnaire")}>Promouvoir gestionnaire</button>
                      )}
                      {(isSuperadmin || (isAdmin && acc.role !== "superadmin")) && (
                        <button className="text-red-600 text-xs border border-red-300 rounded px-2 py-1" onClick={()=>removePrivAccount(identifiant)}>Supprimer</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Superadmin : suppression des logs et reset données alignés */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-6 items-center">
        {isSuperadmin && (
          <button className="flex-1 bg-gradient-to-r from-slate-700 to-slate-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:scale-105 transition-all text-base flex items-center justify-center gap-2" onClick={handleResetLogs}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/><path d="M9 10v6M15 10v6"/></svg>
            Supprimer tous les logs
          </button>
        )}
        <button className="flex-1 bg-gradient-to-r from-red-700 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:scale-105 transition-all text-base flex items-center justify-center gap-2" onClick={handleReset}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582M20 20v-5h-.581M19.418 9A7.978 7.978 0 0 0 12 4c-3.042 0-5.627 1.721-6.918 4.243M4.582 15A7.978 7.978 0 0 0 12 20c-3.042 0-5.627-1.721-6.918-4.243"/></svg>
          Réinitialiser toutes les données
        </button>
      </div>
      {/* Export/Import modernisé et bien séparé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Export données */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col gap-3">
          <h4 className="font-bold text-blue-700 mb-2 text-lg flex items-center gap-2"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17v-6m0 6l-3-3m3 3l3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg> Export des données</h4>
          <textarea className="w-full border-2 border-blue-200 rounded px-2 py-1 text-xs bg-slate-50" rows={6} readOnly value={exportData()} />
          <button
            className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 font-semibold shadow hover:scale-105 transition-all flex items-center gap-2 justify-center"
            onClick={() => {
              const blob = new Blob([exportData()], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${context}-psig-export-${new Date().toISOString().slice(0,10)}.json`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17v-6m0 6l-3-3m3 3l3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            Exporter en fichier
          </button>
        </div>
        {/* Import données */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100 flex flex-col gap-3">
          <h4 className="font-bold text-blue-700 mb-2 text-lg flex items-center gap-2"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 7v6m0 0l-3-3m3 3l3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg> Import des données</h4>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Coller les données JSON :</label>
            <textarea className="w-full border-2 border-blue-200 rounded px-2 py-1 text-xs bg-slate-50" rows={6} value={importText} onChange={e=>setImportText(e.target.value)} />
            <button className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 font-semibold shadow hover:scale-105 transition-all flex items-center gap-2 justify-center" onClick={handleImport}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 7v6m0 0l-3-3m3 3l3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              Importer depuis le texte
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <label className="font-semibold text-sm">Ou importer un fichier JSON :</label>
            <label className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 font-semibold shadow hover:scale-105 transition-all cursor-pointer flex items-center gap-2 justify-center">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 7v6m0 0l-3-3m3 3l3-3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              Importer depuis un fichier
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={e => {
                  const file = e.target.files && e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = evt => {
                      setImportText(evt.target.result);
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

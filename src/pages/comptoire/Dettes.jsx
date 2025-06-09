import React from "react";
import useComptoirData from "../../hooks/useComptoirData";

export default function Dettes() {
  const {
    data: { dettes },
    utilisateurs,
    payerDette,
    addLog,
    addDettePartielle,
    session
  } = useComptoirData();

  const canPay = session && ["admin", "superadmin"].includes(session.role);

  const handlePayer = (id, utilisateurId, montant) => {
    if (!canPay) return;
    payerDette(id);
    const user = utilisateurs.find(u => u.id === utilisateurId);
    addLog({ type: "dette", message: `Dette payée par ${user ? user.nom : utilisateurId} (${montant}€) validée par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-slate-100 rounded-xl shadow-2xl p-8 mb-6 animate-fade-in">
      <h2 className="text-yellow-800 font-extrabold text-2xl mb-6 tracking-tight">Gestion des dettes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm rounded-xl overflow-hidden table-fixed">
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '45%' }} />
          </colgroup>
          <thead><tr className="bg-yellow-100">
            <th className="text-left px-3 py-2">Gendarme</th>
            <th className="text-center px-3 py-2">Montant</th>
            <th className="text-center px-3 py-2">Date</th>
            <th className="text-center px-3 py-2">Statut</th>
            <th className="text-center px-3 py-2">Action</th>
          </tr></thead>
          <tbody>
            {dettes.length === 0 && <tr><td colSpan={5} className="text-slate-400">Aucune dette</td></tr>}
            {dettes.filter(dt => Array.isArray(utilisateurs) && utilisateurs.some(u => u.id === dt.utilisateurId)).map(dt => {
              const user = utilisateurs.find(u => u.id === dt.utilisateurId);
              return (
                <tr key={dt.id} className={dt.payee ? "bg-green-50" : "hover:bg-yellow-50 transition"}>
                  <td className="font-semibold text-left px-3 py-2">{user ? user.nom : dt.utilisateurId}</td>
                  <td className="text-center px-3 py-2">{Number(dt.montant).toFixed(2)}€</td>
                  <td className="text-center px-3 py-2">{new Date(dt.date).toLocaleDateString()}</td>
                  <td className="text-center px-3 py-2">{dt.payee ? <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Payée</span> : <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">En attente</span>}</td>
                  <td className="text-center px-3 py-2">
                    {!dt.payee && canPay && (
                      <>
                        <button className="bg-gradient-to-r from-green-600 to-green-400 text-white px-3 py-1 rounded-lg font-semibold shadow hover:scale-105 transition mr-2" onClick={()=>handlePayer(dt.id, dt.utilisateurId, Number(dt.montant).toFixed(2))}>Marquer payée</button>
                        <button className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 px-3 py-1 rounded-lg font-semibold shadow hover:scale-105 transition" onClick={() => {
        const montant = prompt('Montant à payer (en €) ?');
        const val = Number(montant);
        if (!val || val <= 0 || val >= dt.montant) return alert('Montant invalide.');
        addDettePartielle(dt, val);
        addLog({ type: "dette", message: `Paiement partiel de ${val.toFixed(2)}€ sur dette de ${Number(dt.montant).toFixed(2)}€ par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
        const reste = dt.montant - val;
        if (reste > 0.01) {
          addLog({ type: "dette", message: `Reste à payer : ${reste.toFixed(2)}€ pour ${utilisateurs.find(u=>u.id===dt.utilisateurId)?.nom||dt.utilisateurId}` , date: new Date().toISOString() });
        }
      }}>Paiement partiel</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

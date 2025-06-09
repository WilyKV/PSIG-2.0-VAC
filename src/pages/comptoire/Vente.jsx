import React, { useState } from "react";
import useComptoirData from "../../hooks/useComptoirData";
import useGeneralData from "../../hooks/useGeneralData";

export default function Vente() {
  const { utilisateurs } = useGeneralData();
  const {
    data: { produits },
    addVente,
    addDette,
    addLog,
    updateProduit
  } = useComptoirData();

  const [utilisateurId, setUtilisateurId] = useState("");
  const [selected, setSelected] = useState({}); // { produitId: quantite }
  const [message, setMessage] = useState("");

  const handleSelect = (id, q) => {
    setSelected((s) => ({ ...s, [id]: q }));
  };

  const handleVente = () => {
    if (!utilisateurId || Object.keys(selected).length === 0) {
      setMessage("Sélectionnez un gendarme et au moins un produit.");
      return;
    }
    // Vérif stock
    for (const pid in selected) {
      const prod = produits.find((p) => p.id === Number(pid));
      if (!prod || prod.stock < selected[pid]) {
        setMessage(`Stock insuffisant pour ${prod?.nom || pid}`);
        return;
      }
      if (selected[pid] <= 0) {
        setMessage("La quantité doit être supérieure à 0.");
        return;
      }
    }
    // Calcul total
    let total = 0;
    const items = Object.entries(selected)
      .filter(([_, quantite]) => quantite > 0)
      .map(([pid, quantite]) => {
        const prod = produits.find((p) => p.id === Number(pid));
        total += prod.prix * quantite;
        return { produitId: prod.id, quantite, prix: prod.prix };
      });
    if (items.length === 0) {
      setMessage("Sélectionnez au moins un produit avec une quantité valide.");
      return;
    }
    // Ajout vente
    addVente({ date: new Date().toISOString(), utilisateurId: Number(utilisateurId), items, total });
    // Ajout dette si total > 0
    if (total > 0) {
      addDette({ utilisateurId: Number(utilisateurId), montant: total, date: new Date().toISOString(), payee: false });
    }
    // Log
    const user = utilisateurs.find(u=>u.id===Number(utilisateurId));
    addLog({ type: "vente", message: `Vente à ${user ? user.nom : utilisateurId} pour ${total}€`, date: new Date().toISOString() });
    // MAJ stock
    items.forEach(({ produitId, quantite }) => {
      const prod = produits.find((p) => p.id === produitId);
      updateProduit(produitId, { stock: prod.stock - quantite });
    });
    setSelected({});
    setMessage("Vente enregistrée !");
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow border border-slate-100 p-8 mb-8 animate-fade-in">
      <h2 className="text-slate-800 font-bold text-xl mb-6 tracking-tight uppercase">Nouvelle vente</h2>
      <div className="mb-6">
        <label className="block mb-2 font-medium text-slate-700">Gendarme :</label>
        <select className="border border-slate-300 focus:border-slate-500 rounded px-3 py-2 transition outline-none bg-white/95 appearance-none pr-8" value={utilisateurId} onChange={e=>setUtilisateurId(e.target.value)}>
          <option value="">-- Sélectionner --</option>
          {utilisateurs.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
        </select>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium text-slate-700">Produits :</label>
        <div className="overflow-x-auto rounded border border-slate-100 bg-white/90">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: '40%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="px-3 py-2 font-semibold text-left">Produit</th>
                <th className="px-3 py-2 font-semibold text-center">Prix</th>
                <th className="px-3 py-2 font-semibold text-center">Stock</th>
                <th className="px-3 py-2 font-semibold text-center">Quantité</th>
              </tr>
            </thead>
            <tbody>
              {produits.map(p => (
                <tr key={p.id} className={selected[p.id] > 0 ? "bg-slate-50 transition" : ""}>
                  <td className="px-3 py-2 font-medium text-slate-800 align-middle text-left truncate">{p.nom}</td>
                  <td className="px-3 py-2 align-middle text-center">{Number(p.prix).toFixed(2)}€</td>
                  <td className={"px-3 py-2 align-middle text-center " + (p.stock === 0 ? "text-red-500 font-bold" : "")}>{p.stock}</td>
                  <td className="px-3 py-2 align-middle flex items-center gap-1 justify-center">
                    <button
                      className="bg-slate-200 text-slate-700 rounded-l px-2 py-1 font-bold text-base disabled:opacity-40"
                      disabled={p.stock === 0 || (selected[p.id]||0) <= 0}
                      onClick={() => handleSelect(p.id, Math.max(0, (selected[p.id]||0) - 1))}
                      tabIndex={-1}
                      aria-label="Diminuer la quantité"
                    >-</button>
                    <input
                      type="number"
                      min="0"
                      max={p.stock}
                      value={selected[p.id] !== undefined ? selected[p.id] : ""}
                      onChange={e=>handleSelect(p.id, Number(e.target.value)||0)}
                      className="w-10 border border-slate-300 rounded-none px-1 py-1 focus:border-slate-500 transition outline-none bg-white/95 disabled:bg-slate-100 text-center"
                      disabled={p.stock === 0}
                      style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    />
                    <button
                      className="bg-slate-200 text-slate-700 rounded-r px-2 py-1 font-bold text-base disabled:opacity-40"
                      disabled={p.stock === 0 || (selected[p.id]||0) >= p.stock}
                      onClick={() => handleSelect(p.id, Math.min(p.stock, (selected[p.id]||0) + 1))}
                      tabIndex={-1}
                      aria-label="Augmenter la quantité"
                    >+</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          className={
            "px-7 py-2 rounded font-semibold shadow hover:scale-105 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400/60 focus:ring-offset-2 flex items-center justify-center " +
            (utilisateurId && Object.keys(selected).some(pid => selected[pid] > 0)
              ? "bg-[#14213d] text-white hover:bg-[#1a2550] cursor-pointer"
              : "bg-slate-300 text-slate-400 cursor-not-allowed")
          }
          onClick={handleVente}
          disabled={!(utilisateurId && Object.keys(selected).some(pid => selected[pid] > 0))}
        >
          Valider la vente
        </button>
        {/* Affichage du total sélectionné */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-800 font-bold text-lg shadow-sm animate-fade-in">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-500"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>
          Total :
          <span className="text-2xl font-extrabold">{Object.entries(selected).reduce((sum, [pid, q]) => {
            const prod = produits.find(p => p.id === Number(pid));
            return sum + (prod ? prod.prix * q : 0);
          }, 0).toFixed(2)} €</span>
        </div>
      </div>
      {message && <div className={"mt-5 font-medium animate-bounce-in " + (message.includes("Sélectionnez un gendarme") ? "text-red-600" : "text-green-700")}>{message}</div>}
    </div>
  );
}

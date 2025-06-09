import React, { useState } from "react";
import useComptoirData from "../../hooks/useComptoirData";

const icons = [
  // Quelques SVG sobres pour illustrer les produits (rotation pour variété)
  <svg key="cafe" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-amber-700"><path d="M6 19h12a2 2 0 0 0 2-2V7H4v10a2 2 0 0 0 2 2Z"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>,
  <svg key="canette" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-blue-700"><rect x="7" y="2" width="10" height="20" rx="3"/><path d="M7 6h10"/></svg>,
  <svg key="barre" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-pink-700"><rect x="5" y="7" width="14" height="10" rx="2"/><path d="M7 7v10M17 7v10"/></svg>,
  <svg key="eau" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-cyan-700"><ellipse cx="12" cy="12" rx="8" ry="10"/><path d="M12 2v20"/></svg>
];

export default function Stock() {
  const {
    data: { produits },
    addProduit,
    updateProduit,
    removeProduit,
    addLog,
    session
  } = useComptoirData();

  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("");
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  // Inline editing states
  const [editNameId, setEditNameId] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [editPrixId, setEditPrixId] = useState(null);
  const [editPrixValue, setEditPrixValue] = useState("");

  const canManage = session && ["admin", "superadmin", "gestionnaire"].includes(session.role);

  const handleAdd = () => {
    if (!canManage) return;
    if (!nom || !prix || !stock) {
      setMessage("Remplir tous les champs.");
      return;
    }
    addProduit({ nom, prix: Number(prix), stock: Number(stock) });
    addLog({ type: "stock", message: `Ajout produit ${nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setNom(""); setPrix(""); setStock(""); setMessage("Produit ajouté !");
  };

  const handleEdit = (p) => {
    if (!canManage) return;
    setEditId(p.id); setNom(p.nom); setPrix(p.prix); setStock(p.stock);
  };
  const handleUpdate = () => {
    if (!canManage) return;
    updateProduit(editId, { nom, prix: Number(prix), stock: Number(stock) });
    addLog({ type: "stock", message: `MAJ produit ${nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setEditId(null); setNom(""); setPrix(""); setStock(""); setMessage("Produit modifié !");
  };
  const handleDelete = (id, nom) => {
    if (!canManage) return;
    removeProduit(id);
    addLog({ type: "stock", message: `Suppression produit ${nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
    setMessage("Produit supprimé.");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-blue-800 font-extrabold text-2xl mb-6 tracking-tight">Gestion du stock</h2>
      {message && <div className="text-green-700 font-semibold mb-4 animate-bounce-in">{message}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {/* Cards produits */}
        {produits.length === 0 && <div className="col-span-full text-slate-400">Aucun produit</div>}
        {produits.map((p, i) => (
          <div key={p.id} className={`relative bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col items-center border border-slate-100 group hover:shadow-2xl transition ${p.stock === 0 ? "opacity-60" : ""}`}>
            <div className="mb-2">{icons[i % icons.length]}</div>
            {/* Nom inline editable */}
            <div className="font-bold text-lg text-slate-800 mb-1 cursor-pointer" onClick={() => { if (canManage) { setEditNameId(p.id); setEditNameValue(p.nom); }}}>
              {editNameId === p.id ? (
                <input
                  className="border border-blue-300 rounded px-2 py-1 text-lg font-bold w-32"
                  value={editNameValue}
                  autoFocus
                  onChange={e => setEditNameValue(e.target.value)}
                  onBlur={() => {
                    if (editNameValue.trim() && editNameValue !== p.nom) {
                      updateProduit(p.id, { nom: editNameValue.trim() });
                      addLog({ type: "stock", message: `MAJ nom produit ${p.nom} → ${editNameValue.trim()} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
                    }
                    setEditNameId(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") e.target.blur();
                  }}
                />
              ) : (
                p.nom
              )}
            </div>
            {/* Prix inline editable */}
            <div className="text-blue-700 font-semibold text-xl mb-1 cursor-pointer" onClick={() => { if (canManage) { setEditPrixId(p.id); setEditPrixValue(p.prix); }}}>
              {editPrixId === p.id ? (
                <input
                  className="border border-blue-300 rounded px-2 py-1 text-xl font-semibold w-20"
                  type="number"
                  value={editPrixValue}
                  autoFocus
                  onChange={e => setEditPrixValue(e.target.value)}
                  onBlur={() => {
                    if (editPrixValue !== "" && Number(editPrixValue) !== p.prix) {
                      updateProduit(p.id, { prix: Number(editPrixValue) });
                      addLog({ type: "stock", message: `MAJ prix produit ${p.nom} → ${editPrixValue} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
                    }
                    setEditPrixId(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") e.target.blur();
                  }}
                />
              ) : (
                Number(p.prix).toFixed(2) + "€"
              )}
            </div>
            {/* Stock +/– en carré à côté de l’étiquette */}
            <div className="mb-2 flex items-center gap-2">
              <button
                className="w-8 h-8 rounded border border-blue-200 bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center text-lg font-bold transition"
                title="Retirer 1 du stock"
                onClick={() => {
                  if (p.stock > 0) {
                    updateProduit(p.id, { stock: p.stock - 1 });
                    addLog({ type: "stock", message: `Retrait 1 du stock de ${p.nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
                  }
                }}
                disabled={p.stock === 0}
              >
                –
              </button>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-red-200 text-red-800" : p.stock < 5 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>Stock : {p.stock}</span>
              <button
                className="w-8 h-8 rounded border border-blue-200 bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center text-lg font-bold transition"
                title="Ajouter 1 au stock"
                onClick={() => {
                  updateProduit(p.id, { stock: p.stock + 1 });
                  addLog({ type: "stock", message: `Ajout 1 au stock de ${p.nom} par ${session.identifiant} (${session.role})`, date: new Date().toISOString() });
                }}
              >
                +
              </button>
            </div>
            {canManage && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                {/* Suppression uniquement */}
                <button className="text-red-600 hover:scale-125" title="Supprimer" onClick={()=>handleDelete(p.id, p.nom)}>🗑️</button>
              </div>
            )}
          </div>
        ))}
        {/* Card d'ajout/édition à la fin */}
        {canManage && (
          <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-slate-100 relative group hover:shadow-2xl transition">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-700">{editId ? "✏️" : "+"}</span>
              <span className="font-bold text-blue-700">{editId ? "Modifier" : "Ajouter"} un produit</span>
            </div>
            <input className="border-2 border-blue-200 focus:border-blue-500 rounded px-3 py-2 transition outline-none" placeholder="Nom" value={nom} onChange={e=>setNom(e.target.value)} />
            <div className="flex gap-2">
              <input className="border-2 border-blue-200 focus:border-blue-500 rounded px-3 py-2 transition outline-none w-1/2" placeholder="Prix (€)" type="number" value={prix} onChange={e=>setPrix(e.target.value)} />
              <input className="border-2 border-blue-200 focus:border-blue-500 rounded px-3 py-2 transition outline-none w-1/2" placeholder="Stock" type="number" value={stock} onChange={e=>setStock(e.target.value)} />
            </div>
            {editId ? (
              <button className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition" onClick={handleUpdate}>Modifier</button>
            ) : (
              <button className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition" onClick={handleAdd}>Ajouter</button>
            )}
            {editId && (
              <button className="text-xs text-slate-400 underline mt-1" onClick={()=>{setEditId(null);setNom("");setPrix("");setStock("");}}>Annuler</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

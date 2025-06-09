import React from "react";
import useAdminData from "../../hooks/useAdminData";

export default function AccueilArmurerie({
  setPage,
  patrouilles = [],
  vehicules = [],
  handleRetourPatrouille,
  fiches = [], // Ajout des fiches pour l'historique
}) {
  const { session } = useAdminData();
  const isInvite = session && session.role === "invite";
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 animate-fade-in flex flex-col items-center">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col items-center">
        <div className="bg-white rounded-xl shadow p-6 mb-6 border border-blue-100 w-full">
          <h2 className="text-blue-800 font-bold text-lg mb-2">
            Patrouilles en cours
          </h2>
          <table className="w-full text-sm mb-2">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-2 py-2 text-left">Équipe</th>
                <th
                  className="px-1 py-2 text-center font-normal"
                  style={{ width: "1%" }}
                >
                  Horaire
                </th>
                <th className="px-2 py-2 text-center font-normal">
                  Véhicule
                </th>
                <th className="px-2 py-2 text-center font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {patrouilles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400">
                    Aucune patrouille
                  </td>
                </tr>
              ) : (
                patrouilles.map((p) => (
                  <tr key={p.id}>
                    <td className="px-2 py-2">{p.equipe.join(", ")}</td>
                    <td className="px-1 py-2 text-center">{p.horaire}</td>
                    <td className="px-2 py-2 text-center">
                      {p.vehicule || p.vehiculeNom || (vehicules.find((v) => v.id === p.vlId)?.nom) || "-"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        className="bg-blue-700 text-white px-3 py-1 rounded shadow hover:bg-blue-800 transition"
                        onClick={() =>
                          handleRetourPatrouille && handleRetourPatrouille(p)
                        }
                      >
                        Retour patrouille
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 shadow mb-8 text-lg transition border-0"
          style={{ border: "none" }}
          onClick={() => setPage && setPage("fiche")}
        >
          Nouvelle patrouille
        </button>
        {/* Historique des patrouilles (fiches) */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100 w-full mb-8">
          <h2 className="text-blue-800 font-bold text-lg mb-2">
            Historique des patrouilles
          </h2>
          <table className="w-full text-sm mb-2">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Équipe</th>
                <th className="px-2 py-2 text-center">Horaire</th>
                <th className="px-2 py-2 text-center">Véhicule</th>
              </tr>
            </thead>
            <tbody>
              {(!fiches || fiches.length === 0) ? (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400">
                    Aucun historique
                  </td>
                </tr>
              ) : (
                fiches
                  .slice()
                  .reverse()
                  .map((f) => (
                    <tr key={f.id}>
                      <td className="px-2 py-2">
                        {new Date(f.date).toLocaleString()}
                      </td>
                      <td className="px-2 py-2">
                        {(f.personnels || f.equipe || []).map((p) => p.nom || p).join(", ")}
                      </td>
                      <td className="px-2 py-2 text-center">{f.horaire}</td>
                      <td className="px-2 py-2 text-center">
                        {f.vehicule || f.vehiculeNom || (vehicules.find((v) => v.id === f.vlId || v.id === f.vehiculeId)?.nom) || "-"}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from "react";

const tiles = [
  {
    key: "comptoir",
    label: "Comptoir",
    icon: (
      <img
        src={process.env.BASE_URL ? process.env.BASE_URL + "logoComptoire.png" : "/logoComptoire.png"}
        alt="Logo Comptoir"
        className="mx-auto rounded-full shadow-lg border-2 border-blue-200 bg-white"
        style={{ width: 64, height: 64, objectFit: "contain" }}
      />
    ),
    description: "Gestion du comptoir, ventes, dettes, stock...",
    action: "comptoir"
  },
  {
    key: "armurerie",
    label: "Armurerie",
    icon: (
      <img
        src={process.env.BASE_URL ? process.env.BASE_URL + "logoArmurerie.png" : "/logoArmurerie.png"}
        alt="Logo Armurerie"
        className="mx-auto rounded-full shadow-lg border-2 border-blue-200 bg-white"
        style={{ width: 64, height: 64, objectFit: "contain" }}
      />
    ),
    description: "Gestion de l'armurerie, inventaire, prêts...",
    action: "armurerie"
  },
  {
    key: "vehicule",
    label: "Véhicule",
    icon: (
      <img
        src={process.env.BASE_URL ? process.env.BASE_URL + "logoVehicule.png" : "/logoVehicule.png"}
        alt="Logo Vehicule"
        className="mx-auto rounded-full shadow-lg border-2 border-blue-200 bg-white"
        style={{ width: 64, height: 64, objectFit: "contain" }}
      />
    ),
    description: "Gestion des véhicules, affectations, entretiens...",
    action: "vehicule"
  }
];

export default function Accueil({ onComptoirClick, onArmurerieClick, onVehiculeClick }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-10 tracking-tight drop-shadow-lg text-center">
        PSIG 2.0<br />
        L'opération numérique est lancée
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl px-4">
        {tiles.map(tile => (
          <button
            key={tile.key}
            className={
              "rounded-2xl shadow-xl bg-white/90 border-2 border-slate-100 hover:border-blue-400 hover:scale-105 transition-all flex flex-col items-center p-8 gap-4 " +
              (tile.action ? "cursor-pointer" : "opacity-60 cursor-not-allowed")
            }
            onClick={
              tile.action === "comptoir" ? onComptoirClick :
              tile.action === "armurerie" ? onArmurerieClick :
              tile.action === "vehicule" ? onVehiculeClick :
              undefined
            }
            disabled={!tile.action}
            style={{ minHeight: 260 }}
          >
            <div>{tile.icon}</div>
            <div className="text-2xl font-bold mb-2 text-slate-800">{tile.label}</div>
            <div className="text-slate-500 text-center text-base">{tile.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

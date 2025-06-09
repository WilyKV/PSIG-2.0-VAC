import React from "react";
import useComptoirData from "../hooks/useComptoirData";

const NAV = [
	{
		key: "vente",
		label: "Vente",
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
				className="text-slate-500"
			>
				<path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
				<circle cx="7" cy="21" r="1" />
				<circle cx="20" cy="21" r="1" />
			</svg>
		),
	},
	{
		key: "stock",
		label: "Stock",
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
				className="text-slate-500"
			>
				<rect x="3" y="7" width="18" height="13" rx="2" />
				<path d="M16 3v4M8 3v4" />
			</svg>
		),
	},
	{
		key: "dettes",
		label: "Dettes",
		icon: (
			<svg
				width="18"
			height="18"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
				className="text-slate-500"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 8v4l3 3" />
			</svg>
		),
	},
	{
		key: "logs",
		label: "Logs",
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
				className="text-slate-500"
			>
				<rect x="4" y="4" width="16" height="16" rx="2" />
				<path d="M8 2v4M16 2v4M4 10h16" />
			</svg>
		),
	},
	{
		key: "admin",
		label: "Admin",
		icon: (
			<svg
				width="18"
				height="18"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				viewBox="0 0 24 24"
				className="text-slate-500"
			>
				<circle cx="12" cy="12" r="3" />
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
			</svg>
		),
	},
];

export default function Menu({ page, setPage, session, logout, onLoginClick }) {
	// Filtrer les onglets selon le rôle
	let navFiltered = NAV;
	if (session) {
		if (session.role === "invite") {
		navFiltered = NAV.filter((item) =>
			["vente", "dettes", "logs"].includes(item.key)
		);
		} else if (session.role === "gestionnaire") {
			navFiltered = NAV.filter((item) =>
				["vente", "dettes", "stock"].includes(item.key)
			);
		} else if (session.role === "admin") {
			navFiltered = NAV.filter((item) =>
				["vente", "stock", "logs", "dettes", "admin"].includes(item.key)
			);
		} else if (session.role === "superadmin") {
      		navFiltered = NAV;
		}
	}
	return (
		<div className="w-full">
			{/* Première ligne : header bleu marine foncé, largeur max identique au contenu */}
			<div className="bg-[#14213d] text-white flex items-center justify-center py-3 px-4 w-full">
				<div className="max-w-4xl w-full mx-auto flex items-center justify-center">
					<span className="flex items-center gap-2 text-xl font-bold mx-auto">
					  {/* Nouveau bouclier SVG à gauche */}
					  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{marginRight: 8}}>
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="50%" stopColor="#d1d5db"/>
          <stop offset="50%" stopColor="#dc2626"/>
        </linearGradient>
      </defs>
      <path d="M16 3C21 5 27 5.5 27 10.5C27 23 16 29 16 29C16 29 5 23 5 10.5C5 5.5 11 5 16 3Z" fill="url(#shieldGrad)" stroke="#1e293b" strokeWidth="1.5"/>
      <path d="M16 5V27" stroke="#fff" strokeWidth="1.2" strokeDasharray="2 2"/>
    </svg>
					  <span>Comptoir PSIG - Gestion interne</span>
					  {/* Nouveau gendarme SVG à droite */}
					  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" style={{marginLeft: 8}}>
      <ellipse cx="16" cy="19" rx="8" ry="6" fill="#e5e7eb"/>
      <circle cx="16" cy="13" r="5" fill="#1e293b" stroke="#fff" strokeWidth="1.2"/>
      <rect x="11" y="7.5" width="10" height="4" rx="2" fill="#2563eb" stroke="#fff" strokeWidth="1"/>
      <rect x="13.5" y="10.5" width="5" height="1.5" rx="0.75" fill="#fff"/>
      <rect x="13.5" y="22" width="5" height="2.5" rx="1.2" fill="#2563eb"/>
      <ellipse cx="16" cy="13" rx="2.2" ry="2.5" fill="#fff" opacity=".15"/>
    </svg>
					</span>
				</div>
			</div>
			{/* Deuxième ligne : menu à gauche, utilisateur à droite, largeur max identique */}
			<div className="backdrop-blur-lg bg-white/80 shadow border-b border-slate-100 flex items-center justify-between px-4 py-2 w-full">
				<div className="max-w-4xl w-full mx-auto flex items-center justify-between">
					<div className="flex flex-wrap gap-1 sm:gap-2">
						{navFiltered.map((item) => (
							<button
								key={item.key}
								className={`px-3 py-1.5 rounded-md font-medium transition-all duration-150 flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700/90 ${
									page === item.key
										? "bg-slate-200 text-slate-900 shadow-sm"
										: "hover:bg-slate-100"
								}`}
								onClick={() => setPage(item.key)}
								style={{ fontSize: "1rem" }}
							>
								<span className="text-base">{item.icon}</span>
								{item.label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-2">
						{session && session.role === "invite" && (
						  <>
						    <span className="text-xs text-slate-700 font-semibold bg-slate-100 rounded px-2 py-1">Profil invité</span>
						    <button
						      onClick={onLoginClick}
						      className="text-blue-700 border border-blue-300 rounded px-2 py-1 text-xs hover:bg-blue-50"
						    >
						      Connexion
						    </button>
						  </>
						)}
						{session && session.role !== "invite" && (
							<span className="text-xs text-slate-700 font-semibold bg-slate-100 rounded px-2 py-1">
								{session.identifiant} <span className="uppercase font-bold">({session.role})</span>
							</span>
						)}
						{session && session.role !== "invite" && (
							<button
								onClick={logout}
								className="text-slate-500 hover:text-red-600 text-xs border border-slate-300 rounded px-2 py-1 ml-1"
							>
								Déconnexion
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

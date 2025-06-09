import React, { useState, useRef, useEffect } from "react";
import useArmurerieData from "../../hooks/useArmurerieData";
import useAdminData from "../../hooks/useAdminData";
import useVehiculeData from "../../hooks/useVehiculeData";
import MenuArmurerie from "../../components/MenuArmurerie";
import Admin from "./Admin";
import Logs from "./Logs";
import Login from "./Login";
import AccueilArmurerie from "./Accueil";

function ArmurerieMain({ produits = [], utilisateurs = [], vehicules = [], patrouilles, setPatrouilles, addFiche, ...props }) {
  const { session } = useAdminData();
  const isInvite = session && session.role === "invite";

  const { addLog, updateProduit } = props;
  const [search, setSearch] = useState("");
  const [utilisateurId, setUtilisateurId] = useState("");
  const [selected, setSelected] = useState({});
  const [message, setMessage] = useState("");
  const [horaire, setHoraire] = useState("");
  const [horaireAutre, setHoraireAutre] = useState("");
  const [sacNumero, setSacNumero] = useState("");
  const [personnels, setPersonnels] = useState([]); // multi-select
  const [observationsGenerales, setObservationsGenerales] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [vlId, setVlId] = useState(""); // Ajout de l'état pour le véhicule
  // Pour chaque matériel sélectionné : heure départ, retour, observation
  const [materielDetails, setMaterielDetails] = useState({});

  // Patrouilles en cours (persistantes)
  // Utilise le state global du hook
  const [patrouilleRetour, setPatrouilleRetour] = useState(null); // Patrouille en retour

  // Fusionner tous les produits dans un seul tableau
  const produitsFiltres = produits.filter(
    p => p.nom.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id, q) => {
    setSelected((s) => ({ ...s, [id]: q }));
    setMaterielDetails((d) => ({ ...d, [id]: d[id] || { heureDepart: "", heureRetour: "", numero: "", observation: "" } }));
  };

  const handleMaterielDetail = (id, field, value) => {
    setMaterielDetails((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  };

  // Refactor: numéro selection is now an array per matériel
  const handleMaterielNumeroToggle = (id, numero) => {
    setMaterielDetails((d) => {
      const prev = d[id]?.numeros || [];
      const exists = prev.includes(numero);
      const nextNumeros = exists ? prev.filter(n => n !== numero) : [...prev, numero];
      return {
        ...d,
        [id]: {
          ...d[id],
          numeros: nextNumeros,
        },
      };
    });
  };

  // Dropdown custom pour personnels (multi-select, tous visibles)
  const [showPersonnels, setShowPersonnels] = useState(false);
  const personnelsDropdownRef = useRef();
  // Fermer le dropdown personnels si clic à côté
  useEffect(() => {
    if (!showPersonnels) return;
    const handleClick = (e) => {
      if (personnelsDropdownRef.current && !personnelsDropdownRef.current.contains(e.target)) {
        setShowPersonnels(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPersonnels]);
  const togglePersonnel = (id) => {
    setPersonnels((prev) =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };
  const personnelsNoms = utilisateurs.filter(u=>personnels.includes(u.id)).map(u=>u.nom).join(", ");

  const canAffect = session && ["admin", "superadmin", "gestionnaire", "invite"].includes(session.role);

  const handleAffectation = () => {
    // Nouvelle logique : au moins un matériel avec numéros sélectionnés
    const materielIdsWithNumeros = Object.keys(materielDetails).filter(pid => {
      const nums = materielDetails[pid]?.numeros;
      return Array.isArray(nums) && nums.length > 0;
    });
    if (!utilisateurId || materielIdsWithNumeros.length === 0) {
      setMessage("Sélectionnez un gendarme et au moins un équipement.");
      return;
    }
    const user = utilisateurs.find(u=>u.id===Number(utilisateurId));
    const personnelsNoms = utilisateurs.filter(u=>personnels.includes(u.id)).map(u=>u.nom).join(", ");
    // Ajout persistant de la fiche de perception
    addFiche && addFiche({
      date: new Date().toISOString(),
      utilisateurId: Number(utilisateurId),
      utilisateurNom: user ? user.nom : utilisateurId,
      personnels: personnels.map(id => ({ id, nom: utilisateurs.find(u=>u.id===id)?.nom || id })),
      horaire: horaire === "Autre" ? horaireAutre : horaire,
      sac: sacNumero,
      vehiculeId: vlId,
      vehiculeNom: vehicules.find(v=>v.id==vlId)?.nom || "",
      materiels: materielIdsWithNumeros.map(pid => ({
        produitId: Number(pid),
        nom: produits.find(p=>p.id===Number(pid))?.nom || pid,
        numeros: materielDetails[pid]?.numeros || [],
        details: materielDetails[pid] || {}
      })),
      observations: observationsGenerales
    });
    // Ajout de la patrouille en cours
    if (setPatrouilles) {
      const nouvellePatrouille = {
        id: Date.now(),
        equipe: personnels.map(id => utilisateurs.find(u=>u.id===id)?.nom || id),
        personnels: personnels.map(id => ({ id, nom: utilisateurs.find(u=>u.id===id)?.nom || id })),
        horaire: horaire === "Autre" ? horaireAutre : horaire,
        sac: sacNumero,
        vlId: vlId,
        vehicule: vehicules.find(v=>v.id==vlId)?.nom || "",
        materiels: materielIdsWithNumeros.map(pid => ({
          produitId: Number(pid),
          nom: produits.find(p=>p.id===Number(pid))?.nom || pid,
          numeros: materielDetails[pid]?.numeros || [],
          details: materielDetails[pid] || {}
        })),
        observations: observationsGenerales
      };
      setPatrouilles([...(patrouilles || []), nouvellePatrouille]);
    }
    addLog({
      type: "armurerie",
      message: `Fiche perception: Date: ${new Date().toISOString().slice(0,10)}, Horaire: ${horaire === "Autre" ? horaireAutre : horaire}, Sac: ${sacNumero}, Perso: ${personnelsNoms}, Utilisateur: ${user ? user.nom : utilisateurId}, Matériel: ` +
        materielIdsWithNumeros.map(pid => {
          const prod = produits.find(p=>p.id===Number(pid));
          const det = materielDetails[pid] || {};
          const nums = det.numeros ? det.numeros.join("/") : "-";
          return `${prod ? prod.nom : pid} (Départ: ${det.heureDepart || "-"}, Retour: ${det.heureRetour || "-"}, N°: ${nums}, Obs: ${det.observation || "-"})`;
        }).join(" | ") +
        `, Signature: ${user ? user.nom : utilisateurId}, Observations: ${observationsGenerales}`,
      date: new Date().toISOString()
    });
    setSelected({});
    setMaterielDetails({});
    setPersonnels([]);
    setSacNumero("");
    setHoraire("");
    setHoraireAutre("");
    setUtilisateurId("");
    setObservationsGenerales("");
    setMessage("Fiche de perception enregistrée !");
    // Redirection vers l'accueil après validation
    if (props.setPage) props.setPage("accueil");
  };

  // Gestion du retour de patrouille
  const [retourGendarme, setRetourGendarme] = useState("");
  const [retourConfirmation, setRetourConfirmation] = useState(false);
  const [retourMessage, setRetourMessage] = useState("");
  const [retourMaterielRendu, setRetourMaterielRendu] = useState({});
  const handleRetourPatrouille = (patrouille) => {
    setPatrouilleRetour(patrouille);
    setRetourGendarme("");
    setRetourConfirmation(false);
    setRetourMessage("");
    // Initialiser l'état des cases à cocher pour chaque matériel
    const renduInit = {};
    patrouille.materiels.forEach((m, i) => { renduInit[i] = false; });
    setRetourMaterielRendu(renduInit);
  };
  const handleToggleRendu = (idx) => {
    setRetourMaterielRendu(r => ({ ...r, [idx]: !r[idx] }));
  };
  const handleValiderRetour = () => {
    if (!retourGendarme) {
      setRetourMessage("Sélectionnez le gendarme effectuant le retour.");
      return;
    }
    // Log retour patrouille avec détail matériel rendu
    const materielLog = patrouilleRetour.materiels.map((m, i) => `${m.nom} [${(m.numeros||[]).map(num => retourMaterielRendu[`${i}_${num}`] ? `#${num}:Rendu` : `#${num}:Non rendu`).join(", ")}]`).join(" | ");
    props.addLog && props.addLog({
      type: "armurerie",
      message: `Retour patrouille: Date: ${new Date().toISOString().slice(0,10)}, Horaire: ${patrouilleRetour.horaire}, Sac: ${patrouilleRetour.sac}, VL: ${vehicules.find(v=>v.id===patrouilleRetour.vlId)?.nom || "-"}, Équipe: ${patrouilleRetour.equipe.join(", ")}, Matériel: ${materielLog}, Retour par: ${utilisateurs.find(u=>u.id===Number(retourGendarme))?.nom || retourGendarme}`,
      date: new Date().toISOString(),
      retour: true,
      patrouilleId: patrouilleRetour.id,
      materielRendu: retourMaterielRendu
    });
    // Suppression de la patrouille dans le state global
    setPatrouilles && setPatrouilles((patrouilles || []).filter(pt => pt.id !== patrouilleRetour.id));
    setPatrouilleRetour(null);
    setRetourGendarme("");
    setRetourConfirmation(false);
    setRetourMessage("Retour enregistré !");
    setRetourMaterielRendu({});
  };

  // Ajout utilitaire pour savoir si un numéro est en cours de perception (non rendu)
  const numerosEnCours = {};
  patrouilles.forEach(patrouille => {
    patrouille.materiels.forEach(m => {
      (m.numeros || []).forEach(num => {
        if (!numerosEnCours[m.produitId]) numerosEnCours[m.produitId] = new Set();
        numerosEnCours[m.produitId].add(String(num));
      });
    });
  });
  // Si une patrouille est en retour, retirer les numéros rendus
  if (patrouilleRetour && patrouilleRetour.materiels) {
    patrouilleRetour.materiels.forEach((m, i) => {
      if (Array.isArray(m.numeros)) {
        m.numeros.forEach(num => {
          if (retourMaterielRendu[i]) {
            // Si rendu, on retire le numéro de la liste en cours
            if (numerosEnCours[m.produitId]) numerosEnCours[m.produitId].delete(String(num));
          }
        });
      }
    });
  }

  // Utilitaire pour savoir si un numéro d'arme est sélectionné
  const isArmeNumeroSelected = (armeNom) => {
    const arme = produits.find(prod => prod.nom.toLowerCase() === armeNom.toLowerCase());
    if (!arme) return false;
    const nums = materielDetails[arme.id]?.numeros;
    return Array.isArray(nums) && nums.length > 0;
  };
  // Filtrage dynamique des produits à afficher (chargeurs visibles seulement si arme sélectionnée)
  const produitsFiltresAffiches = produitsFiltres.filter(p => {
    if (p.nom.toLowerCase() === "chargeurs ump9") {
      return isArmeNumeroSelected("UMP9");
    }
    if (p.nom.toLowerCase() === "chargeurs g36") {
      return isArmeNumeroSelected("G36");
    }
    return true;
  });

  // Auto-check 'recup' pour matériels avec numéros sélectionnés
  useEffect(() => {
    // For each matériel, if it has numéros selected and recup is not set, set recup to true
    setMaterielDetails(prev => {
      let changed = false;
      const next = { ...prev };
      Object.entries(prev).forEach(([pid, details]) => {
        if (Array.isArray(details.numeros) && details.numeros.length > 0 && !details.recup) {
          next[pid] = { ...details, recup: true };
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [materielDetails]);

  return (
    <div className="max-w-4xl mx-auto">
        {/* Fiche de perception dans une card */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-100">
          {/* ...tout le contenu du formulaire fiche de perception ici... */}
          {/* ...début du formulaire (titre, champs, etc.)... */}
          <h1 className="text-3xl font-extrabold flex items-center gap-2 mb-6 text-blue-900 drop-shadow-sm tracking-tight">
            <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="7" rx="2" fill="#e0e7ff" stroke="#2563eb"/><rect x="7" y="5" width="10" height="5" rx="1.5" fill="#fff" stroke="#2563eb"/><path d="M12 17v2" stroke="#2563eb"/><circle cx="12" cy="21" r="1.5" fill="#2563eb"/></svg>
            Armurerie - Fiche de perception
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Horaires en ligne cliquables */}
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Horaire</label>
              <div className="flex gap-2">
                {["14-18h", "15-19h", "22-4h", "Autre"].map(h => (
                  <button
                    key={h}
                    className={`px-4 py-2 rounded-lg font-semibold border transition ${horaire === h ? "bg-blue-700 text-white border-blue-700" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
                    onClick={() => setHoraire(h)}
                    type="button"
                  >
                    {h}
                  </button>
                ))}
              </div>
              {horaire === "Autre" && (
                <input
                  className="mt-2 border border-blue-300 rounded px-3 py-1 w-full"
                  placeholder="Précisez l'horaire"
                  value={horaireAutre}
                  onChange={e => setHoraireAutre(e.target.value)}
                />
              )}
            </div>
            {/* Numéro de sac boutons 1,2,3 */}
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Sac Numéro</label>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    className={`px-4 py-2 rounded-lg font-semibold border transition ${Number(sacNumero) === n ? "bg-blue-700 text-white border-blue-700" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"}`}
                    onClick={() => setSacNumero(n)}
                    type="button"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Ligne nom du gendarme + véhicule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Nom du gendarme (signature)</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 w-full"
                value={utilisateurId}
                onChange={e => setUtilisateurId(e.target.value)}
                disabled={!canAffect}
              >
                <option value="">Sélectionner le gendarme signataire</option>
                {utilisateurs.map(u => (
                  <option key={u.id} value={u.id}>{u.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-blue-700 font-semibold mb-1">Véhicule (VL)</label>
              <select
                className="border border-blue-300 rounded px-3 py-1 w-full"
                value={vlId}
                onChange={e => setVlId(e.target.value)}
              >
                <option value="">Sélectionner un véhicule</option>
                {vehicules && vehicules.length > 0 ? (
                  vehicules.map(v => (
                    <option key={v.id} value={v.id}>{v.nom} ({v.immatriculation})</option>
                  ))
                ) : (
                  <option value="" disabled>Aucun véhicule disponible</option>
                )}
              </select>
            </div>
          </div>
          {/* Personnels */}
          <div className="mb-6 md:mb-8">
            <label className="block text-blue-700 font-semibold mb-1">Personnels</label>
            <div className="relative" ref={personnelsDropdownRef}>
              <button
                type="button"
                className="border border-blue-300 rounded px-3 py-2 w-full text-left bg-white"
                onClick={() => setShowPersonnels(v => !v)}
              >
                {personnels.length === 0 ? "Sélectionner les personnels..." : personnelsNoms}
              </button>
              {showPersonnels && (
                <div className="absolute z-10 bg-white border border-blue-300 rounded shadow w-full mt-1 max-h-64 overflow-y-auto">
                  {utilisateurs.map(u => (
                    <label key={u.id} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personnels.includes(u.id)}
                        onChange={() => togglePersonnel(u.id)}
                        className="accent-blue-700"
                      />
                      <span>{u.nom}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Matériel perçu */}
          <div className="bg-white/90 rounded-xl shadow border border-blue-100 p-6 mb-8 animate-fade-in">
            <h2 className="text-blue-800 font-bold text-xl mb-6 tracking-tight uppercase">Matériel perçu</h2>
            <table className="min-w-full text-sm">
              <colgroup>
                <col style={{ width: "23%" }} />
                <col style={{ width: "69%" }} />
                <col style={{ width: "8%" }} />
              </colgroup>
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-2 py-2 text-left">Équipement</th>
                  <th className="px-2 py-2 text-center">N°</th>
                  <th className="px-2 py-2 text-center">Obs.</th>
                </tr>
              </thead>
              <tbody>
                {produitsFiltres.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">Aucun équipement trouvé.</td>
                  </tr>
                ) : (
                  produitsFiltresAffiches.map(p => {
                    const showObs = !!materielDetails[p.id]?.showObs;
                    // Pour le matériel sans stock : case à cocher Qté/Récup
                    const checkedRecup = !!materielDetails[p.id]?.recup;
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="border-b last:border-b-0 hover:bg-blue-50">
                          <td className="px-2 py-2 font-medium text-blue-800 align-middle text-left truncate">{p.nom}</td>
                          <td className="px-2 py-2 align-middle text-center">
                            {/* Multi-numéro selection */}
                            {(p.numeros || []).length > 0 ? (
                              <div className="flex gap-1 flex-wrap justify-center">
                                {p.numeros.map(n => {
                                  const isChargeur = p.nom.toLowerCase().includes("chargeur");
                                  const isGENL = p.nom.toLowerCase().includes("genl");
                                  const isMP7 = p.nom.toLowerCase().includes("mp7");
                                  const isGENLorMP7 = isGENL || isMP7;
                                  const isTaken = numerosEnCours[p.id]?.has(String(n));
                                  const isSelected = materielDetails[p.id]?.numeros?.includes(String(n));
                                  // Pour GENL/MP7, bouton toujours actif, jamais grisé, et on peut sélectionner plusieurs fois
                                  // Pour chargeurs, fond vert
                                  // Pour GENL/MP7, afficher 'x' devant le chiffre
                                  let btnClass = "w-10 h-8 rounded border font-bold flex items-center justify-center transition ";
                                  if (isChargeur) {
                                    if (isTaken && !isSelected) {
                                      btnClass += "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed";
                                    } else {
                                      btnClass += isSelected
                                        ? "bg-green-600 text-white border-green-700"
                                        : "bg-green-200 text-green-900 border-green-300 hover:bg-green-300";
                                    }
                                  } else if (isGENLorMP7) {
                                    btnClass += isSelected
                                      ? "bg-orange-500 text-white border-orange-700"
                                      : "bg-orange-200 text-orange-900 border-orange-300 hover:bg-orange-300";
                                  } else {
                                    btnClass += isSelected
                                      ? "bg-blue-700 text-white border-blue-700"
                                      : isTaken
                                        ? "bg-gray-300 text-gray-400 border-gray-300 cursor-not-allowed"
                                        : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
                                  }
                                  return (
                                    <button
                                      key={n}
                                      className={btnClass}
                                      disabled={
                                        !canAffect || (
                                          !isGENLorMP7 && isTaken && !isSelected
                                        )
                                      }
                                      onClick={() => handleMaterielNumeroToggle(p.id, String(n))}
                                      type="button"
                                    >
                                      {isGENLorMP7 ? `x${n}` : n}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={materielDetails[p.id]?.numeros?.join(", ") || ""}
                                onChange={e => handleMaterielDetail(p.id, "numeros", e.target.value.split(/,|;/).map(s=>s.trim()).filter(Boolean))}
                                className="w-32 border border-blue-300 rounded px-2 py-1 text-center"
                                disabled={!canAffect}
                              />
                            )}
                          </td>
                          <td className="px-2 py-2 align-middle text-center">
                            {/* Coche pour observation */}
                            <input
                              type="checkbox"
                              checked={!!materielDetails[p.id]?.showObs}
                              onChange={e => handleMaterielDetail(p.id, "showObs", e.target.checked)}
                              disabled={!canAffect}
                              className="accent-blue-700 w-5 h-5"
                              title="Ajouter une observation"
                            />
                          </td>
                        </tr>
                        {/* Ligne d'observation si coche activée */}
                        {showObs && (
                          <tr>
                            <td colSpan={4} className="bg-blue-50 px-2 py-2">
                              <input
                                type="text"
                                value={materielDetails[p.id]?.observation || ""}
                                onChange={e => handleMaterielDetail(p.id, "observation", e.target.value)}
                                className="w-full border border-blue-300 rounded px-3 py-2 text-blue-900 bg-white"
                                placeholder="Observation..."
                                disabled={!canAffect}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <button
                className="px-7 py-2 rounded font-semibold shadow hover:scale-105 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 flex items-center justify-center bg-blue-700 text-white hover:bg-blue-800 cursor-pointer"
                onClick={handleAffectation}
              >
                Valider la fiche de perception
              </button>
              <span className="text-xs text-gray-500 ml-2">En cliquant sur “Valider”, vous confirmez l’exactitude des informations saisies.</span>
              {message && (
                <div className={
                  message === "Sélectionnez un gendarme et au moins un équipement."
                    ? "text-red-600 font-semibold animate-bounce-in"
                    : "text-blue-700 font-semibold animate-bounce-in"
                }>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}

export default function Armurerie(props) {
  const { produits, utilisateurs, session, patrouilles, setPatrouilles, addFiche, fiches, ...rest } = useArmurerieData();
  const { data: vehiculeData } = useVehiculeData();
  const vehicules = vehiculeData?.vehicules || [];
  const [page, setPage] = useState("accueil");
  const [showLogin, setShowLogin] = useState(false);
  const [patrouilleRetour, setPatrouilleRetour] = useState(null);
  const [retourGendarme, setRetourGendarme] = useState("");
  const [retourConfirmation, setRetourConfirmation] = useState(false);
  const [retourMessage, setRetourMessage] = useState("");
  const [retourMaterielRendu, setRetourMaterielRendu] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setArmurerieShowLogin = setShowLogin;
    }
    return () => {
      if (typeof window !== 'undefined' && window.setArmurerieShowLogin) {
        delete window.setArmurerieShowLogin;
      }
    };
  }, []);

  // Handler to open modal from accueil table
  const handleRetourPatrouille = (patrouille) => {
    setPatrouilleRetour(patrouille);
    setRetourGendarme("");
    setRetourConfirmation(false);
    setRetourMessage("");
    // Initialiser l'état des cases à cocher pour chaque matériel
    const renduInit = {};
    patrouille.materiels.forEach((m, i) => {
      (m.numeros||[]).forEach(num => {
        renduInit[`${i}_${num}`] = false;
      });
    });
    setRetourMaterielRendu(renduInit);
  };

  // Handler to validate retour
  const handleValiderRetour = () => {
    if (!retourGendarme) {
      setRetourMessage("Sélectionnez le gendarme effectuant le retour.");
      return;
    }
    // Log retour patrouille avec détail matériel rendu
    const materielLog = patrouilleRetour.materiels.map((m, i) => `${m.nom} [${(m.numeros||[]).map(num => retourMaterielRendu[`${i}_${num}`] ? `#${num}:Rendu` : `#${num}:Non rendu`).join(", ")}]`).join(" | ");
    rest.addLog && rest.addLog({
      type: "armurerie",
      message: `Retour patrouille: Date: ${new Date().toISOString().slice(0,10)}, Horaire: ${patrouilleRetour.horaire}, Sac: ${patrouilleRetour.sac}, VL: ${vehicules.find(v=>v.id===patrouilleRetour.vlId)?.nom || "-"}, Équipe: ${patrouilleRetour.equipe.join(", ")}, Matériel: ${materielLog}, Retour par: ${utilisateurs.find(u=>u.id===Number(retourGendarme))?.nom || retourGendarme}`,
      date: new Date().toISOString(),
      retour: true,
      patrouilleId: patrouilleRetour.id,
      materielRendu: retourMaterielRendu
    });
    setPatrouilles && setPatrouilles((patrouilles || []).filter(pt => pt.id !== patrouilleRetour.id));
    setPatrouilleRetour(null);
    setRetourGendarme("");
    setRetourConfirmation(false);
    setRetourMessage("Retour enregistré !");
    setRetourMaterielRendu({});
  };

  const RetourPatrouilleModal = patrouilleRetour && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-blue-200 animate-fade-in relative">
        <h3 className="text-blue-800 font-extrabold text-2xl mb-6 flex items-center gap-2">
          <svg width="28" height="28" fill="none" stroke="#2563eb" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="7" rx="2" fill="#e0e7ff" stroke="#2563eb"/><rect x="7" y="5" width="10" height="5" rx="1.5" fill="#fff" stroke="#2563eb"/><path d="M12 17v2" stroke="#2563eb"/><circle cx="12" cy="21" r="1.5" fill="#2563eb"/></svg>
          Retour de patrouille
        </h3>
        <div className="mb-2 flex flex-wrap gap-4 text-base">
          <div><b>Équipe :</b> <span className="text-slate-700">{patrouilleRetour.equipe.join(", ")}</span></div>
          <div><b>Horaire :</b> <span className="text-slate-700">{patrouilleRetour.horaire}</span></div>
          <div><b>Sac :</b> <span className="text-slate-700">{patrouilleRetour.sac}</span></div>
          <div><b>Véhicule :</b> <span className="text-slate-700">{vehicules.find(v=>v.id===patrouilleRetour.vlId)?.nom || "-"}</span></div>
        </div>
        <div className="mb-6">
          <div className="font-bold text-blue-700 mb-2 text-lg flex items-center gap-2">
            <svg width="20" height="20" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="7" rx="2" fill="#e0e7ff" stroke="#2563eb"/><rect x="7" y="5" width="10" height="5" rx="1.5" fill="#fff" stroke="#2563eb"/></svg>
            Matériel à rendre
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="tout-rendre"
              className="accent-blue-700 w-5 h-5"
              checked={Object.keys(retourMaterielRendu).length > 0 && Object.values(retourMaterielRendu).every(Boolean)}
              onChange={e => {
                const tout = e.target.checked;
                const newRendu = { ...retourMaterielRendu };
                patrouilleRetour.materiels.forEach((m, i) => {
                  (m.numeros||[]).forEach(num => {
                    newRendu[`${i}_${num}`] = tout;
                  });
                });
                setRetourMaterielRendu(newRendu);
              }}
            />
            <label htmlFor="tout-rendre" className="text-blue-700 font-semibold select-none cursor-pointer">Tout rendre</label>
          </div>
          <table className="w-full text-sm rounded-xl overflow-hidden border border-blue-100 bg-blue-50">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="px-3 py-2 text-left font-semibold">Équipement</th>
                <th className="px-3 py-2 text-center font-semibold">Rendu</th>
              </tr>
            </thead>
            <tbody>
              {patrouilleRetour.materiels.map((m, i) => (
                <React.Fragment key={i}>
                  <tr className="border-b last:border-b-0 hover:bg-blue-100/60 transition">
                    <td className="px-3 py-2 text-blue-900 font-medium flex items-center gap-2">
                      <svg width="16" height="16" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb"/><path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2.5"/></svg>
                      {m.nom}
                    </td>
                    <td colSpan={2} className="px-3 py-2 text-center">
                      {(m.numeros||[]).length === 0 ? (
                        <span className="text-gray-400 italic">Aucun numéro</span>
                      ) : (
                        <div className="flex flex-wrap gap-2 justify-center">
                          {m.numeros.map((num, j) => (
                            <div key={j} className="flex items-center gap-1 mb-1">
                              <input
                                type="checkbox"
                                className="accent-blue-700 w-5 h-5"
                                checked={!!retourMaterielRendu[`${i}_${num}`]}
                                onChange={() => setRetourMaterielRendu(r => ({ ...r, [`${i}_${num}`]: !r[`${i}_${num}`] }))}
                              />
                              <span className={retourMaterielRendu[`${i}_${num}`] ? "text-green-700 font-semibold" : "text-gray-400"}>{num}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">Observations générales</label>
          <input
            className="border border-blue-300 rounded px-3 py-1 w-full"
            value={retourMaterielRendu['obs_generale'] || ''}
            onChange={e => setRetourMaterielRendu(r => ({ ...r, obs_generale: e.target.value }))}
            placeholder="Observations..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-blue-700 font-semibold mb-1">Gendarme effectuant le retour</label>
          <select
            className="border border-blue-300 rounded px-3 py-1 w-full"
            value={retourGendarme}
            onChange={e => setRetourGendarme(e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {utilisateurs.map(u => (
              <option key={u.id} value={u.id}>{u.nom}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 justify-end mt-6">
          <button className="px-4 py-2 rounded bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition" onClick={()=>setPatrouilleRetour(null)}>
            Annuler
          </button>
          <button className={"px-6 py-2 rounded font-semibold shadow flex items-center gap-2 " + (retourGendarme ? "bg-blue-700 text-white hover:bg-blue-800" : "bg-blue-200 text-blue-100 cursor-not-allowed")}
            onClick={handleValiderRetour} disabled={!retourGendarme}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            Valider le retour
          </button>
        </div>
        {retourMessage && <div className="mt-4 text-blue-700 font-semibold">{retourMessage}</div>}
      </div>
    </div>
  );

  if (showLogin) {
    return <Login onLogin={() => {
      setShowLogin(false);
      setPage("accueil");
      window.location.reload();
    }} />;
  }

  return (
    <div>
      <div className="w-full mb-6">
        <MenuArmurerie page={page} setPage={setPage} onLoginClick={() => setShowLogin(true)} />
      </div>
      {page === "accueil" && (
        <>
          <AccueilArmurerie setPage={setPage} patrouilles={patrouilles} vehicules={vehicules} handleRetourPatrouille={handleRetourPatrouille} />
          {RetourPatrouilleModal}
        </>
      )}
      {page === "fiche" && <ArmurerieMain produits={produits} utilisateurs={utilisateurs} vehicules={vehicules} session={session} patrouilles={patrouilles} setPatrouilles={setPatrouilles} addFiche={addFiche} setPage={setPage} {...rest} />}
      {page === "admin" && <Admin />}
      {page === "logs" && <Logs />}
    </div>
  );
}

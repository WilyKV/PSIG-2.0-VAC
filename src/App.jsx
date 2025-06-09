import React, { useState, useEffect } from "react";
import MenuComptoire from "./components/MenuComptoire";
import Vente from "./pages/comptoire/Vente";
import Stock from "./pages/comptoire/Stock";
import Dettes from "./pages/comptoire/Dettes";
import Logs from "./pages/comptoire/Logs";
import Admin from "./pages/comptoire/Admin";
import Login from "./pages/comptoire/Login";
import Accueil from "./pages/Accueil";
import useAdminData from "./hooks/useAdminData";
import Armurerie from "./pages/Armurerie/Armurerie";
import Vehicule from "./pages/Vehicule/Vehicule";
import Comptoir from "./pages/comptoire/Comptoir";

export default function App() {
  const [page, setPage] = useState("accueil");
  const [showComptoir, setShowComptoir] = useState(false);
  const [showArmurerie, setShowArmurerie] = useState(false);
  const [showVehicule, setShowVehicule] = useState(false);
  const { session, logout } = useAdminData();
  const [showLogin, setShowLogin] = useState(false);
  // Ajout : clé dynamique pour forcer le re-render global sur changement de session
  const [sessionKey, setSessionKey] = useState(0);

  // Surveille le changement de rôle pour forcer le re-render global
  useEffect(() => {
    setSessionKey(k => k + 1);
  }, [session.role]);

  // Affichage accueil général si pas sur le module Comptoir
  if (!showComptoir && !showArmurerie && !showVehicule) {
    return <Accueil 
      onComptoirClick={() => {
        setShowComptoir(true);
      }}
      onArmurerieClick={() => {
        setShowArmurerie(true);
      }}
      onVehiculeClick={() => {
        setShowVehicule(true);
      }}
    />;
  }
  if (showArmurerie) {
    return <Armurerie />;
  }
  if (showVehicule) {
    return <Vehicule />;
  }
  if (showComptoir) {
    return <Comptoir />;
  }

  // Si invité et demande de connexion, afficher la page de login
  if (showLogin) {
    return <Login onLogin={() => {
      setShowLogin(false);
      setPage("vente");
      window.location.reload(); // Force un vrai reload pour synchroniser tout
    }} />;
  }
}

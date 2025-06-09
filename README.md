# PSIG 2.0 : L'air du numérique

## 🚀 Lancer le projet en local avec Docker et Make

### 1. Installer `make` sous Windows
- Le plus simple :
  - Installe [Chocolatey](https://chocolatey.org/install) (si pas déjà fait)
  - Ouvre un terminal administrateur et lance :
    ```sh
    choco install make
    choco install docker
    ```
  - Installer Docker Desktop

### 2. Lancer le projet dans Docker
Dans le dossier du projet, exécute :
```sh
make up
```
- Ouvre ensuite [http://localhost:5173](http://localhost:5173) dans ton navigateur.

### 3. Arrêter le conteneur
```sh
make down
```

### 4. Builder le site statique (pour hébergement ou usage offline)
```sh
make build
```
- Le dossier `dist/` sera créé à la racine du projet.
- Ouvre simplement `dist/index.html` dans ton navigateur pour utiliser l'app **en local, sans serveur**, si ça ne fonctionne pas, il faut l'ouvrir avec l'application Server HTTP
- Sinon, récupérer le fichier APK dans `output/` et l'installer sur la tablette

### 5. Nettoyer
```sh
make clean
```

---

- **Tout fonctionne en local, aucune connexion requise.**
- **Le code source est dans `src/`**
- **Le design est 100% Tailwind CSS local**

## Licence

Ce projet est distribué sous licence MIT.  
Voir le fichier [LICENSE](./LICENSE) pour plus d’informations.

# 📡 WebApp de Surveillance des Équipements

Cette application permet de **surveiller en temps réel des équipements terrain** (panneaux à messages variables) et de **les contrôler à distance**.

> ⚠️ Actuellement, seule la **page de monitoring** (page 1) est fonctionnelle.  
Les pages Statistiques et Maintenance sont présentes mais **non encore développées**.

---

## Technologies

- **Frontend** : React (Vite)
- **Backend** : Express.js
- **Langage** : JavaScript

---

## 🚀 Lancer le projet en local

1. Clone ce dépôt
2. Installe les dépendances dans les deux dossiers :
   ```bash
   cd client && npm install
   cd ../server && npm install

3. Démarrer le serveur Express
    ```bash
    cd server
    npm run dev

4. Démarrer la WebApp React
    ```bash
    cd ../client
    npm run dev

5. WebApp consultable sur :
  http://localhost:5173



Fonctionnalités de la page Monitoring
 - Affichage dynamique des équipements (nom, statut, message, etc.)

 - Envoi de messages instantanés

 - Planification de messages automatiques (plage horaire)

 - Retour automatique au message par défaut

 - Design responsive type dashboard avec menu de navigation

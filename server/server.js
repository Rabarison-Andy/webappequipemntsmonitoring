const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const equipements = require("./data/ExerciceData.json");

app.use(cors());
app.use(bodyParser.json());

// Stockage temporaire en mémoire
let messagesActifs = {};
let messagesProgrammes = {};

const cleanData = (data) => {
  return data
    .filter(item => {
      // Filtrage des entrées invalides
      const isValidType = !["Source", "Connectivité 4G", "Serveur local", "PMV", "Caméra"].includes(item.Type);
      const hasValidId = !isNaN(item["Id équipement"]);
      return isValidType && hasValidId;
    })
    .map(item => {
      const id = item["Id équipement"];
      const horodatage = item.Horodatage || new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      
      return {
        id: id,
        horodatage: horodatage,
        localisation: item.Localisation || "Inconnue",
        type: item.Type || "Autres",
        conforme: item.Conforme || "FAUX",
        critair: typeof item.Critair === "number" ? item.Critair : "N/A",
        motorisation: item.Motorisation || "Non spécifiée",
        categorie: item.Catégorie || "Non classé",
        derogation: item.Dérogation || "Aucune",
        message: messagesActifs[id]?.message || (item.Conforme === "FAUX" ? item["Message actuel"] : null),
        scheduledMessage: !!messagesProgrammes[id]
      };
    });
};

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/api", (req, res) => {
  const cleanedData = cleanData(equipements);
  res.json(cleanedData);
});

// Gestion des messages instantanés
app.post("/api/:id/message", (req, res) => {
  const { id } = req.params;
  const { message, duration = 10000 } = req.body;
  const expiration = Date.now() + duration;

  if (!id || !message) {
    return res.status(400).json({ error: "Paramètres manquants" });
  }

  if (messagesActifs[id]) {
    clearTimeout(messagesActifs[id].timeout);
  }

  messagesActifs[id] = {
    message,
    expiration: null
  };

  console.log(`Nouveau message pour ${id}: "${message}"`);
  res.json({ 
    status: "success",
    expiration: null
  });
});

// Gestion des messages programmés
app.post("/api/:id/schedule", (req, res) => {
  const { id } = req.params;
  const { start, end, content } = req.body;

  if (messagesProgrammes[id]) {
    return res.status(400).json({ error: "Un message est déjà programmé pour cet équipement" });
  }

  messagesProgrammes[id] = {
    start: new Date(start),
    end: new Date(end),
    content,
    active: false
  };

  console.log(`Programmation enregistrée pour ${id}: "${content}" (${start} - ${end})`);
  res.json({ 
    status: "success",
    programmationId: Date.now()
  });
});

// Ajouter cette route
app.post('/api/:id/reset', (req, res) => {
  const { id } = req.params;
  
  if(messagesActifs[id]) {
    clearTimeout(messagesActifs[id].timeout);
    delete messagesActifs[id];
  }
  
  res.json({ status: 'success' });
});

// Vérification périodique des messages programmés
setInterval(() => {
  const now = new Date();
  Object.entries(messagesProgrammes).forEach(([id, msg]) => {
    try {
      if (now >= msg.start && now <= msg.end && !msg.active) {
        // Suppression du message instantané existant
        if(messagesActifs[id]) {
          clearTimeout(messagesActifs[id].timeout);
          delete messagesActifs[id];
        }
        
        messagesActifs[id] = { 
          message: msg.content,
          expiration: msg.end.getTime()
        };
        msg.active = true;
      }
      
      if (now > msg.end && msg.active) {
        delete messagesActifs[id];
        delete messagesProgrammes[id]; // Supprime la programmation expirée
        console.log(`Programmation expirée pour ${id}`);
      }
    } catch (error) {
      console.error(`Erreur pour ${id}:`, error);
    }
  });
}, 3000);

app.listen(8080, () => {
  console.log("Serveur démarré sur http://localhost:8080");
});
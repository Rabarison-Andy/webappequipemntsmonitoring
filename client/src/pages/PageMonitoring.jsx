import { useState, useEffect } from 'react';
import './PageMonitoring.css';
import axios from 'axios';

function PageMonitoring() {
  const [equipements, setEquipements] = useState([]);
  const [selectedEquipement, setSelectedEquipement] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [autoMessage, setAutoMessage] = useState({ 
    start: '', 
    end: '', 
    content: '' 
  });

  const fetchEquipements = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api");
      const uniqueEquipements = response.data.reduce((acc, current) => {
        if(!acc.find(item => item.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, []);
      setEquipements(uniqueEquipements);
    } catch (error) {
      console.error("Erreur de récupération des données:", error);
    }
  };

  useEffect(() => {
    fetchEquipements();
    const interval = setInterval(fetchEquipements, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const handleSendMessage = async (equipementId) => {
    try {
      await axios.post(`http://localhost:8080/api/${equipementId}/message`, {
        message: messageInput,
        duration: 600000
      });
      setMessageInput('');
    } catch (error) {
      alert("Erreur d'envoi : " + error.message);
    }
  };

  const handleScheduleMessage = async (equipementId) => {
    try {
      const now = new Date();
      const startDate = new Date(autoMessage.start);
      const endDate = new Date(autoMessage.end);

      if (startDate < now) throw new Error("La date de début est dans le passé");
      if (endDate <= startDate) throw new Error("La date de fin est invalide");

      await axios.post(`http://localhost:8080/api/${equipementId}/schedule`, autoMessage);
      setAutoMessage({ start: '', end: '', content: '' });
      await fetchEquipements();
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  const handleResetMessage = async (equipementId) => {
    try {
      await axios.post(`http://localhost:8080/api/${equipementId}/reset`);
      fetchEquipements();
    } catch (error) {
      alert("Erreur de réinitialisation : " + error.message);
    }
  };

  const getTimeLeft = (expiration) => {
    const diff = new Date(expiration) - Date.now();
    if (diff <= 0) return 'Expiré';
    const minutes = Math.floor(diff / 60000);
    return `${minutes} min`;
  };

  return (
    <div className="app">
      <h1>Page de Monitoring</h1>

      {selectedEquipement && (
        <div className="modal-overlay">
          <div className="control-modal">
            <div className="modal-header">
              <h3>{selectedEquipement.localisation} - #{selectedEquipement.id}</h3>
              <button onClick={() => setSelectedEquipement(null)}>
                &times;
              </button>
            </div>

            <div className="control-section">
              <h4>Message instantané</h4>
              <div className="input-group">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Saisir votre message..."
                />
                <div className="button-group">
                  <button 
                    onClick={() => handleSendMessage(selectedEquipement.id)}
                    disabled={!messageInput.trim()}
                    className='send-btn'
                  >
                    Envoyer
                  </button>
                  <button 
                    onClick={() => handleResetMessage(selectedEquipement.id)}
                    className="reset-btn"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </div>

            <div className="control-section">
              <h4>Programmation de message</h4>
              {selectedEquipement.scheduledMessage ? (
                <div className="schedule-disabled">
                  ⚠️ Un message est déjà programmé. Impossible d'en ajouter un nouveau.
                </div>
              ) : (
                <div className="schedule-inputs">
                  <div className="input-group">
                    <label>Début</label>
                    <input
                      type="datetime-local"
                      value={autoMessage.start}
                      onChange={(e) => setAutoMessage({...autoMessage, start: e.target.value})}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Fin</label>
                    <input
                      type="datetime-local"
                      value={autoMessage.end}
                      onChange={(e) => setAutoMessage({...autoMessage, end: e.target.value})}
                      min={autoMessage.start || new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Message</label>
                    <input
                      type="text"
                      value={autoMessage.content}
                      onChange={(e) => setAutoMessage({...autoMessage, content: e.target.value})}
                      placeholder="Contenu du message"
                    />
                  </div>
                  <button
                    onClick={() => handleScheduleMessage(selectedEquipement.id)}
                    disabled={
                      !autoMessage.content.trim() || 
                      !autoMessage.start || 
                      !autoMessage.end ||
                      !!selectedEquipement.scheduledMessage
                    }
                  >
                    Programmer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="equipements-grid">
        {equipements.map((eq, index) => (
          <div 
            key={`${eq.id}-${index}`}
            className="equipement-card"
            onClick={() => setSelectedEquipement(eq)}
          >
            <div className="card-header">
              <h3>{eq.localisation}</h3>
              <span className="equipement-id">#{eq.id}</span>
            </div>
            
            <div className="card-body">
              <div className="current-message">
                {eq.message ? (
                  <div className="active-message">
                    <div className="message-content">{eq.message}</div>
                    {eq.messageExpiration && (
                      <div className="message-timer">
                        ⏳ {getTimeLeft(eq.messageExpiration)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="default-message">Aucun message actif</div>
                )}
              </div>
              
              <div className="last-update">
                Dernière mise à jour : {formatDate(eq.horodatage)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageMonitoring;
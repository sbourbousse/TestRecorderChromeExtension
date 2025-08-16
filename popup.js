document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const status = document.getElementById('status');
  const stepCounter = document.getElementById('stepCounter');
  const stepCount = document.getElementById('stepCount');

  let isRecording = false;

  // Vérifier l'état actuel de l'enregistrement
  checkRecordingStatus();

  startBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.startsWith('http')) {
        showError('Cette extension ne fonctionne que sur les pages web (http/https)');
        return;
      }

      // Injecter le content script si nécessaire
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Démarrer l'enregistrement
      await chrome.tabs.sendMessage(tab.id, { action: "startRecording" });
      
      isRecording = true;
      updateUI();
      
      // Fermer le popup
      window.close();
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
      showError('Impossible de démarrer l\'enregistrement. Vérifiez que vous êtes sur une page web valide.');
    }
  });

  stopBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Arrêter l'enregistrement
      await chrome.tabs.sendMessage(tab.id, { action: "stopRecording" });
      
      isRecording = false;
      updateUI();
      
      // Fermer le popup
      window.close();
      
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
      showError('Impossible d\'arrêter l\'enregistrement.');
    }
  });

  function updateUI() {
    if (isRecording) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      status.textContent = '🔴 Enregistrement en cours...';
      status.className = 'status recording';
      stepCounter.style.display = 'block';
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      status.textContent = 'Prêt à enregistrer';
      status.className = 'status not-recording';
      stepCounter.style.display = 'none';
    }
  }

  async function checkRecordingStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.startsWith('http')) {
        // Essayer de communiquer avec le content script pour vérifier l'état
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { action: "getStatus" });
          if (response && response.recording) {
            isRecording = true;
            updateUI();
          }
        } catch (error) {
          // Le content script n'est pas encore injecté, c'est normal
          console.log('Content script non disponible:', error);
        }
      } else {
        startBtn.disabled = true;
        status.textContent = '⚠️ Cette extension ne fonctionne que sur les pages web';
        status.className = 'status not-recording';
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
    }
  }

  function showError(message) {
    status.textContent = `❌ ${message}`;
    status.className = 'status not-recording';
    status.style.background = 'rgba(220, 53, 69, 0.2)';
    status.style.border = '1px solid rgba(220, 53, 69, 0.3)';
  }

  // Écouter les messages du content script pour mettre à jour le compteur
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "stepCountUpdate") {
      stepCount.textContent = request.count;
    }
  });
});

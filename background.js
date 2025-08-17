chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "generateFiles") {
      console.log('Génération des fichiers demandée avec', request.data.length, 'étapes');
      
      const testRailJson = generateTestRailJson(request.data);
      const selectorLog = generateSelectorLog(request.data);

      // Envoyer les données au content script pour téléchargement
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "downloadFiles",
            files: {
              testrail: { content: testRailJson, filename: "testrail.json", type: "application/json" },
              log: { content: selectorLog, filename: "selector_log.txt", type: "text/plain" },
              data: { content: JSON.stringify(request.data, null, 2), filename: "test_data_with_screenshots.json", type: "application/json" }
            }
          });
        }
      });
      
      // Notification de succès
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon48.png',
          title: 'Test Recorder',
          message: `Fichiers générés avec succès ! ${request.data.length} étapes enregistrées.`
        });
      }
    } else if (request.action === "takeScreenshot") {
      // Gérer la demande de capture d'écran
      takeScreenshot().then(dataUrl => {
        sendResponse({ success: true, dataUrl: dataUrl });
      }).catch(error => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Indique que la réponse sera asynchrone
    } else if (request.action === "getTestData") {
      // Récupérer les données de test depuis tous les onglets
      chrome.tabs.query({}, (tabs) => {
        // Chercher dans tous les onglets pour trouver celui qui a des données
        let dataFound = false;
        let checkCount = 0;
        
        tabs.forEach(tab => {
          if (tab.url && tab.url.startsWith('http')) {
            chrome.tabs.sendMessage(tab.id, { action: "getTestData" }, (response) => {
              checkCount++;
              if (response && response.success && response.data && response.data.length > 0) {
                dataFound = true;
                sendResponse({ success: true, data: response.data });
              } else if (checkCount === tabs.length && !dataFound) {
                // Aucune donnée trouvée dans aucun onglet
                sendResponse({ success: false, error: 'Aucune donnée disponible' });
              }
            });
          } else {
            checkCount++;
            if (checkCount === tabs.length && !dataFound) {
              sendResponse({ success: false, error: 'Aucune donnée disponible' });
            }
          }
        });
        
        // Si aucun onglet n'a de données, répondre immédiatement
        if (tabs.length === 0) {
          sendResponse({ success: false, error: 'Aucun onglet disponible' });
        }
      });
      return true; // Indique que la réponse sera asynchrone
    } else if (request.action === "saveTestData") {
      // Sauvegarder les données de test vers le content script
      chrome.tabs.query({}, (tabs) => {
        // Chercher dans tous les onglets pour trouver celui qui a des données
        let saved = false;
        let checkCount = 0;
        
        tabs.forEach(tab => {
          if (tab.url && tab.url.startsWith('http')) {
            chrome.tabs.sendMessage(tab.id, { 
              action: "saveTestData", 
              data: request.data 
            }, (response) => {
              checkCount++;
              if (response && response.success && !saved) {
                saved = true;
                sendResponse({ success: true });
              } else if (checkCount === tabs.length && !saved) {
                sendResponse({ success: false, error: 'Aucun onglet disponible pour la sauvegarde' });
              }
            });
          } else {
            checkCount++;
            if (checkCount === tabs.length && !saved) {
              sendResponse({ success: false, error: 'Aucun onglet disponible pour la sauvegarde' });
            }
          }
        });
        
        if (tabs.length === 0) {
          sendResponse({ success: false, error: 'Aucun onglet disponible' });
        }
      });
      return true; // Indique que la réponse sera asynchrone
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la demande:', error);
    if (request.action === "takeScreenshot") {
      sendResponse({ success: false, error: error.message });
      return true;
    }
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Erreur Test Recorder',
        message: 'Erreur lors de la génération des fichiers: ' + error.message
      });
    }
  }
});

function generateTestRailJson(data) {
  if (!data || !Array.isArray(data)) {
    throw new Error('Données invalides pour la génération du JSON TestRail');
  }

  const steps = data.map((step, index) => ({
    content: `Étape ${index + 1}: ${step.comment || 'Action non décrite'}`,
    expected: `L'élément ${step.selector || 'sélecteur inconnu'} doit être accessible et fonctionnel`
  }));

  const firstStep = data[0] || {};
  const testCase = {
    title: `Test Case - ${new Date().toLocaleDateString('fr-FR')} - ${data.length} étapes`,
    template_id: 1,
    type_id: 1,
    priority_id: 2,
    custom_steps_separated: steps,
    custom_metadata: {
      recorded_at: new Date().toISOString(),
      total_steps: data.length,
      url: firstStep.url || 'N/A'
    }
  };

  return JSON.stringify(testCase, null, 2);
}

function generateSelectorLog(data) {
  if (!data || !Array.isArray(data)) {
    throw new Error('Données invalides pour la génération du log');
  }

  let log = `=== LOG D'ENREGISTREMENT TEST RECORDER ===\n`;
  log += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
  log += `URL: ${(data[0] && data[0].url) ? data[0].url : 'N/A'}\n`;
  log += `Nombre total d'étapes: ${data.length}\n\n`;

  data.forEach((step, index) => {
    log += `=== ÉTAPE ${index + 1} ===\n`;
    log += `Timestamp: ${step.timestamp || 'N/A'}\n`;
    log += `Sélecteur CSS: ${step.selector || 'N/A'}\n`;
    log += `Action: ${step.comment || 'N/A'}\n`;
    log += `URL: ${step.url || 'N/A'}\n`;
    log += `Capture d'écran: ${step.screenshot ? 'Disponible' : 'Non disponible'}\n\n`;
  });

  log += `=== FIN DU LOG ===\n`;
  return log;
}

// Fonction pour prendre une capture d'écran
async function takeScreenshot() {
  try {
    console.log('Prise de capture d\'écran...');
    
    // Obtenir l'onglet actif
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error('Aucun onglet actif trouvé');
    }
    
    const tab = tabs[0];
    
    // Prendre la capture d'écran
    return new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png', quality: 80 }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (dataUrl && dataUrl.startsWith('data:image/')) {
          console.log('Capture d\'écran réussie');
          resolve(dataUrl);
        } else {
          reject(new Error('Format de capture d\'écran invalide'));
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de la capture d\'écran:', error);
    throw error;
  }
}



// Gestion des erreurs
chrome.runtime.onInstalled.addListener(() => {
  console.log('Test Recorder extension installed successfully');
});

// Gestion des erreurs de téléchargement (si l'API est disponible)
if (chrome.downloads && chrome.downloads.onError) {
  chrome.downloads.onError.addListener((downloadDelta) => {
    console.error('Download error:', downloadDelta.error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon48.png',
      title: 'Erreur de téléchargement',
      message: 'Impossible de télécharger les fichiers. Veuillez réessayer.'
    });
  });
}

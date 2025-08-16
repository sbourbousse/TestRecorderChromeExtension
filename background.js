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
              log: { content: selectorLog, filename: "selector_log.txt", type: "text/plain" }
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
    }
  } catch (error) {
    console.error('Erreur lors de la génération des fichiers:', error);
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
    log += `URL: ${step.url || 'N/A'}\n\n`;
  });

  log += `=== FIN DU LOG ===\n`;
  return log;
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

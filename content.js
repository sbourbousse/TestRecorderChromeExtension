let recording = false;
let testSteps = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    // Vérifier si on est dans le contexte de la popup
    if (window.location.protocol === 'chrome-extension:') {
      console.log('Content script dans la popup, ignoré');
      return;
    }
    
    if (request.action === "startRecording") {
      recording = true;
      document.addEventListener('click', handleClick, true);
      showRecordingIndicator();
      console.log('Enregistrement démarré');
    } else if (request.action === "stopRecording") {
      recording = false;
      document.removeEventListener('click', handleClick, true);
      hideRecordingIndicator();
      console.log('Enregistrement arrêté, génération des fichiers...');
      chrome.runtime.sendMessage({ action: "generateFiles", data: testSteps });
      testSteps = [];
    } else if (request.action === "getStatus") {
      // Répondre au popup pour vérifier que le content script est actif
      sendResponse({ status: 'active', recording: recording, stepCount: testSteps.length });
    } else if (request.action === "downloadFiles") {
      // Télécharger les fichiers générés
      downloadFiles(request.files);
    } else if (request.action === "getTestData") {
      // Envoyer les données de test à l'interface
      sendResponse({ success: true, data: testSteps });
    } else if (request.action === "saveTestData") {
      // Sauvegarder les données de test depuis l'interface
      testSteps = request.data;
      updateStepCount();
      updateActionList();
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error('Erreur dans le content script:', error);
  }
});

function handleClick(event) {
  if (recording) {
    // Ignorer les clics sur les éléments de la popup de l'extension
    if (isPopupElement(event.target)) {
      return;
    }
    
    // Ne pas empêcher le comportement par défaut
    // event.preventDefault();
    // event.stopPropagation();

    const selector = generateUniqueSelector(event.target);
    
    // Enregistrer l'action de base
    const step = {
      selector: selector, 
      comment: `Action sur ${event.target.tagName.toLowerCase()}${event.target.className ? ' (' + event.target.className + ')' : ''}`,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      element: event.target.tagName.toLowerCase(),
      needsJustification: true,
      screenshot: null
    };
    
    // Prendre une capture d'écran si activée
    if (screenshotsEnabled) {
      takeScreenshot().then(screenshot => {
        step.screenshot = screenshot;
        testSteps.push(step);
        updateActionList();
      }).catch(error => {
        console.error('Erreur lors de la capture d\'écran:', error);
        
        // Afficher une notification si c'est un problème de sécurité
        if (error.message.includes('non autorisées sur les pages HTTP')) {
          showSecurityNotification();
        }
        
        testSteps.push(step);
        updateActionList();
      });
    } else {
      // Enregistrer directement sans capture d'écran
      testSteps.push(step);
      updateActionList();
    }
  }
}

async function takeScreenshot() {
  try {
    // Demander au background script de prendre la capture d'écran
    console.log('Demande de capture d\'écran au background script');
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "takeScreenshot" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(response.dataUrl);
        } else {
          reject(new Error(response?.error || 'Erreur lors de la capture d\'écran'));
        }
      });
    });
  } catch (error) {
    console.error('Erreur lors de la capture d\'écran:', error);
    throw error;
  }
}



function isLocalDevelopmentEnvironment() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Détecter les environnements de développement local
  const localPatterns = [
    /^localhost$/,
    /^127\.0\.0\.1$/,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^qa\./,
    /^dev\./,
    /^staging\./,
    /^test\./,
    /^local\./,
    /^\.local$/,
    /^\.test$/,
    /^\.dev$/
  ];
  
  // Vérifier si l'hostname correspond à un pattern local
  const isLocalHostname = localPatterns.some(pattern => pattern.test(hostname));
  
  // Vérifier les ports de développement courants
  const devPorts = ['3000', '3001', '8080', '8000', '5000', '4000', '9000', '4200', '3002', '3003'];
  const isDevPort = devPorts.includes(port);
  
  // Vérifier si c'est une IP locale
  const isLocalIP = hostname.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.0\.0\.1)/);
  
  console.log(`Détection environnement local: hostname=${hostname}, port=${port}, isLocalHostname=${isLocalHostname}, isDevPort=${isDevPort}, isLocalIP=${!!isLocalIP}`);
  
  return isLocalHostname || isDevPort || isLocalIP;
}

function isPopupElement(element) {
  // Vérifier si l'élément ou un de ses parents est dans la popup de l'extension
  let currentElement = element;
  while (currentElement) {
    // Vérifier les IDs et classes spécifiques à la popup
    if (currentElement.id && (
      currentElement.id.includes('test-recorder') ||
      currentElement.id.includes('popup') ||
      currentElement.id.includes('modal') ||
      currentElement.id.includes('chrome-extension')
    )) {
      return true;
    }
    
    // Vérifier les classes
    if (currentElement.className && typeof currentElement.className === 'string') {
      const classes = currentElement.className.split(' ');
      if (classes.some(cls => 
        cls.includes('test-recorder') ||
        cls.includes('popup') ||
        cls.includes('modal') ||
        cls.includes('chrome-extension') ||
        cls.includes('extension-popup')
      )) {
        return true;
      }
    }
    
    // Vérifier si l'élément est dans une iframe ou une popup
    if (currentElement.tagName === 'IFRAME' || 
        currentElement.closest('iframe') ||
        currentElement.closest('[role="dialog"]') ||
        currentElement.closest('[data-testid*="popup"]') ||
        currentElement.closest('.extension-popup') ||
        currentElement.closest('#extension-popup')) {
      return true;
    }
    
    // Vérifier si on est dans le contexte de la popup Chrome
    if (currentElement === document.body && window.location.protocol === 'chrome-extension:') {
      return true;
    }
    
    currentElement = currentElement.parentElement;
  }
  
  return false;
}

function generateUniqueSelector(element) {
    if (element.id) {
        return `#${element.id}`;
    }
    let path = [];
    while (element.parentElement) {
        let selector = element.localName;
        if (element.className) {
            selector += `.${Array.from(element.classList).join('.')}`;
        }
        let siblings = Array.from(element.parentElement.children);
        const index = siblings.indexOf(element) + 1;
        if (siblings.length > 1) {
            selector += `:nth-child(${index})`;
        }
        path.unshift(selector);
        element = element.parentElement;
    }
    return path.join(' > ');
}

// Fonction supprimée - remplacée par le système de justification a posteriori

let screenshotsEnabled = true; // Variable globale pour contrôler les captures d'écran

function showRecordingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'test-recorder-indicator';
  indicator.innerHTML = `
    <div class="recording-indicator">
      <div class="recording-header">
        <span class="recording-dot"></span>
        <span>Enregistrement en cours...</span>
        <span class="step-count">Étapes: 0</span>
        <button id="test-recorder-screenshots" class="screenshots-btn" title="Captures d'écran">📷</button>
        <button id="test-recorder-toggle" class="toggle-btn">📋</button>
      </div>
      <div id="test-recorder-actions" class="actions-list" style="display: none;">
        <div class="actions-header">
          <h4>Actions récentes</h4>
          <button id="test-recorder-clear" class="clear-btn">🗑️</button>
        </div>
        <div id="test-recorder-actions-content" class="actions-content">
          <!-- Les actions seront ajoutées ici -->
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(indicator);
  
  // Ajouter les gestionnaires d'événements
  document.getElementById('test-recorder-toggle').addEventListener('click', toggleActionsList);
  document.getElementById('test-recorder-clear').addEventListener('click', clearActions);
  document.getElementById('test-recorder-screenshots').addEventListener('click', toggleScreenshots);
  
  // Mettre à jour le compteur d'étapes
  updateStepCount();
  updateScreenshotsButton();
}

function toggleScreenshots() {
  // Les captures d'écran sont maintenant autorisées sur toutes les pages
  // grâce à la conversion en base64
  
  screenshotsEnabled = !screenshotsEnabled;
  updateScreenshotsButton();
  
  // Afficher une notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${screenshotsEnabled ? '#28a745' : '#6c757d'};
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000000;
  `;
  
  let message = screenshotsEnabled ? '📷 Captures d\'écran activées' : '📷 Captures d\'écran désactivées';
  
  notification.textContent = message;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
}

function updateScreenshotsButton() {
  const btn = document.getElementById('test-recorder-screenshots');
  if (btn) {
    // Les captures d'écran sont maintenant disponibles sur toutes les pages
    btn.style.opacity = screenshotsEnabled ? '1' : '0.5';
    btn.style.cursor = 'pointer';
    btn.title = screenshotsEnabled ? 'Captures d\'écran activées' : 'Captures d\'écran désactivées';
  }
}

function showSecurityNotification() {
  // Cette fonction n'est plus nécessaire car les captures d'écran
  // sont maintenant autorisées sur toutes les pages
  console.log('Notifications de sécurité désactivées - captures d\'écran autorisées partout');
}

function toggleActionsList() {
  const actionsList = document.getElementById('test-recorder-actions');
  const toggleBtn = document.getElementById('test-recorder-toggle');
  
  if (actionsList.style.display === 'none') {
    actionsList.style.display = 'block';
    toggleBtn.textContent = '📋';
    updateActionList();
  } else {
    actionsList.style.display = 'none';
    toggleBtn.textContent = '📋';
  }
}

function updateActionList() {
  const actionsContent = document.getElementById('test-recorder-actions-content');
  if (!actionsContent) return;
  
  actionsContent.innerHTML = '';
  
  // Afficher les 10 dernières actions
  const recentActions = testSteps.slice(-10).reverse();
  
  recentActions.forEach((step, index) => {
    const actionItem = document.createElement('div');
    actionItem.className = 'action-item';
    
    // Préparer l'affichage de la capture d'écran
    const screenshotHtml = step.screenshot ? 
      `<div class="action-screenshot">
        <img src="${step.screenshot}" alt="Capture d'écran de l'action" class="screenshot-thumbnail" />
        <button class="view-screenshot-btn" data-screenshot="${step.screenshot}">🔍</button>
      </div>` : 
      `<div class="action-screenshot">
        <span class="no-screenshot">📷</span>
      </div>`;
    
    actionItem.innerHTML = `
      <div class="action-info">
        <span class="action-number">#${testSteps.length - index}</span>
        <span class="action-element">${step.element}</span>
        <span class="action-comment">${step.comment}</span>
        ${step.needsJustification ? '<span class="needs-justification">⚠️</span>' : ''}
      </div>
      <div class="action-controls">
        ${screenshotHtml}
        ${step.needsJustification ? 
          `<button class="justify-btn" data-index="${testSteps.length - 1 - index}">Justifier</button>` : 
          `<span class="justified">✅</span>`
        }
      </div>
    `;
    
    actionsContent.appendChild(actionItem);
  });
  
  // Ajouter les gestionnaires pour les boutons de justification
  document.querySelectorAll('.justify-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      justifyAction(index);
    });
  });
  
  // Ajouter les gestionnaires pour les boutons de visualisation des captures d'écran
  document.querySelectorAll('.view-screenshot-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const screenshot = e.target.dataset.screenshot;
      showScreenshotModal(screenshot);
    });
  });
}

function showScreenshotModal(screenshot) {
  // Créer un modal pour afficher la capture d'écran en grand
  const modal = document.createElement('div');
  modal.id = 'screenshot-modal';
  modal.className = 'screenshot-modal';
  modal.innerHTML = `
    <div class="screenshot-modal-content">
      <div class="screenshot-modal-header">
        <h3>Capture d'écran de l'action</h3>
        <button class="close-screenshot-btn">✕</button>
      </div>
      <div class="screenshot-modal-body">
        <img src="${screenshot}" alt="Capture d'écran" class="screenshot-full" />
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Gestionnaires pour fermer le modal
  modal.querySelector('.close-screenshot-btn').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Fermer avec Escape
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

function justifyAction(index) {
  const step = testSteps[index];
  if (!step) return;
  
  const comment = prompt(`Justifiez l'action sur ${step.element}:\n\nSélecteur: ${step.selector}`, step.comment);
  
  if (comment !== null) {
    step.comment = comment;
    step.needsJustification = false;
    updateActionList();
  }
}

function clearActions() {
  if (confirm('Voulez-vous vraiment effacer toutes les actions enregistrées ?')) {
    testSteps = [];
    updateStepCount();
    updateActionList();
  }
}

function hideRecordingIndicator() {
  const indicator = document.getElementById('test-recorder-indicator');
  if (indicator) {
    indicator.remove();
  }
}

function updateStepCount() {
  const stepCountElement = document.querySelector('.step-count');
  if (stepCountElement) {
    stepCountElement.textContent = `Étapes: ${testSteps.length}`;
  }
}

// Mettre à jour le compteur après chaque étape
const originalPush = testSteps.push;
testSteps.push = function(...args) {
  const result = originalPush.apply(this, args);
  updateStepCount();
  return result;
};

// Fonction pour télécharger les fichiers
function downloadFiles(files) {
  try {
    console.log('Téléchargement des fichiers...');
    
    Object.keys(files).forEach(key => {
      const file = files[key];
      const blob = new Blob([file.content], { type: file.type });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `test-recorder-${file.filename}`;
      link.style.display = 'none';
      
      // Ajouter au DOM, cliquer et supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL après un délai
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log(`Fichier téléchargé: ${file.filename}`);
    });
    
    // Afficher une notification de succès
    showSuccessNotification();
    
  } catch (error) {
    console.error('Erreur lors du téléchargement des fichiers:', error);
    showErrorNotification();
  }
}

// Fonction pour afficher une notification de succès
function showSuccessNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = '✅ Fichiers téléchargés avec succès !';
  
  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Supprimer la notification après 3 secondes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }, 3000);
}

// Fonction pour afficher une notification d'erreur
function showErrorNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #dc3545;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = '❌ Erreur lors du téléchargement des fichiers';
  
  document.body.appendChild(notification);
  
  // Supprimer la notification après 3 secondes
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

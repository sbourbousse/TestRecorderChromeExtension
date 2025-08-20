// Données d'exemple (à remplacer par les vraies données de l'extension)
let testSteps = [];
let currentFilter = 'all';

// Fonction pour charger les données depuis l'extension
function loadTestData() {
    console.log('Chargement des données...');
    
    // Afficher un message de chargement
    const container = document.getElementById('steps-container');
    const emptyState = document.getElementById('empty-state');
    
    container.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.innerHTML = `
        <h3>⏳ Chargement des données...</h3>
        <p>Recherche des données d'enregistrement dans vos onglets...</p>
    `;
    
    // Charger les vraies données depuis l'extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'getTestData' }, function(response) {
            console.log('Réponse reçue:', response);
            
            if (response && response.success && response.data && response.data.length > 0) {
                testSteps = response.data;
                updateStats();
                renderSteps();
                console.log(`${testSteps.length} étapes chargées`);
            } else {
                // Aucune donnée disponible, afficher l'état vide
                testSteps = [];
                updateStats();
                renderSteps();
                
                // Afficher un message plus informatif
                emptyState.innerHTML = `
                    <h3>📝 Aucune étape enregistrée trouvée</h3>
                    <p>Assurez-vous que :</p>
                    <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                        <li>Vous avez démarré l'enregistrement sur une page web</li>
                        <li>Vous avez effectué des actions sur la page</li>
                        <li>L'onglet avec l'enregistrement est toujours ouvert</li>
                    </ul>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button class="btn btn-primary" id="retry-btn">🔄 Réessayer</button>
                        <button class="btn btn-secondary" id="sample-btn">📋 Voir un exemple</button>
                    </div>
                `;
                
                // Ajouter les gestionnaires d'événements pour les nouveaux boutons
                document.getElementById('retry-btn').addEventListener('click', loadTestData);
                document.getElementById('sample-btn').addEventListener('click', loadSampleData);
            }
        });
    } else {
                 // Fallback pour les données d'exemple si l'extension n'est pas disponible
         console.log('Extension non disponible, utilisation des données d\'exemple');
         const sampleData = [
             {
                 selector: "button.login-btn",
                 comment: "Clic sur button (login-btn)",
                 expected: "L'élément button.login-btn doit être cliqué avec succès",
                 timestamp: "2025-01-16T10:30:00.000Z",
                 url: "https://example.com/login",
                 element: "button",
                 actionType: "click",
                 needsJustification: true,
                 screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
             },
             {
                 selector: "input#email",
                 comment: "Modification de input (email-input) : \"\" → \"user@example.com\"",
                 expected: "L'élément input#email doit contenir la valeur \"user@example.com\"",
                 timestamp: "2025-01-16T10:30:05.000Z",
                 url: "https://example.com/login",
                 element: "input",
                 actionType: "change",
                 oldValue: "",
                 newValue: "user@example.com",
                 needsJustification: false,
                 screenshot: null
             },
             {
                 selector: "input#password",
                 comment: "Modification de input (password-field) : \"\" → \"********\"",
                 expected: "L'élément input#password doit contenir la valeur \"********\"",
                 timestamp: "2025-01-16T10:30:10.000Z",
                 url: "https://example.com/login",
                 element: "input",
                 actionType: "change",
                 oldValue: "",
                 newValue: "********",
                 needsJustification: true,
                 screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
             },
             {
                 selector: "select#country",
                 comment: "Modification de select (country-select) : \"Sélectionner un pays\" → \"France\"",
                 expected: "L'élément select#country doit afficher la valeur \"France\"",
                 timestamp: "2025-01-16T10:30:15.000Z",
                 url: "https://example.com/login",
                 element: "select",
                 actionType: "change",
                 oldValue: "Sélectionner un pays",
                 newValue: "France",
                 needsJustification: false,
                 screenshot: null
             }
         ];

        testSteps = sampleData;
        updateStats();
        renderSteps();
    }
}

// Fonction pour mettre à jour les statistiques
function updateStats() {
    const totalSteps = testSteps.length;
    const screenshotsCount = testSteps.filter(step => step.screenshot).length;
    const clickSteps = testSteps.filter(step => step.actionType === 'click').length;
    const changeSteps = testSteps.filter(step => step.actionType === 'change').length;

    document.getElementById('total-steps').textContent = totalSteps;
    document.getElementById('justified-steps').textContent = clickSteps;
    document.getElementById('pending-steps').textContent = changeSteps;
    document.getElementById('screenshots-count').textContent = screenshotsCount;
}

// Fonction pour filtrer les étapes
function filterSteps(filter) {
    currentFilter = filter;
    
    // Mettre à jour les boutons de filtre
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    renderSteps();
}

// Fonction pour rendre les étapes
function renderSteps() {
    const container = document.getElementById('steps-container');
    const emptyState = document.getElementById('empty-state');
    
    if (testSteps.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    // Filtrer les étapes selon le filtre actuel
    let filteredSteps = testSteps;
    switch (currentFilter) {
        case 'with-screenshots':
            filteredSteps = testSteps.filter(step => step.screenshot);
            break;
        case 'click':
            filteredSteps = testSteps.filter(step => step.actionType === 'click');
            break;
        case 'change':
            filteredSteps = testSteps.filter(step => step.actionType === 'change');
            break;
    }

    container.innerHTML = filteredSteps.map((step, index) => `
        <div class="step-card" data-step-index="${testSteps.indexOf(step)}">
            <div class="step-header">
                <div class="step-number">${index + 1}</div>
                <div class="step-status">
                    <span class="status-badge ${step.actionType === 'click' ? 'status-justified' : 'status-pending'}">
                        ${step.actionType === 'click' ? '🖱️ Clic' : '✏️ Modification'}
                    </span>
                    ${step.screenshot ? '<span style="color: #667eea;">📷</span>' : ''}
                </div>
            </div>
            
            <div class="step-content">
                <div class="step-details">
                    <div class="detail-item">
                        <span class="detail-label">Action:</span>
                        <span class="detail-value">${step.comment}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Expected:</span>
                        <span class="detail-value">${step.expected || 'Non défini'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">
                            <span class="action-type-badge ${step.actionType === 'click' ? 'action-click' : 'action-change'}">
                                ${step.actionType === 'click' ? '🖱️ Clic' : '✏️ Modification'}
                            </span>
                        </span>
                    </div>
                    ${step.actionType === 'change' && step.oldValue !== step.newValue ? `
                    <div class="detail-item">
                        <span class="detail-label">Valeurs:</span>
                        <span class="detail-value">
                            <span class="value-change">
                                <span class="old-value">"${step.oldValue}"</span>
                                <span class="arrow">→</span>
                                <span class="new-value">"${step.newValue}"</span>
                            </span>
                        </span>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Sélecteur:</span>
                        <span class="detail-value">${step.selector}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Élément:</span>
                        <span class="detail-value">${step.element}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">URL:</span>
                        <span class="detail-value">${step.url}</span>
                    </div>
                    
                    <div class="justification-section">
                        <label for="action-${index}" style="font-weight: 600; color: #4a5568; margin-bottom: 10px; display: block;">
                            Action:
                        </label>
                        <textarea 
                            id="action-${index}" 
                            class="justification-textarea" 
                            placeholder="Décrivez l'action à effectuer..."
                        >${step.comment}</textarea>
                        
                        <label for="expected-${index}" style="font-weight: 600; color: #4a5568; margin-bottom: 10px; display: block; margin-top: 15px;">
                            Expected:
                        </label>
                        <textarea 
                            id="expected-${index}" 
                            class="justification-textarea" 
                            placeholder="Décrivez le résultat attendu..."
                        >${step.expected || ''}</textarea>
                        
                        <div class="justification-actions">
                            <button class="btn btn-success save-btn" data-step-index="${testSteps.indexOf(step)}">
                                💾 Sauvegarder
                            </button>
                            <button class="btn btn-danger delete-btn" data-step-index="${testSteps.indexOf(step)}">
                                🗑️ Supprimer
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="screenshot-container">
                    ${step.screenshot ? 
                        `<div style="position: relative;">
                            <img src="${step.screenshot}" alt="Capture d'écran" class="screenshot screenshot-img" data-screenshot="${step.screenshot}">
                            <button class="btn btn-danger remove-screenshot-btn" data-step-index="${testSteps.indexOf(step)}" style="position: absolute; top: 5px; right: 5px; padding: 5px 8px; font-size: 0.8em; min-width: auto;">🗑️</button>
                        </div>` : 
                        `<div class="no-screenshot">📷 Aucune capture d'écran</div>`
                    }
                </div>
            </div>
        </div>
    `).join('');
    
    // Ajouter les gestionnaires d'événements pour tous les boutons générés
    addEventListeners();
}

// Fonction pour sauvegarder une étape
function saveStep(stepIndex) {
    const actionTextarea = document.getElementById(`action-${testSteps.indexOf(testSteps[stepIndex])}`);
    const expectedTextarea = document.getElementById(`expected-${testSteps.indexOf(testSteps[stepIndex])}`);
    
    const newAction = actionTextarea.value.trim();
    const newExpected = expectedTextarea.value.trim();
    
    if (newAction) {
        testSteps[stepIndex].comment = newAction;
        testSteps[stepIndex].expected = newExpected;
        updateStats();
        renderSteps();
        
        // Sauvegarder les modifications
        saveChanges();
        showNotification('✅ Étape sauvegardée avec succès', 'success');
    } else {
        showNotification('❌ L\'action ne peut pas être vide', 'error');
    }
}

// Fonction pour supprimer une étape
function deleteStep(stepIndex) {
    const step = testSteps[stepIndex];
    
    // Demander confirmation
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer cette étape ?\n\nAction: ${step.comment}\nSélecteur: ${step.selector}`);
    
    if (confirmation) {
        // Supprimer l'étape du tableau
        testSteps.splice(stepIndex, 1);
        
        // Mettre à jour l'interface
        updateStats();
        renderSteps();
        saveChanges();
        
        // Afficher une notification
        showNotification(`✅ Étape supprimée avec succès`, 'success');
    }
}

// Fonction pour ouvrir le dialog de capture d'écran
function openDialog(screenshotSrc) {
    const dialog = document.getElementById('screenshot-dialog');
    const dialogImage = document.getElementById('dialog-image');
    
    if (dialog && dialogImage) {
        dialogImage.src = screenshotSrc;
        dialog.showModal(); // Utilise l'API native du dialog
    }
}

// Fonction pour fermer le dialog
function closeDialog() {
    const dialog = document.getElementById('screenshot-dialog');
    if (dialog) {
        dialog.close(); // Utilise l'API native du dialog
        // Réinitialiser l'image
        const dialogImage = document.getElementById('dialog-image');
        if (dialogImage) {
            dialogImage.src = '';
        }
    }
}

// Fonction pour sauvegarder les modifications
function saveChanges() {
    // Envoyer les modifications à l'extension
    console.log('Sauvegarde des modifications:', testSteps);
    
    // Ici, vous pouvez envoyer un message à l'extension pour sauvegarder les données
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
            action: 'saveTestData',
            data: testSteps
        });
    }
}

// Fonction pour ajouter tous les gestionnaires d'événements
function addEventListeners() {
    // Gestionnaires pour les boutons de sauvegarde
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const stepIndex = parseInt(this.dataset.stepIndex);
            saveStep(stepIndex);
        });
    });
    
    // Gestionnaires pour les boutons de suppression
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const stepIndex = parseInt(this.dataset.stepIndex);
            deleteStep(stepIndex);
        });
    });
    
    // Gestionnaires pour les captures d'écran
    document.querySelectorAll('.screenshot-img').forEach(img => {
        img.addEventListener('click', function() {
            const screenshotSrc = this.dataset.screenshot;
            openDialog(screenshotSrc);
        });
    });

    // Gestionnaires pour le bouton de suppression des captures d'écran
    document.querySelectorAll('.remove-screenshot-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const stepIndex = parseInt(this.dataset.stepIndex);
            const step = testSteps[stepIndex];
            const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer la capture d'écran de cette étape ?\n\nAction: ${step.comment}\nSélecteur: ${step.selector}`);

            if (confirmation) {
                step.screenshot = null; // Supprimer la capture d'écran du tableau
                updateStats();
                renderSteps();
                saveChanges();
                showNotification(`✅ Capture d'écran supprimée avec succès`, 'success');
            }
        });
    });
}

// Fonction pour charger les vraies données depuis l'extension
function loadRealData() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'getTestData' }, function(response) {
            if (response && response.success) {
                testSteps = response.data;
                updateStats();
                renderSteps();
            }
        });
    }
}

// Fonction pour charger les données d'exemple
function loadSampleData() {
    const sampleData = [
        {
            selector: "button.login-btn",
            comment: "Clic sur button (login-btn)",
            expected: "L'élément button.login-btn doit être cliqué avec succès",
            timestamp: "2025-01-16T10:30:00.000Z",
            url: "https://example.com/login",
            element: "button",
            actionType: "click",
            needsJustification: true,
            screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            selector: "input#email",
            comment: "Modification de input (email-input) : \"\" → \"user@example.com\"",
            expected: "L'élément input#email doit contenir la valeur \"user@example.com\"",
            timestamp: "2025-01-16T10:30:05.000Z",
            url: "https://example.com/login",
            element: "input",
            actionType: "change",
            oldValue: "",
            newValue: "user@example.com",
            needsJustification: false,
            screenshot: null
        },
        {
            selector: "input#password",
            comment: "Modification de input (password-field) : \"\" → \"********\"",
            expected: "L'élément input#password doit contenir la valeur \"********\"",
            timestamp: "2025-01-16T10:30:10.000Z",
            url: "https://example.com/login",
            element: "input",
            actionType: "change",
            oldValue: "",
            newValue: "********",
            needsJustification: true,
            screenshot: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            selector: "select#country",
            comment: "Modification de select (country-select) : \"Sélectionner un pays\" → \"France\"",
            expected: "L'élément select#country doit afficher la valeur \"France\"",
            timestamp: "2025-01-16T10:30:15.000Z",
            url: "https://example.com/login",
            element: "select",
            actionType: "change",
            oldValue: "Sélectionner un pays",
            newValue: "France",
            needsJustification: false,
            screenshot: null
        }
    ];

    testSteps = sampleData;
    updateStats();
    renderSteps();
}

// Fonction pour charger un fichier JSON
function loadFileData() {
    const fileInput = document.getElementById('file-input');
    fileInput.click();
}

// Fonction pour traiter le fichier sélectionné
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.name.endsWith('.json')) {
        showNotification('❌ Veuillez sélectionner un fichier JSON valide', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const fileContent = e.target.result;
            const data = JSON.parse(fileContent);
            
            // Vérifier si c'est un fichier de données d'enregistrement
            if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('selector')) {
                testSteps = data;
                updateStats();
                renderSteps();
                showNotification(`✅ ${data.length} étapes chargées depuis le fichier`, 'success');
            } else if (data.hasOwnProperty('testSteps') && Array.isArray(data.testSteps)) {
                // Format alternatif avec testSteps dans un objet
                testSteps = data.testSteps;
                updateStats();
                renderSteps();
                showNotification(`✅ ${data.testSteps.length} étapes chargées depuis le fichier`, 'success');
            } else {
                showNotification('❌ Format de fichier non reconnu. Le fichier doit contenir un tableau d\'étapes d\'enregistrement.', 'error');
            }
        } catch (error) {
            console.error('Erreur lors du parsing du fichier:', error);
            showNotification('❌ Erreur lors de la lecture du fichier. Vérifiez que c\'est un JSON valide.', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('❌ Erreur lors de la lecture du fichier', 'error');
    };
    
    reader.readAsText(file);
}

// Fonction pour exporter les données vers un fichier
function exportFileData() {
    if (testSteps.length === 0) {
        showNotification('❌ Aucune donnée à exporter', 'error');
        return;
    }
    
    // Créer l'objet de données avec métadonnées
    const exportData = {
        exportDate: new Date().toISOString(),
        totalSteps: testSteps.length,
        justifiedSteps: testSteps.filter(step => !step.needsJustification).length,
        pendingSteps: testSteps.filter(step => step.needsJustification).length,
        screenshotsCount: testSteps.filter(step => step.screenshot).length,
        testSteps: testSteps
    };
    
    // Convertir en JSON avec formatage
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Créer le blob et télécharger
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Créer le lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-recorder-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`✅ ${testSteps.length} étapes exportées avec succès`, 'success');
}

// Fonction pour ouvrir le modal de configuration d'export
function openExportConfigDialog() {
    const dialog = document.getElementById('export-config-dialog');
    if (dialog) {
        dialog.showModal();
    }
}

// Fonction pour fermer le modal de configuration d'export
function closeExportConfigDialog() {
    const dialog = document.getElementById('export-config-dialog');
    if (dialog) {
        dialog.close();
    }
}

// Fonction pour obtenir la configuration d'export depuis le modal
function getExportConfig() {
    const format = document.querySelector('input[name="export-format"]:checked').value;
    const selectedProps = Array.from(document.querySelectorAll('input[name="export-props"]:checked'))
        .map(input => input.value);
    const imageHandling = document.querySelector('input[name="image-handling"]:checked').value;
    
    return {
        format,
        properties: selectedProps,
        imageHandling
    };
}

// Fonction pour exporter en Markdown
function exportToMarkdown(config) {
    if (testSteps.length === 0) {
        showNotification('❌ Aucune donnée à exporter', 'error');
        return;
    }

    const { properties, imageHandling } = config;
    
    // Créer le contenu Markdown
    let markdownContent = `# Test Recorder - Rapport d'Enregistrement\n\n`;
    markdownContent += `> 📅 **Date d'export:** ${new Date().toLocaleString('fr-FR')}\n`;
    markdownContent += `> 📊 **Total d'étapes:** ${testSteps.length}\n`;
    markdownContent += `> 🖱️ **Actions de clic:** ${testSteps.filter(step => step.actionType === 'click').length}\n`;
    markdownContent += `> ✏️ **Modifications:** ${testSteps.filter(step => step.actionType === 'change').length}\n`;
    markdownContent += `> 📷 **Captures d'écran:** ${testSteps.filter(step => step.screenshot).length}\n\n`;
    
    // Ajouter un tableau de contenu si il y a beaucoup d'étapes
    if (testSteps.length > 5) {
        markdownContent += `## 📋 Tableau des Matières\n\n`;
        testSteps.forEach((step, index) => {
            const actionType = step.actionType === 'click' ? '🖱️' : '✏️';
            markdownContent += `${index + 1}. [${actionType} ${step.comment.substring(0, 50)}...]($etape-${index + 1})\n`;
        });
        markdownContent += `\n---\n\n`;
    }

    // Traiter chaque étape
    testSteps.forEach((step, index) => {
        const actionType = step.actionType === 'click' ? '🖱️' : '✏️';
        
        markdownContent += `## ${actionType} Étape ${index + 1}\n\n`;
        
        // Action
        if (properties.includes('action')) {
            markdownContent += `### 🎯 Action\n\n`;
            markdownContent += `**${step.comment}**\n\n`;
        }
        
        // Expected
        if (properties.includes('expected')) {
            markdownContent += `### ✅ Expected\n\n`;
            markdownContent += `${step.expected || 'Non défini'}\n\n`;
        }
        
        // Détails techniques
        if (properties.includes('selector') || properties.includes('element') || 
            properties.includes('url') || properties.includes('values')) {
            
            markdownContent += `### 🔧 Détails Techniques\n\n`;
            markdownContent += `| Propriété | Valeur |\n`;
            markdownContent += `|-----------|--------|\n`;
            
            if (properties.includes('selector')) {
                markdownContent += `| **Sélecteur** | \`${step.selector}\` |\n`;
            }
            
            if (properties.includes('element')) {
                markdownContent += `| **Élément** | \`${step.element}\` |\n`;
            }
            
            if (properties.includes('url')) {
                markdownContent += `| **URL** | \`${step.url}\` |\n`;
            }
            
            if (properties.includes('values') && step.actionType === 'change' && step.oldValue !== step.newValue) {
                markdownContent += `| **Valeurs** | \`"${step.oldValue}"\` → \`"${step.newValue}"\` |\n`;
            }
            
            markdownContent += `\n`;
        }
        
        // Capture d'écran
        if (properties.includes('screenshot') && step.screenshot) {
            markdownContent += `### 📷 Capture d'Écran\n\n`;
            
            if (imageHandling === 'embed') {
                // Intégrer l'image en Base64
                markdownContent += `![Capture d'écran - Étape ${index + 1}](${step.screenshot})\n\n`;
                markdownContent += `*<sub>Image intégrée en Base64 - Étape ${index + 1}</sub>*\n\n`;
            } else {
                // Référence vers un fichier externe
                const imageFileName = `screenshot-step-${index + 1}.png`;
                markdownContent += `![Capture d'écran - Étape ${index + 1}](./images/${imageFileName})\n\n`;
                markdownContent += `*<sub>Image externe: \`./images/${imageFileName}\`</sub>*\n\n`;
            }
        }
        
        markdownContent += `---\n\n`;
    });
    
    // Ajouter un résumé détaillé à la fin
    markdownContent += `## 📊 Résumé Détaillé\n\n`;
    
    const clickSteps = testSteps.filter(step => step.actionType === 'click');
    const changeSteps = testSteps.filter(step => step.actionType === 'change');
    const screenshotSteps = testSteps.filter(step => step.screenshot);
    
    markdownContent += `### Statistiques Générales\n\n`;
    markdownContent += `| Métrique | Valeur |\n`;
    markdownContent += `|----------|--------|\n`;
    markdownContent += `| **Total d'étapes** | ${testSteps.length} |\n`;
    markdownContent += `| **Actions de clic** | ${clickSteps.length} |\n`;
    markdownContent += `| **Modifications** | ${changeSteps.length} |\n`;
    markdownContent += `| **Étapes avec captures** | ${screenshotSteps.length} |\n\n`;
    
    // Ajouter des détails sur les URLs visitées
    const uniqueUrls = [...new Set(testSteps.map(step => step.url))];
    if (uniqueUrls.length > 1) {
        markdownContent += `### 🌐 URLs Visitées\n\n`;
        uniqueUrls.forEach(url => {
            const stepsOnUrl = testSteps.filter(step => step.url === url).length;
            markdownContent += `- \`${url}\` (${stepsOnUrl} étapes)\n`;
        });
        markdownContent += `\n`;
    }
    
    // Ajouter des détails sur les types d'éléments
    const elementTypes = {};
    testSteps.forEach(step => {
        elementTypes[step.element] = (elementTypes[step.element] || 0) + 1;
    });
    
    if (Object.keys(elementTypes).length > 1) {
        markdownContent += `### 🏷️ Types d'Éléments\n\n`;
        Object.entries(elementTypes).forEach(([element, count]) => {
            markdownContent += `- \`${element}\`: ${count} action(s)\n`;
        });
        markdownContent += `\n`;
    }
    
    markdownContent += `---\n\n`;
    markdownContent += `*📝 Rapport généré automatiquement par Test Recorder*\n`;
    markdownContent += `*🕒 Généré le ${new Date().toLocaleString('fr-FR')}*\n`;
    
    // Créer le blob et télécharger
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Créer le lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-recorder-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Si on utilise un dossier séparé pour les images, créer un ZIP avec les images
    if (imageHandling === 'folder' && testSteps.some(step => step.screenshot)) {
        createMarkdownZip(markdownContent, config);
    } else {
        showNotification(`✅ Rapport Markdown exporté avec succès`, 'success');
    }
}

// Fonction pour créer un ZIP avec les images (si nécessaire)
function createImageZip() {
    // Cette fonction nécessiterait une bibliothèque comme JSZip
    // Pour l'instant, on affiche juste une notification
    showNotification(`📁 Les images seront sauvegardées dans un dossier séparé`, 'info');
}

// Fonction pour créer un ZIP avec le rapport Markdown et les images
async function createMarkdownZip(markdownContent, config) {
    if (!window.JSZip) {
        showNotification('❌ Bibliothèque JSZip non disponible', 'error');
        return;
    }

    try {
        const zip = new JSZip();
        
        // Ajouter le fichier Markdown principal
        zip.file('README.md', markdownContent);
        
        // Créer un dossier images
        const imagesFolder = zip.folder('images');
        
        // Ajouter les images des étapes qui ont des captures d'écran
        let imageCount = 0;
        testSteps.forEach((step, index) => {
            if (step.screenshot && config.properties.includes('screenshot')) {
                // Extraire les données Base64 de l'image
                const base64Data = step.screenshot.split(',')[1];
                if (base64Data) {
                    const imageFileName = `screenshot-step-${index + 1}.png`;
                    imagesFolder.file(imageFileName, base64Data, {base64: true});
                    imageCount++;
                }
            }
        });
        
        // Ajouter un fichier README pour le dossier images
        const imagesReadme = `# Dossier Images

Ce dossier contient les captures d'écran des étapes d'enregistrement.

## Fichiers inclus:
${testSteps.map((step, index) => {
    if (step.screenshot && config.properties.includes('screenshot')) {
        return `- \`screenshot-step-${index + 1}.png\` : Capture de l'étape ${index + 1} - ${step.comment}`;
    }
    return null;
}).filter(Boolean).join('\n')}

## Total: ${imageCount} image(s)

*Généré automatiquement par Test Recorder*`;
        
        imagesFolder.file('README.md', imagesReadme);
        
        // Générer le ZIP
        const zipBlob = await zip.generateAsync({type: 'blob'});
        
        // Télécharger le ZIP
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-recorder-report-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`✅ ZIP créé avec succès (${imageCount} images)`, 'success');
        
    } catch (error) {
        console.error('Erreur lors de la création du ZIP:', error);
        showNotification('❌ Erreur lors de la création du ZIP', 'error');
    }
}

// Fonction pour exporter avec configuration
function exportWithConfig() {
    const config = getExportConfig();
    
    if (config.format === 'markdown') {
        exportToMarkdown(config);
    } else {
        exportFileData(); // Export JSON par défaut
    }
    
    closeExportConfigDialog();
}

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Ajouter les styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Ajouter le style d'animation
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
            .notification-close:hover {
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', function() {
    // Charger les données
    loadTestData();
    
    // Gestionnaire pour le bouton de rafraîchissement principal
    document.getElementById('refresh-btn').addEventListener('click', loadTestData);
    
    // Gestionnaire pour le bouton de chargement de fichier
    document.getElementById('load-file-btn').addEventListener('click', loadFileData);
    
    // Gestionnaire pour le bouton d'export de fichier
    document.getElementById('export-file-btn').addEventListener('click', exportFileData);
    
    // Gestionnaire pour le bouton de configuration d'export
    document.getElementById('export-config-btn').addEventListener('click', openExportConfigDialog);
    
    // Gestionnaires pour le modal de configuration d'export
    document.getElementById('cancel-export-config').addEventListener('click', closeExportConfigDialog);
    document.getElementById('confirm-export-config').addEventListener('click', exportWithConfig);
    
    // Gestionnaire pour l'input de fichier
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
    
    // Gestionnaire pour le bouton de rafraîchissement dans l'état vide
    // document.getElementBycuId('empty-refresh-btn').addEventListener('click', loadTestData);
    
         // Gestionnaire pour le bouton de fermeture du dialog
     const closeDialogBtn = document.getElementById('close-dialog-btn');
     if (closeDialogBtn) {
         closeDialogBtn.addEventListener('click', function(e) {
             e.preventDefault();
             e.stopPropagation();
             closeDialog();
         });
     }
    
    // Gestionnaires pour les filtres
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterSteps(this.dataset.filter);
        });
    });
    
         // Fermer le dialog en cliquant à l'extérieur (géré automatiquement par le dialog natif)
     const dialog = document.getElementById('screenshot-dialog');
     if (dialog) {
         dialog.addEventListener('click', function(e) {
             if (e.target === this) {
                 closeDialog();
             }
         });
     }
     
     // Fermeture avec Escape est gérée automatiquement par le dialog natif
});

// Exposer les fonctions globalement pour l'extension
window.TestRecorderInterface = {
    loadRealData,
    loadSampleData,
    updateSteps: function(newSteps) {
        testSteps = newSteps;
        updateStats();
        renderSteps();
    }
};

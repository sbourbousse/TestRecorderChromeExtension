# 🔧 Guide de Dépannage - Test Recorder

## 🚨 Problèmes Courants et Solutions

### 1. Erreur dans background.js

**Symptôme :** Erreur JavaScript dans la console de l'extension

**Solutions :**
- ✅ **Corrigé** : Suppression de l'opérateur de chaînage optionnel (`?.`) non supporté
- ✅ **Ajouté** : Gestion d'erreurs robuste avec try/catch
- ✅ **Amélioré** : Validation des données avant traitement

### 2. L'extension ne se charge pas

**Symptôme :** L'extension n'apparaît pas dans Chrome

**Solutions :**
1. Vérifiez que tous les fichiers sont présents :
   ```
   test-recorder/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── content.js
   ├── background.js
   ├── modal.css
   └── images/
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

2. Vérifiez le manifest.json :
   - Assurez-vous que `manifest_version` est à `3`
   - Vérifiez que tous les fichiers référencés existent

3. Rechargez l'extension :
   - Allez dans `chrome://extensions/`
   - Cliquez sur le bouton de rechargement de l'extension

### 3. Le popup ne s'ouvre pas

**Symptôme :** L'icône de l'extension ne répond pas au clic

**Solutions :**
1. Vérifiez les erreurs dans la console :
   - Clic droit sur l'icône → "Inspecter l'élément"
   - Regardez la console pour les erreurs

2. Vérifiez le fichier popup.html :
   - Assurez-vous qu'il n'y a pas d'erreurs de syntaxe
   - Vérifiez que popup.js est bien référencé

### 4. L'enregistrement ne démarre pas

**Symptôme :** Le bouton "Démarrer" ne fonctionne pas

**Solutions :**
1. Vérifiez que vous êtes sur une page web valide :
   - L'URL doit commencer par `http://` ou `https://`
   - Les pages `chrome://`, `file://` ne fonctionnent pas

2. Vérifiez les permissions :
   - Allez dans `chrome://extensions/`
   - Cliquez sur "Détails" de l'extension
   - Vérifiez que toutes les permissions sont accordées

3. Rechargez la page web :
   - Appuyez sur F5 ou Ctrl+R
   - Réessayez de démarrer l'enregistrement

### 5. Le modal d'annotation n'apparaît pas

**Symptôme :** Aucun modal après avoir cliqué sur un élément

**Solutions :**
1. Vérifiez que l'enregistrement est actif :
   - L'indicateur rouge doit être visible en haut à droite
   - Le popup doit indiquer "Enregistrement en cours..."

2. Vérifiez les erreurs dans la console de la page :
   - F12 → Console
   - Cherchez les erreurs liées à l'extension

3. Vérifiez le fichier modal.css :
   - Assurez-vous qu'il est bien chargé
   - Vérifiez qu'il n'y a pas de conflits CSS

### 6. Les fichiers ne se téléchargent pas

**Symptôme :** Aucun fichier téléchargé après avoir arrêté l'enregistrement

**Solutions :**
1. Vérifiez les paramètres de téléchargement Chrome :
   - Allez dans Paramètres Chrome → Avancés → Téléchargements
   - Assurez-vous que "Demander où enregistrer chaque fichier" est activé

2. Vérifiez les permissions de téléchargement :
   - L'extension doit avoir la permission `downloads`
   - Vérifiez dans `chrome://extensions/`

3. Vérifiez l'espace disque :
   - Assurez-vous d'avoir suffisamment d'espace libre

### 7. Erreurs de sélecteurs CSS

**Symptôme :** Les sélecteurs générés ne fonctionnent pas

**Solutions :**
1. Vérifiez la structure de la page :
   - Certains sites dynamiques peuvent changer la structure
   - Rechargez la page et réessayez

2. Utilisez des sélecteurs plus robustes :
   - L'extension privilégie les IDs
   - Les classes sont utilisées en second choix

### 8. Problèmes de performance

**Symptôme :** L'extension ralentit le navigateur

**Solutions :**
1. Limitez le nombre d'étapes :
   - Évitez d'enregistrer plus de 50 étapes par session
   - Arrêtez et redémarrez l'enregistrement si nécessaire

2. Fermez les onglets inutiles :
   - Réduisez le nombre d'onglets ouverts
   - Fermez les extensions non utilisées

## 🛠️ Outils de Diagnostic

### 1. Console de l'Extension
```javascript
// Dans chrome://extensions/, cliquez sur "Service Worker" pour voir les logs
console.log('Test Recorder - Extension chargée');
```

### 2. Console de la Page
```javascript
// Dans la console de la page web (F12)
// Vérifiez si le content script est chargé
console.log('Test Recorder - Content script actif');
```

### 3. Vérification des Permissions
```javascript
// Dans la console de l'extension
chrome.permissions.getAll((permissions) => {
  console.log('Permissions:', permissions);
});
```

## 📋 Checklist de Diagnostic

Avant de signaler un problème, vérifiez :

- [ ] Chrome est à jour (dernière version)
- [ ] L'extension est correctement installée
- [ ] Toutes les permissions sont accordées
- [ ] Vous êtes sur une page web valide (http/https)
- [ ] La console ne montre pas d'erreurs
- [ ] L'enregistrement est actif (indicateur rouge visible)
- [ ] Les fichiers de l'extension sont complets

## 🆘 Support

Si le problème persiste :

1. **Collectez les informations :**
   - Version de Chrome
   - Version de l'extension
   - URL de la page testée
   - Messages d'erreur de la console
   - Étapes pour reproduire le problème

2. **Testez sur la page de test :**
   - Ouvrez `test.html` dans votre navigateur
   - Essayez d'enregistrer quelques actions
   - Vérifiez si le problème persiste

3. **Signalez le problème :**
   - Créez une issue sur GitHub
   - Incluez toutes les informations collectées
   - Décrivez précisément le comportement attendu vs observé

---

**💡 Conseil :** Testez toujours l'extension sur la page `test.html` fournie avant de l'utiliser sur d'autres sites.

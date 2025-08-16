# 🎬 Test Recorder for TestRail

Une extension Chrome pour enregistrer automatiquement vos actions sur une page web et générer des cas de test TestRail.

## 🆕 Nouvelles Fonctionnalités (v2.0)

### ✨ Enregistrement Non-Intrusif
- **Plus de popups intempestives** : L'enregistrement se fait en arrière-plan sans interrompre votre workflow
- **Justification a posteriori** : Justifiez vos actions quand vous le souhaitez, pas pendant l'action
- **Indicateur intelligent** : Visualisez vos actions en temps réel avec un compteur incrémental

### 📋 Liste des Actions en Temps Réel
- **Vue d'ensemble** : Consultez les 10 dernières actions enregistrées
- **Justification flexible** : Cliquez sur "Justifier" pour modifier la description d'une action
- **Statut visuel** : Actions justifiées (✅) vs actions à justifier (⚠️)
- **Gestion des actions** : Effacez toutes les actions si nécessaire

### 🔄 Synchronisation Améliorée
- **État persistant** : La popup se souvient de l'état d'enregistrement
- **Contrôle fiable** : Boutons "Démarrer" et "Arrêter" toujours synchronisés
- **Détection automatique** : L'extension détecte automatiquement si un enregistrement est en cours

## 📋 Fonctionnalités Principales

- ✅ Enregistrement automatique des clics sur les éléments de la page
- ✅ Génération de sélecteurs CSS uniques pour chaque élément
- ✅ **Nouveau** : Enregistrement non-intrusif avec justification a posteriori
- ✅ **Nouveau** : Liste des actions en temps réel avec gestion flexible
- ✅ Génération automatique de fichiers TestRail JSON
- ✅ Log détaillé des sélecteurs et actions
- ✅ Interface utilisateur moderne et responsive

## 🚀 Installation

### Méthode 1 : Installation en mode développeur

1. **Téléchargez ou clonez ce repository**
   ```bash
   git clone <url-du-repo>
   cd test-recorder
   ```

2. **Ouvrez Chrome et allez dans les extensions**
   - Tapez `chrome://extensions/` dans la barre d'adresse
   - Ou allez dans Menu → Plus d'outils → Extensions

3. **Activez le mode développeur**
   - Cliquez sur le bouton "Mode développeur" en haut à droite

4. **Chargez l'extension**
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier `test-recorder`

5. **L'extension est maintenant installée !**
   - Vous verrez l'icône Test Recorder dans votre barre d'outils

### Méthode 2 : Installation depuis le Chrome Web Store

*Disponible prochainement*

## 📖 Utilisation

### 1. Démarrer l'enregistrement

1. Naviguez vers la page web que vous souhaitez tester
2. Cliquez sur l'icône Test Recorder dans la barre d'outils
3. Cliquez sur "▶ Démarrer l'enregistrement"
4. Un indicateur rouge apparaîtra en haut à droite de la page

### 2. Enregistrer vos actions (Nouveau !)

1. **Interagissez librement** avec la page (plus d'interruptions !)
2. Chaque clic est automatiquement enregistré en arrière-plan
3. Observez le compteur d'étapes dans l'indicateur
4. Cliquez sur l'icône 📋 pour voir la liste de vos actions

### 3. Gérer vos actions (Nouveau !)

1. **Consultez vos actions** : Cliquez sur 📋 dans l'indicateur
2. **Justifiez les actions importantes** : Cliquez sur "Justifier" pour modifier la description
3. **Suivez le statut** : Actions justifiées (✅) vs actions à justifier (⚠️)
4. **Gérez vos actions** : Effacez toutes les actions avec 🗑️ si nécessaire

### 4. Arrêter et générer les fichiers

1. Une fois vos actions terminées, cliquez sur l'icône Test Recorder
2. Cliquez sur "⏹ Arrêter l'enregistrement"
3. Les fichiers suivants seront automatiquement téléchargés :
   - `test-recorder-testrail.json` : Format TestRail API
   - `test-recorder-selector_log.txt` : Log détaillé des actions

## 🧪 Test de l'Extension

Utilisez le fichier `test-simple.html` inclus pour tester toutes les fonctionnalités :
- Formulaire interactif
- Boutons de différents types
- Liens de test
- Instructions détaillées

## 📁 Structure des fichiers générés

### testrail.json
```json
{
  "title": "Test Case - 16/08/2025 - 3 étapes",
  "template_id": 1,
  "type_id": 1,
  "priority_id": 2,
  "custom_steps_separated": [
    {
      "content": "Étape 1: Cliquer sur le bouton de connexion",
      "expected": "L'élément button.login-btn doit être accessible et fonctionnel"
    }
  ],
  "custom_metadata": {
    "recorded_at": "2025-08-16T20:53:00.000Z",
    "total_steps": 3,
    "url": "https://example.com"
  }
}
```

### selector_log.txt
```
=== LOG D'ENREGISTREMENT TEST RECORDER ===
Date: 16/08/2025 22:53:00
URL: https://example.com
Nombre total d'étapes: 3

=== ÉTAPE 1 ===
Timestamp: 2025-08-16T20:53:00.000Z
Sélecteur CSS: button.login-btn
Action: Cliquer sur le bouton de connexion
URL: https://example.com

=== FIN DU LOG ===
```

## ⚙️ Configuration TestRail

Pour utiliser les fichiers générés avec TestRail :

1. **Importez le JSON via l'API TestRail**
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -u "votre-email:votre-password" \
     -d @test-recorder-testrail.json \
     "https://votre-instance.testrail.com/api/v2/add_case/1"
   ```

2. **Ou créez manuellement le cas de test**
   - Ouvrez le fichier `testrail.json`
   - Copiez le contenu dans l'interface TestRail

## 🛠️ Développement

### Structure du projet
```
test-recorder/
├── manifest.json          # Configuration de l'extension
├── popup.html             # Interface du popup
├── popup.js               # Logique du popup (synchronisation améliorée)
├── content.js             # Script injecté (enregistrement non-intrusif)
├── background.js          # Service worker
├── modal.css              # Styles pour l'indicateur et la liste d'actions
├── test-simple.html       # Page de test pour valider l'extension
├── images/                # Icônes de l'extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # Ce fichier
```

### Permissions requises
- `activeTab` : Accès à l'onglet actif
- `scripting` : Injection de scripts
- `storage` : Stockage des données
- `downloads` : Téléchargement de fichiers
- `notifications` : Notifications système

## 🐛 Dépannage

### L'extension ne fonctionne pas sur certaines pages
- Vérifiez que vous êtes sur une page web (http/https)
- Certaines pages avec des restrictions de sécurité peuvent ne pas fonctionner

### Les fichiers ne se téléchargent pas
- Vérifiez que les téléchargements sont autorisés dans Chrome
- Vérifiez les permissions de l'extension

### L'enregistrement ne démarre pas
- Vérifiez que le content script est bien injecté
- Rechargez la page et réessayez
- Vérifiez que vous n'êtes pas sur la popup de l'extension

### La synchronisation ne fonctionne pas
- Fermez et rouvrez la popup de l'extension
- Rechargez la page web
- Vérifiez que l'extension est bien installée

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez que vous utilisez la dernière version de Chrome
2. Consultez la section Dépannage ci-dessus
3. Ouvrez une issue sur GitHub avec les détails du problème

---

**Développé avec ❤️ pour simplifier les tests TestRail**

# Test Recorder for TestRail

Une extension Chrome pour enregistrer automatiquement les actions sur une page web et générer des cas de test TestRail.

## 🚀 Nouvelles Fonctionnalités

### ✨ Fonctionnalités Ajoutées

1. **🗑️ Suppression des captures d'écran** : Possibilité de retirer une capture d'écran d'une étape spécifique
2. **📝 Champ Expected** : Ajout d'un champ "Expected" pour chaque étape avec un deuxième textarea
3. **⌨️ Raccourci de justification** : Pendant l'enregistrement, utilisez `Ctrl+J` pour justifier rapidement la dernière étape
4. **📷 Captures d'écran propres** : L'indicateur d'enregistrement est automatiquement masqué lors des captures d'écran

### 🔧 Corrections Apportées

1. **❌ Suppression des justifications** : Retrait des mentions "Justifié" / "Non justifié" des rapports
2. **⏰ Suppression des timestamps** : Les timestamps ne sont plus inclus dans les exports

## 📋 Fonctionnalités

- **Enregistrement automatique** des clics et modifications sur les éléments de la page
- **Captures d'écran automatiques** pour chaque action (optionnel)
- **Interface de visualisation** pour examiner et modifier les étapes enregistrées
- **Export en JSON** pour TestRail
- **Export en Markdown** avec configuration avancée
- **Gestion des captures d'écran** avec possibilité de les supprimer
- **Champ Expected** pour définir le résultat attendu de chaque action
- **Raccourci clavier** `Ctrl+J` pour justifier rapidement la dernière étape

## 🎯 Utilisation

### Démarrage de l'enregistrement

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Cliquez sur "Démarrer l'enregistrement"
3. Effectuez vos actions sur la page web
4. Cliquez sur "Arrêter l'enregistrement" pour générer les fichiers

### Interface de visualisation

1. Cliquez sur "Voir l'interface" dans la popup de l'extension
2. Examinez et modifiez les étapes enregistrées
3. Utilisez les filtres pour afficher certains types d'actions
4. Exportez vos données dans différents formats

### Raccourcis clavier

- **Ctrl+J** : Justifier la dernière étape enregistrée (pendant l'enregistrement)

### Gestion des captures d'écran

- **Activer/Désactiver** : Cliquez sur le bouton 📷 dans l'indicateur d'enregistrement
- **Supprimer** : Cliquez sur le bouton 🗑️ à côté d'une capture d'écran
- **Visualiser** : Cliquez sur le bouton 🔍 pour voir une capture en grand

## 📁 Structure des fichiers

```
test-recorder/
├── manifest.json              # Configuration de l'extension
├── content.js                 # Script principal d'enregistrement
├── background.js              # Script de fond pour les captures d'écran
├── popup.html                 # Interface de la popup
├── popup.js                   # Logique de la popup
├── test-recorder-interface.html  # Interface de visualisation
├── test-recorder-interface.js    # Logique de l'interface
├── modal.css                  # Styles pour l'interface
├── libs/                      # Bibliothèques externes
│   └── jszip.min.js          # Pour la création de ZIP
└── images/                    # Icônes de l'extension
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🔧 Installation

1. Téléchargez ou clonez ce repository
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le "Mode développeur"
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier du projet

## 📊 Formats d'export

### JSON TestRail
Format compatible avec l'API TestRail pour l'import automatique de cas de test.

### Markdown
Rapport détaillé avec :
- Actions et résultats attendus
- Captures d'écran intégrées ou en dossier séparé
- Statistiques détaillées
- Filtres configurables

### Log de sélecteurs
Fichier texte avec tous les détails techniques des actions enregistrées.

## 🎨 Interface

L'interface de visualisation offre :
- **Vue d'ensemble** avec statistiques
- **Filtres** par type d'action et présence de captures d'écran
- **Édition** des champs Action et Expected
- **Gestion** des captures d'écran
- **Export** configurable

## 🔒 Sécurité

- Les captures d'écran sont converties en Base64 pour éviter les problèmes de sécurité
- L'extension ne fonctionne que sur les pages web (http/https)
- Aucune donnée n'est envoyée à des serveurs externes

## 🐛 Dépannage

Consultez le fichier `TROUBLESHOOTING.md` pour les solutions aux problèmes courants.

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Soumettre des pull requests

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

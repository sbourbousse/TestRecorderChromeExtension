# Fonctionnalités d'Export - Test Recorder

## 🎯 Vue d'ensemble

L'extension Test Recorder propose maintenant un système d'export avancé avec deux formats de sortie et des options de configuration personnalisables.

## 📄 Formats d'Export Disponibles

### 1. JSON (Format par défaut)
- Export complet avec toutes les métadonnées
- Compatible avec les outils d'automatisation
- Inclut les captures d'écran en Base64
- Structure hiérarchique avec statistiques

### 2. Markdown (Nouveau)
- Format lisible et bien structuré
- Compatible avec les plateformes de documentation
- Sections organisées : Action, Expected, Détails Techniques
- Support des captures d'écran intégrées ou externes

## ⚙️ Configuration d'Export

### Accès à la Configuration
1. Ouvrir l'interface de visualisation
2. Cliquer sur le bouton **"⚙️ Config Export"**
3. Configurer les options dans le modal

### Options Disponibles

#### Format d'Export
- **JSON** : Export technique complet
- **Markdown** : Export documenté et lisible

#### Propriétés à Inclure
- ✅ **Action** : Description de l'action effectuée
- ✅ **Expected** : Résultat attendu de l'action
- ✅ **Sélecteur** : Sélecteur CSS de l'élément
- ✅ **Élément** : Type d'élément HTML
- ✅ **URL** : URL de la page
- ✅ **Timestamp** : Date et heure de l'action
- ✅ **Captures d'écran** : Images des étapes
- ✅ **Valeurs** : Anciennes et nouvelles valeurs (pour les modifications)

#### Gestion des Images (Markdown uniquement)
- **Intégrer (Base64)** : Images directement dans le fichier Markdown
- **Dossier séparé** : Images sauvegardées dans un dossier externe

### Export ZIP avec Images (Nouveau !)
- **Fichier ZIP complet** : Contient le rapport Markdown et toutes les images
- **Structure organisée** : Dossier `images/` avec captures d'écran
- **README automatique** : Documentation des images incluses
- **Prêt à l'emploi** : Décompression et utilisation immédiate
- **JSZip local** : Utilise la bibliothèque JSZip incluse localement (pas de CDN)

### Configuration JSZip
- **Fichier local** : `libs/jszip.min.js` inclus dans l'extension
- **Pas de CDN** : Évite les problèmes de Content Security Policy
- **Version** : JSZip 3.10.1 (dernière version stable)
- **Compatibilité** : Fonctionne sur toutes les plateformes

## 📋 Structure du Rapport Markdown

### En-tête
```
# Test Recorder - Rapport d'Enregistrement

**Date d'export:** 16/01/2025 à 11:30:45
**Total d'étapes:** 4
**Étapes justifiées:** 2
**Étapes en attente:** 2
**Captures d'écran:** 2
```

### Structure par Étape
```markdown
## Étape 1

### Action
Description de l'action effectuée

### Expected
Résultat attendu de l'action

### Détails Techniques
**Sélecteur:** `button.login-btn`
**Élément:** `button`
**URL:** `https://example.com/login`
**Timestamp:** `16/01/2025 à 10:30:00`
**Valeurs:** `""` → `"user@example.com"`

### Capture d'Écran
![Capture d'écran - Étape 1](data:image/png;base64,...)
```

### Résumé Final
```markdown
## Résumé

- **Total d'étapes:** 4
- **Actions de clic:** 1
- **Modifications:** 3
- **Étapes avec captures:** 2
- **Étapes justifiées:** 2
- **Étapes en attente:** 2
```

## 🚀 Utilisation

### Export Rapide (JSON)
1. Cliquer sur **"💾 Exporter"**
2. Le fichier JSON est téléchargé automatiquement

### Export Configuré
1. Cliquer sur **"⚙️ Config Export"**
2. Choisir le format (JSON ou Markdown)
3. Sélectionner les propriétés à inclure
4. Configurer la gestion des images (Markdown)
5. Cliquer sur **"💾 Exporter"**

## 📁 Gestion des Fichiers

### Noms de Fichiers
- **JSON** : `test-recorder-data-YYYY-MM-DD.json`
- **Markdown** : `test-recorder-report-YYYY-MM-DD.md`

### Emplacement
Les fichiers sont téléchargés dans le dossier de téléchargement par défaut du navigateur.

### Structure du Fichier ZIP
```
test-recorder-report-YYYY-MM-DD.zip
├── README.md                    # Rapport Markdown principal
└── images/
    ├── README.md               # Documentation des images
    ├── screenshot-step-1.png   # Capture d'écran étape 1
    ├── screenshot-step-2.png   # Capture d'écran étape 2
    └── ...                     # Autres captures d'écran
```

## 🔧 Personnalisation Avancée

### Ajout de Propriétés Personnalisées
Pour ajouter de nouvelles propriétés d'export :

1. Modifier le modal HTML dans `test-recorder-interface.html`
2. Ajouter la logique dans `exportToMarkdown()` dans `test-recorder-interface.js`
3. Mettre à jour la fonction `getExportConfig()`

### Templates Markdown Personnalisés
Le template Markdown peut être modifié dans la fonction `exportToMarkdown()` pour :
- Changer la structure des sections
- Ajouter des métadonnées personnalisées
- Modifier le formatage des données
- Intégrer des styles CSS personnalisés

## 🎨 Exemples d'Utilisation

### Pour la Documentation
- Export Markdown avec toutes les propriétés
- Images intégrées en Base64
- Utilisation dans Confluence, GitHub, ou autres plateformes

### Pour l'Automatisation
- Export JSON avec sélecteurs et URLs
- Intégration avec Selenium, Playwright, ou autres outils
- Génération automatique de scripts de test

### Pour les Rapports
- Export Markdown avec captures d'écran
- Partage avec l'équipe de développement
- Documentation des cas de test

### Pour les Archives ZIP
- Export ZIP complet avec images séparées
- Partage facile via email ou plateformes
- Structure organisée pour archivage
- Compatible avec tous les systèmes

## 🔮 Évolutions Futures

- [ ] Support d'autres formats (HTML, PDF, Excel)
- [ ] Templates personnalisables
- [ ] Export vers des plateformes externes (TestRail, Jira)
- [ ] Génération automatique de scripts de test
- [ ] Support des annotations et commentaires avancés 
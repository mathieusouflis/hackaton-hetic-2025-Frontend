# Team UNFAIR (Sujet 2) - Panoramix Front-end

## Description du projet

Ce projet consiste en une **application de collaboration** divisée en deux parties : une **extension Chrome** et une **application web**. L'objectif est de permettre aux utilisateurs d'enregistrer et d'organiser facilement des contenus variés (liens, textes) sous forme de **cards**, classées dans des **boards** collaboratifs.

L'extension permet aux utilisateurs de sauvegarder divers éléments depuis le web :

- **Liens** : en provenance de sites web.
- **Textes** : extraits pertinents capturés sur des pages.
- **Notes** : pour commenter et ajouter des informations complémentaires.
- **Tags** : pour organiser et filtrer les contenus (bientôt automatisés avec l'IA).
- **Boards** : pour regrouper les cards par thème ou projet.

#### Fonctionnalités actuelles :

- Sauvegarde et publication automatique des card créer vers le board de son choix
- Consultation des board/cards enregistrer depuis le site web


#### Perspectives d'évolution :

- Ajout de la **gestion des comptes** et des **droits utilisateurs**.
- Création de **board public / privée** pour le travail collaboratif
- Implémentation d'une **modération** pour contrôler le contenu des boards.
- Intégration de **fonctionallités IA** (auto taging, résumer, recherche,...)
- Possibilité d'**intégrations webhook** pour connecter des bots (Discord, Twitter, etc.).
- Aumengmentation du nombre de type de sources sauvegardable.
  
---

## Infrastructure & Technologies utilisées

- **React**
- **Tailwinds**
- **SchadCn**
---


## Installation & Lancement

### Pré-requis

Assurez-vous d'avoir **Node.js** et **npm** installés sur votre machine.

### Installation des packages
Cloner le repo:
   ```bash
git clone https://github.com/mathieusouflis/hackaton-hetic-2025-Frontend.git
   ```

 Accéder au dossier racine :
   ```bash
   cd hackaton-hetic-2025-Frontend
   ```

Installer les dépendances globales :
   ```bash
   npm install
   ```

### Lancement de l'extension:

Pour utiliser l’extension faut build l'app "extension" dans le dossier apps:
`cd apps/extension`
`npm run build`

Aller dans la liste des extensions sur chrome et activer le mode developer puis ajouter le build.

### Lancer l'application web

Pour démarrer l'application **web** :
   ```bash
   npm run dev:web
   ```

L'application web sera accessible à l'adresse :
```
http://localhost:5174
```

---

## État actuel & défis

Les fonctionnalités principales de l'extention chrome sont opérationnelles, mais l'absence de gestion de compte et de droits utilisateurs limite l'utilisation en contexte collaboratif. Un gros travail d'UX et de design reste à faire.
Même état de l'art pour le client , web, la base de la nivagation est la avec un board infini dans la quelle l'utilisateur peux ce balader et consulter les différentes cards, mais ils manque encore beaucoup de feature.

Le projet continue d'évoluer avec un focus sur :

- La gestion des **comptes utilisateurs**.
- La mise en place de **droits d'administration** pour les boards.
- L'optimisation des **flux de travail collaboratif**.
- L'experience utilisateur et le design

---

## Équipe Front-end / Design:

- [Mathieu](https://github.com/mathieusouflis)
- [Clément](https://github.com/destrooooo)
- [Max](https://github.com/Oomaxime)

## Conclusion

Ce projet ambitionne de fournir un outil complet de collaboration pour la collecte et l'organisation d'informations. Grâce aux prochaines améliorations, il deviendra un espace encore plus sécurisé et personnalisé pour le travail en équipe.

*Dernière mise à jour : Mai 2025*

---
title: "OVOS & HiveMind dans l'industrie manufacturière"
description: "Les projets européens COALA et WASABI ont construit toute une framework d'assistant vocal industriel autour d'OVOS + HiveMind, en les intégrant avec leurs propres outils, interface et moteurs de conversation."
date: 2025-11-26
lang: fr
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

Les projets européens **[COALA](https://coala-ai.de)** et **[WASABI](https://wasabiproject.eu)** ont construit toute une framework d'assistant vocal industriel sur **[OpenVoiceOS](https://openvoiceos.org)** (une plateforme vocale open source à but non lucratif) et **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)**, en les intégrant avec leur propre interface Android, leur moteur de NLP et leur stack Docker.

Je n'ai pas été impliqué dans ces déploiements. C'est bien là l'essentiel : la stack est adoptée pour ses propres mérites, par des équipes ayant de véritables exigences industrielles.

---

## Appel à candidatures WASABI

Le 2e [Appel à candidatures WASABI](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) visant à apporter un soutien financier à au moins 10 expérimentations menées par des PME s'est récemment clôturé.
Cet appel à candidatures est conçu pour soutenir des expérimentations d'assistance numérique fondées sur l'IA impliquant des PME de l'industrie manufacturière.

Toutes les expérimentations de l'Appel à candidatures WASABI sont tenues de :

* faire tourner la **stack Docker OVOS de WASABI/COALA**
* se connecter via **HiveMind**
* développer une **Skill OVOS** personnalisée contenant leur logique industrielle

L'utilisation d'OVOS/HiveMind est expliquée dans ces 2 documents du projet WASABI :
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS et HiveMind dans le pilote industriel WASABI](../2025-11-26-OVOS-hivemind-industry.png)

---

## Exemples d'applications industrielles

### **1. Orientation des travailleurs et aide à l'assemblage**

Des expérimentations comme **[TICONAI](https://wasabiproject.eu/ticonai-2)** et **[SKITE](https://wasabiproject.eu/skite-main-2)** utilisent des skills OVOS pour guider les travailleurs lors de tâches complexes telles que l'assemblage de composants, la validation de procédures ou la fourniture d'instructions étape par étape sans les mains.

### **2. Contrôle qualité et réduction des erreurs**

Des projets comme **[WALLABI](https://wasabiproject.eu/wallabi)** et **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** se concentrent sur la fourniture aux travailleurs d'instructions et de listes de contrôle en temps réel pour éviter les erreurs. Les assistants vocaux aident les opérateurs à vérifier les réglages, à se souvenir des contrôles de sécurité ou à recouper les paramètres.

### **3. Aide à la maintenance prédictive**

Des expérimentations comme **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** utilisent l'assistant pour donner aux techniciens de maintenance un accès rapide aux données de santé des machines, aux explications des pannes et aux étapes de réparation, surtout lorsque leurs mains sont occupées.

### **4. Logistique, manutention des matériaux et soutien à l'entrepôt**

**[VELO](https://wasabiproject.eu/velo-2)** et **[AIVEA](https://wasabiproject.eu/aivea)** utilisent la voix pour aider les travailleurs à localiser des articles, à confirmer l'inventaire ou à vérifier les tâches de livraison tout en se déplaçant dans l'atelier.

### **5. Intégration et formation**

**[ONBOARD](https://wasabiproject.eu/onboard)** et **[AI-MODE](https://wasabiproject.eu/ai-mode)** testent comment les nouveaux employés peuvent être guidés dans leurs tâches par la voix, réduisant ainsi la charge des superviseurs.

### **6. Durabilité, suivi des déchets et efficacité des ressources**

**[VAFER](https://wasabiproject.eu/vafer)** intègre des interfaces vocales avec des systèmes qui surveillent le recyclage, la réutilisation des matériaux et les flux de ressources, avec un reporting sans les mains dans les environnements d'usine.

Tout cela repose sur OVOS et sur HiveMind pour acheminer la communication entre les appareils, l'interface Android et les systèmes de backend.

---

## Ce que COALA/WASABI a construit par-dessus OVOS

Bien que les projets n'aient produit aucune skill industrielle open source, ils ont créé plusieurs composants autour d'OVOS + HiveMind :

### **1. Un assistant de domaine (DA) basé sur RASA**

Les premières recherches de COALA ont développé un **pipeline de NLP RASA** entraîné sur des conversations de l'industrie manufacturière (à propos de contrôles qualité, de résolution de problèmes, d'exploitation de machines).
Dans WASABI, ce moteur RASA est branché sur OVOS en tant que **skill**, gérant le dialogue propre au domaine.

### **2. L'application Android COALA**

Un front-end Android pour les travailleurs, se connectant à OVOS via HiveMind.

Version initiale publiée ici :
[BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

Les fonctionnalités comprennent :

* connexion via Keycloak
* chat par texte ou par voix
* interface pour les instructions, avertissements et notes
* messagerie basée sur HiveMind

### **3. Une stack industrielle complète basée sur Docker**

Les deux projets fournissent un environnement Docker préconfiguré regroupant :

* OVOS
* HiveMind
* Keycloak (gestion des utilisateurs)
* moteur de NLP RASA
* services de connecteur COALA

Cela constitue la stack standard d'assistant vocal industriel que toutes les expérimentations WASABI doivent déployer.

### **4. Un jeu de données de parole industrielle**

COALA a publié un jeu de données de parole multilingue enregistré dans des usines et des ateliers :
[zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## Pourquoi cela fonctionne pour l'industrie

Les objectifs de conception qui comptent sur le terrain ont été intégrés dès le départ, et non ajoutés après coup : la transparence totale pour les secteurs réglementés, le déploiement local/edge sans dépendance au cloud, des skills modulaires pour la logique propriétaire, et la capacité de HiveMind à répartir des nœuds vocaux dans une installation.

Code source d'OVOS et de HiveMind : [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)

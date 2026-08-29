---
title: "Créer des voix synthétiques de toutes pièces"
description: "Créer une voix pour un système de synthèse vocale exige normalement qu'une personne réelle passe des heures à enregistrer de l'audio. C'est coûteux, long, et dans de nombreuses langues ou accents les voix n'existent tout simplement pas"
date: 2025-06-26
lang: fr
author: "Casimiro Ferreira"
tags:
  - "TTS"
  - "Synthetic Data"
  - "Voice Cloning"
  - "OVOS"
draft: false
---

> Cet article a été initialement publié sur le [blog d'OpenVoiceOS](https://blog.openvoiceos.org/posts/2025-06-26-making-synthetic-voices-from-scratch)

Une bonne voix TTS hors ligne pour le portugais européen n'existait pas. L'enregistrement en studio est coûteux, prend des mois, et dans la plupart des langues du monde les enregistrements n'ont tout simplement jamais eu lieu. Nous en avons donc construit quatre de toutes pièces, sans cabine d'enregistrement, sans comédien de doublage, ni cloud.

### Le pipeline en trois étapes

**1. Générer des paires de parole synthétiques.** Nous utilisons une voix TTS existante comme donneuse (n'importe quelle source capable de produire un audio intelligible) et nous la faisons tourner sur un large corpus de texte pour produire des milliers de paires audio/texte. La voix donneuse n'a pas besoin d'être de haute qualité. Elle doit juste être suffisamment cohérente pour qu'on puisse en apprendre.

**2. Appliquer la conversion de voix.** Une étape de conversion de voix transforme le timbre de la donneuse en une nouvelle identité : un genre, un âge ou un personnage différent. L'audio obtenu ressemble à la voix cible, pas à la donneuse.

**3. Entraîner un modèle VITS compact.** VITS est une architecture neuronale de synthèse vocale. L'audio converti devient le jeu d'entraînement d'un petit modèle VITS via [phoonnx_train](https://github.com/TigreGotico/phoonnx). Le modèle terminé est exporté vers ONNX (un format portable pour exécuter des modèles entraînés) et fonctionne entièrement hors ligne, sur un Raspberry Pi si nécessaire.

### Garde-fous éthiques

Si la donneuse est la voix d'une personne réelle, nous obtenons d'abord une permission explicite. Lorsqu'aucune permission n'est possible, nous utilisons des enregistrements du domaine public ou nous générons une voix entièrement originale qui ne copie l'identité de personne. L'étape de conversion de voix présente aussi une propriété utile pour la confidentialité : la sortie est acoustiquement suffisamment distincte de la donneuse pour que le risque d'usurpation soit négligeable.

### Appliqué au portugais européen

Le portugais européen n'avait aucune voix hors ligne ouverte de haute qualité. Nous avons produit quatre voix, dont les identités Miro et Dii qui sont désormais les voix OVOS par défaut pour `pt-PT`, en utilisant exactement ce pipeline. Elles fonctionnent confortablement sur du matériel modeste, ne nécessitent aucune connexion internet, et les données d'entraînement sont [publiées ouvertement](https://huggingface.co/TigreGotico) afin que chacun puisse les reproduire ou les étendre.

Tous les modèles et jeux de données se trouvent sur [huggingface.co/OpenVoiceOS](https://huggingface.co/OpenVoiceOS) et [huggingface.co/TigreGotico](https://huggingface.co/TigreGotico).

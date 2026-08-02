---
title: "Exporter et quantifier des modèles de parole ouverts pour qu'ils tournent vraiment"
description: "Un modèle de parole entraîné sur une page GitHub de recherche n'est pas un assistant vocal. Nous convertissons des checkpoints ASR et TTS ouverts vers ONNX, CoreML et GGUF, nous les quantifions et validons la sortie — puis publions les résultats sous OpenVoiceOS afin que chaque langue couverte s'exécute dans un véritable assistant hors ligne."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "CoreML"
  - "GGUF"
  - "ASR"
  - "OVOS"
  - "OpenVoiceOS"
  - "Quantization"
  - "Open Source"
draft: false
---

Un modèle de reconnaissance vocale publié comme checkpoint de recherche est généralement un dossier de poids PyTorch, un script d'entraînement, et une note indiquant sur quel GPU il a été entraîné. C'est suffisant pour reproduire un score de benchmark. Ce n'est pas suffisant pour le mettre sur un Raspberry Pi, un téléphone, ou un ordinateur portable sans connexion internet. Passer de l'un à l'autre est un travail de conversion, et c'est en grande partie ce qui détermine si un modèle de parole ouvert atteint un jour un véritable appareil.

Nous faisons ce travail de conversion à titre professionnel : prendre des modèles ASR (reconnaissance automatique de la parole, c'est-à-dire parole-vers-texte) et TTS (texte-vers-parole) ouverts et les transformer en fichiers qui tournent hors ligne, sur des CPU ordinaires ou des accélérateurs embarqués, sans nécessiter de pile d'entraînement Python à l'exécution. La plupart des résultats sont publiés sous l'[organisation OpenVoiceOS](https://huggingface.co/OpenVoiceOS) sur Hugging Face plutôt que sous la nôtre, et ce choix est délibéré — nous expliquons pourquoi plus bas.

## Pourquoi un checkpoint n'est pas un déploiement

Un checkpoint PyTorch ou NeMo attend un environnement Python spécifique : les bonnes versions de bibliothèques, généralement un GPU, et le framework d'entraînement lui-même rien que pour faire de l'inférence. Cette pile est volumineuse, change constamment, et n'est pas quelque chose que vous voulez embarquer dans un assistant vocal qui doit démarrer sur une petite carte.

L'exportation de modèle résout ce problème en convertissant le réseau entraîné en un format destiné purement à l'inférence — pas de code d'entraînement, pas d'autograd, pas de dépendance à un framework. Nous ciblons trois formats de ce type, chacun pour une forme de déploiement différente :

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) est un format de graphe portable qu'un large éventail de runtimes peut exécuter, sur CPU ou GPU, sous Linux, Windows, macOS, ou sur des cartes embarquées. C'est notre cible par défaut, car il tourne partout où `onnxruntime` tourne, c'est-à-dire presque partout.
- **CoreML** est le format d'inférence embarquée d'Apple. Un package CoreML tourne sur le Neural Engine ou le GPU d'un Mac ou d'un iPhone plutôt que sur le CPU, ce qui compte pour la reconnaissance vocale en temps réel sur du matériel Apple.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** est le format utilisé par `llama.cpp` et son écosystème, conçu pour des modèles quantifiés de style LLM devant tourner avec une faible empreinte mémoire. Nous l'utilisons pour les modèles de parole plus récents, fondés sur les transformers, qui sont architecturalement plus proches d'un modèle de langue que d'un modèle acoustique classique.

Choisir la bonne cible n'est pas cosmétique. Un modèle ASR de type conformer (l'architecture derrière la plupart des reconnaisseurs vocaux modernes, combinant convolution et auto-attention) se convertit proprement en ONNX ou en CoreML. Un modèle de parole basé sur Qwen3 est, sous le capot, un modèle de langue, il s'intègre donc naturellement au pipeline GGUF/`llama.cpp` à la place.

## Ce que coûte la quantification, et ce qu'elle rapporte

Quantifier signifie stocker les poids d'un modèle avec moins de bits par nombre — 16 bits, 8 bits ou 4 bits au lieu des flottants 32 bits avec lesquels il a été entraîné. Des nombres plus petits donnent un fichier plus petit et, sur du matériel adapté, une inférence plus rapide, parce qu'il y a moins de données à déplacer et une arithmétique moins coûteuse à effectuer.

Nous pouvons donner un chiffre exact pour ce compromis sur un modèle réel. `nvidia/parakeet-tdt-0.6b-v3` est un modèle ASR de 0,6 milliard de paramètres. Son composant mel-encoder CoreML pèse 1132,5 Mo en pleine précision ; palettisé à 4 bits, il devient 284,2 Mo — une réduction de 3,99x, à peu près égale sur ses trois sous-composants (encodeur, décodeur, réseau de décision joint). Sur l'ensemble du package, l'export CoreML non quantifié pèse environ 1,14 Go ; la version 4 bits environ 293 Mo. C'est la différence entre un modèle qui tient confortablement sur un téléphone et un qui y tient à peine.

Le coût, c'est la précision : moins de bits par poids signifie moins de précision, et au-delà d'un certain point, cela se traduit par plus d'erreurs de reconnaissance. La façon standard de mesurer cela pour l'ASR est le WER (word error rate — le pourcentage de mots que le modèle se trompe par rapport à une transcription correcte). C'est pourquoi nous publions plusieurs niveaux de quantification du même modèle côte à côte — 4 bits, 6 bits, 8 bits (`int8`), et `fp16` — plutôt que d'en choisir un et d'espérer qu'il convienne à tous les appareils. Un téléphone et un ordinateur de bureau peuvent se permettre des points différents sur cette courbe.

## Le problème de la validation

Une conversion qui produit silencieusement une sortie dégradée est plus dangereuse qu'une absence de conversion, car rien n'a l'air cassé — elle se charge, elle tourne, elle reconnaît juste un peu moins bien la parole, ou beaucoup moins bien dans une langue que vous ne parlez pas personnellement et que vous ne pouvez pas vérifier à l'oreille. La seule façon de détecter cela est de comparer la sortie du modèle exporté à celle de l'implémentation de référence originale, sur de l'audio réel, pour chaque langue et chaque niveau de quantification, avant de le publier.

C'est le prérequis incontournable pour toute conversion que nous publions : faire passer le même audio par le modèle source et le modèle converti, et confirmer qu'ils concordent. Ce n'est pas une étape spectaculaire, mais la sauter est la façon dont une « langue prise en charge » cesse silencieusement de fonctionner.

## Pourquoi les modèles vivent sous OpenVoiceOS, pas sous notre nom

L'exportation de modèles est une compétence d'entreprise : donnez-nous un checkpoint et un appareil cible, et nous le ferons tourner hors ligne, validé, au niveau de quantification adapté à votre matériel. Mais les modèles convertis que nous produisons à partir de checkpoints ouverts, non commandités, vont vers [OpenVoiceOS](https://huggingface.co/OpenVoiceOS), la plateforme d'assistant vocal ouverte pour laquelle ces modèles sont conçus — pas vers notre propre espace de noms.

La raison est simple : c'est sur OpenVoiceOS que les modèles sont utilisés. Un modèle converti qui dort dans un compte d'entreprise est un joli artefact. Ce même modèle publié là où [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr), [`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml), ou [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover) peuvent le trouver par son nom est une langue qu'un véritable assistant peut désormais parler ou comprendre. Publier sous l'organisation propre de la plateforme, c'est ce qui transforme une conversion en fonctionnalité prise en charge plutôt qu'en curiosité de recherche, et c'est ainsi que nous nous assurons que faire ce travail une fois profite à toute installation OpenVoiceOS, pas seulement au client qui l'a demandé.

Pour être clair sur l'attribution : nous n'entraînons pas ces modèles acoustiques depuis zéro, et nous ne le prétendons pas. La recherche sous-jacente — les modèles Parakeet et Conformer de NVIDIA, les modèles IndicConformer d'AI4Bharat pour les langues indiennes, des modèles d'universités et d'instituts publics comme le Proxecto Nós de Galice ou les modèles Conformer du centre basque HiTZ, et des efforts indépendants de conversion de modèles pour des langues africaines et minoritaires — appartient aux équipes qui les ont entraînés. Ce que nous ajoutons, c'est la conversion, la quantification, la vérification de correction par rapport à l'original, et le câblage du plugin qui permet à un assistant de charger le résultat par son nom.

L'ampleur de ce travail de conversion, comptée directement à partir de ce qui est publié : plus de quatre-vingt-dix variantes ASR Parakeet (selon tailles, langues et niveaux de quantification) exportées vers ONNX et CoreML ; plus de trente modèles Conformer NVIDIA ; vingt-deux modèles IndicConformer d'AI4Bharat couvrant des langues indiennes à faibles ressources ; vingt-deux modèles wav2vec2 pour des langues incluant le suédois, l'islandais, le féroïen, le finnois et les deux formes écrites du norvégien ; neuf modèles Conformer pour le basque et le galicien ; et des modèles Whisper et wav2vec2 convertis indépendamment couvrant des langues africaines et créoles comme le shona, le zoulou, le xhosa, le malgache, le créole haïtien et le kabyle. En ne comptant que les conversions ASR confirmées par code de langue distinct, cela représente au moins 74 langues différentes disposant aujourd'hui d'un reconnaisseur vocal hors ligne et quantifié — avant même de compter le catalogue séparé de voix TTS exportées pour des langues comme le basque, l'aragonais, l'asturien, le galicien, l'occitan et l'arabe.

## Si votre langue ou votre appareil n'a rien d'hors ligne aujourd'hui

La plupart des langues n'obtiennent jamais d'option vocale hors ligne commerciale, parce que le marché pour cette seule langue ne justifie pas qu'un fournisseur en construise une. Le schéma décrit ci-dessus — prendre un checkpoint ouvert existant, le convertir vers un format qui tourne sur le matériel que vous avez réellement, le quantifier pour qu'il tienne, le vérifier par rapport à l'original, et le câbler dans un plugin — ne dépend pas de la taille du marché. Cela dépend de l'existence d'un checkpoint ouvert comme point de départ, ce qui est de plus en plus le cas normal.

Si vous avez un modèle de parole qui ne tourne que sur un GPU d'entraînement, ou un appareil qui n'a actuellement aucune prise en charge vocale hors ligne dans sa langue, [contactez-nous](/fr/contact) ou consultez à quoi ressemble ce travail de bout en bout sur [notre page de services](/fr/services).

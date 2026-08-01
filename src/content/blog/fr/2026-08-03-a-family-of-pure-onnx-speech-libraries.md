---
title: "Une famille de bibliothèques de parole en ONNX pur"
description: "TigreGótico maintient un ensemble de bibliothèques de parole — extension de bande passante, clonage vocal, empreintes de locuteur, VAD, accentuation lexicale, phonémisation, TTS, et une bibliothèque de métriques pour toutes les évaluer — qui partagent une seule règle d'exécution : uniquement onnxruntime et numpy, pas de PyTorch, aucun GPU requis."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

ONNX est un format de fichier pour un réseau de neurones entraîné : les poids et le graphe de calcul, figés, sans dépendance envers le framework qui l'a entraîné. Un modèle exporté en ONNX peut tourner via **ONNX Runtime**, un petit moteur d'inférence qui ne fait qu'exécuter ce graphe. Il ne sait pas comment le modèle a été entraîné, ne prend pas en charge l'entraînement, et n'a besoin ni de PyTorch ni de TensorFlow installés.

Plusieurs de nos bibliothèques respectent une seule règle : à l'exécution, les seules dépendances sont `onnxruntime` et `numpy`. Pas « principalement » — l'import du paquet lui-même n'entraîne jamais avec lui un framework d'entraînement. `audiosronnx` (extension de bande passante et débruitage), `voiceclonnx` (clonage vocal), `speakeronnx` (empreintes de locuteur), `speechonnxmetrics` (évaluation), `stressonnx` (accentuation lexicale), `vadonnx` (détection d'activité vocale), et `phoonnx` (phonémisation et synthèse vocale) suivent tous cette règle, chacun dans son propre paquet PyPI. Deux autres, `phoonnx.js` et `precise-onnx-js`, appliquent la même idée dans le navigateur avec `onnxruntime-web` à la place.

## Pourquoi s'en soucier

La façon évidente de livrer un modèle de parole est de conserver le framework d'entraînement également pour l'inférence. C'est pratique en développement. C'est un handicap en production.

- **Taille d'installation.** Une installation PyTorch + CUDA atteint des gigaoctets avant même d'avoir chargé un seul modèle. `onnxruntime` et `numpy` ensemble représentent quelques dizaines de mégaoctets.
- **Pas de CUDA à gérer.** Faire correspondre un pilote GPU, une version de toolkit CUDA et une build de framework est une source récurrente de pannes. ONNX Runtime en version CPU seule évite cela entièrement, tout en exécutant le même graphe sur un GPU quand il y en a un de disponible.
- **Tourne sur du matériel modeste.** Un Raspberry Pi ou un ordinateur portable vieux de dix ans peut exécuter `onnxruntime` confortablement. Il ne peut généralement pas exécuter une pile PyTorch complète à une vitesse utilisable, ni même l'installer sur une carte 32 bits ou à mémoire limitée.
- **Un seul artefact, toutes les plateformes.** Le même fichier `.onnx` tourne sans modification sous Linux, macOS, Windows — et, via `onnxruntime-web`, dans un onglet de navigateur. Il n'y a pas d'étape d'exportation séparée par cible.
- **Pas de conflits de version entraînement/service.** Une pile d'entraînement fige des versions spécifiques de framework et de CUDA. Une pile de service veut l'ensemble de dépendances le plus petit et le plus stable possible. Les séparer permet de mettre à jour l'une sans casser l'autre.

## Ce que cela coûte

La contrainte est réelle, et elle n'est pas gratuite.

**Vous ne pouvez pas affiner le modèle en cours de processus.** Un graphe ONNX n'a ni optimiseur, ni passe arrière. Chacune de ces bibliothèques traite les modèles comme des artefacts figés : vous les chargez et les exécutez. L'entraînement ou l'affinage se fait séparément, avec le framework d'origine, et le résultat est exporté vers ONNX ensuite. `stressonnx` et `speechonnxmetrics` conservent tous deux un extra optionnel `export` qui embarque `torch` uniquement pour cette étape de conversion hors ligne — jamais pour l'inférence.

**Toutes les architectures ne s'exportent pas proprement.** Le flux de contrôle dynamique, les noyaux CUDA personnalisés, ou les opérations sans équivalent ONNX peuvent bloquer une exportation directe. Le README d'`audiosronnx` le documente directement : il tient une [liste des modèles non livrés](https://github.com/TigreGotico/audiosronnx) qu'il a évalués et rejetés, avec les raisons, plutôt que de prétendre que chaque modèle de recherche se porte sans accroc.

**Le prétraitement doit être réimplémenté à la main.** Un framework comme PyTorch ou Kaldi fournit des implémentations rapides et testées de la STFT (transformer une forme d'onde en spectrogramme), des caractéristiques de banc de filtres mel, et du rééchantillonnage. Une fois que le modèle lui-même ne dépend plus de ce framework, son prétraitement ne le peut pas non plus — `speakeronnx` réimplémente un banc de filtres log-mel à 80 bandes en NumPy pur exactement pour cette raison, et `audiosronnx` fait de même pour la STFT et le rééchantillonnage. C'est plus de code à faire correctement, et cela nécessite ses propres tests de parité par rapport à l'original.

## Une tâche, plusieurs moteurs, une API

Les modèles de parole entraînés varient énormément selon la langue, les conditions d'enregistrement et le domaine cible. Un modèle de vérification de locuteur entraîné sur de la parole lue propre peut échouer sur de l'audio téléphonique. Un modèle de clonage vocal ajusté pour le transfert de timbre en anglais peut perdre en intelligibilité sur des langues tonales. Il n'existe pas de modèle unique qui l'emporte partout, donc s'engager sur l'un d'eux d'emblée est un pari.

Chaque bibliothèque de cette famille choisit une seule tâche et enveloppe plusieurs modèles publiés indépendamment derrière une seule interface, de sorte que changer de moteur est une modification d'une seule ligne plutôt qu'une réécriture.

`audiosronnx` sépare ses deux tâches — débruitage et extension de bande passante (transformer un enregistrement en bande étroite, comme de l'audio téléphonique à 8 kHz, en un signal au son plus riche et à fréquence d'échantillonnage plus élevée) — derrière deux chargeurs, chacun adossé à plusieurs moteurs :

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` enregistre actuellement dix débruiteurs (`dpdfnet`, `mossformer2`, `frcrn`, `mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`, `deepfilternet`), d'un modèle de 0,54 Mo à un de 415 Mo, sous différentes licences. `load_sr` enregistre sept extenseurs de bande passante (`lavasr`, `novasr`, `flowhigh`, `hifiganbwe`, `apbwe`, `sidon`, `callenhancer`). Les modèles dominés — ceux qu'un autre moteur bat sur tous les axes mesurés — restent tout de même dans le registre, de sorte qu'un résultat de benchmark publié reste reproductible à la demande.

`voiceclonnx` adopte la même approche pour le clonage vocal — convertir la voix d'un enregistrement existant pour qu'elle sonne comme un locuteur de référence différent, sans passer par le texte :

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

Dix moteurs sont enregistrés (`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`, `bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`), couvrant six familles de modèles distinctes — échange de caractéristiques par kNN, codec factorisé, appariement de flux, transfert de couleur tonale, LM-codec autorégressif, et codec découplé du locuteur. En coulisses, chacun est fourni avec des chiffres publiés d'intelligibilité et de similarité de locuteur, de sorte que choisir un moteur est une comparaison, pas un tirage au sort.

`vadonnx` applique le même patron à la détection d'activité vocale — décider quelles parties d'un flux audio contiennent de la parole :

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

Six familles de modèles sont enregistrées (`silero`, `marblenet`, `pyannote`, `fsmn`, `speechbrain`, `ten`), et une `IOSignature` déclarative permet à un seul moteur générique de piloter la plupart d'entre elles, ou de pointer vers n'importe quel fichier VAD `.onnx` personnalisé.

`speakeronnx` extrait une **empreinte de locuteur** — un vecteur de longueur fixe qui résume qui parle, indépendamment de ce qui a été dit — et compare deux empreintes par similarité cosinus pour vérifier si deux extraits proviennent du même locuteur :

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

Il enregistre neuf modèles répartis sur quatre familles d'architecture (WeSpeaker, CAM++, ERes2Net, ReDimNet), avec dimensions d'empreinte et licences publiées.

`stressonnx` choisit l'accentuation lexicale pour les frontaux de synthèse vocale — quelle syllabe d'un mot porte l'accent, une information que de nombreuses langues n'écrivent pas (le russe *за́мок*, château, contre *замо́к*, serrure, partagent toutes les lettres). Il enregistre un pipeline neuronal pour le russe, un second pour l'ukrainien et le biélorusse, et un moteur à règles et vocabulaire couvrant 26 langues sans aucune inférence neuronale :

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` phonémise le texte (transforme les mots orthographiés en unités sonores que consomme un modèle TTS) et exécute la synthèse vocale à travers 17 moteurs de synthèse enregistrés et des voix exportées de plusieurs écosystèmes (phoonnx natif, Piper, Mimic3, Coqui, MMS, Transformers) :

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` porte les mêmes chemins de tokenisation dans le navigateur avec `onnxruntime-web`, et `precise-onnx-js` porte la détection de mot d'activation (extraction de caractéristiques MFCC plus un classificateur ONNX, compatible avec les modèles Mycroft Precise) vers JavaScript, tous deux sans serveur :

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

Les poids pour `audiosronnx` (18 modèles publiés) et `voiceclonnx` (10 modèles publiés) vivent comme téléchargements séparés sur l'[organisation Hugging Face de TigreGótico](https://huggingface.co/TigreGotico), récupérés au premier usage et mis en cache localement, de sorte que choisir un moteur différent est un changement de configuration, pas un redéploiement.

## Boucler la boucle : juger les moteurs plutôt que deviner

Enregistrer de nombreux moteurs derrière une seule API ne porte ses fruits que si vous pouvez dire lequel est réellement meilleur pour votre entrée. C'est à cela que sert `speechonnxmetrics` : une bibliothèque de métriques bâtie sur la même contrainte `numpy` + `onnxruntime`, de sorte qu'évaluer un modèle ne coûte rien de plus à installer.

Elle regroupe les métriques en trois catégories. Les estimateurs **MOS sans référence** — UTMOS, DNSMOS, NISQA, SIGMOS — prédisent un **Mean Opinion Score**, la note de naturel de 1 à 5 qu'un panel d'auditeurs humains donnerait à un extrait, sans avoir besoin d'une référence propre pour comparer. Les **métriques intrusives** — STOI (intelligibilité objective à court terme), SI-SDR (rapport signal-sur-distorsion invariant à l'échelle), MCD (distorsion mel-cepstrale) — ont besoin d'une référence propre correspondante et mesurent à quel point la sortie s'en rapproche. Les **métriques textuelles fondées sur l'ASR** — WER (taux d'erreur de mots) et CER (taux d'erreur de caractères) — font passer un reconnaisseur vocal sur la sortie et comparent la transcription au texte attendu, détectant les cas où un modèle produit un audio qui sonne bien mais dit les mauvais mots.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

Cela transforme le choix d'un moteur, d'un test d'écoute, en un tableau. `voiceclonnx` publie exactement cette comparaison pour ses dix moteurs de clonage — un WER par rapport à la transcription source plus un score de similarité de locuteur séparé pour chacun, de sorte que « facodec donne 0 % de WER » ou « lscodec échange du WER contre un transfert de timbre plus fort » sont des affirmations mesurées, pas des impressions. Multipliez cela par les langues et les conditions d'enregistrement et la comparaison manuelle cesse d'être réaliste ; une métrique objective est ce qui rend un registre à dix moteurs utilisable plutôt qu'écrasant.

## Où c'est utile

Si vous avez besoin de traitement vocal hors ligne — nettoyer un enregistrement, cloner une voix, détecter qui parle, ou en synthétiser une — sur du matériel qui ne verra jamais de GPU, c'est la forme à rechercher : une petite dépendance d'exécution, un choix de modèles publiés plutôt qu'un seul par défaut figé, et un moyen de mesurer lequel fonctionne réellement pour votre cas. Chacune des bibliothèques ci-dessus n'est qu'à un `pip install`, sous licence MIT ou Apache au niveau du code (les poids de modèles individuels portent leurs propres licences amont, documentées par moteur), et tourne de la même façon sur un ordinateur portable, un serveur, ou un Raspberry Pi.

Contactez-nous via [/contact](/contact) ou découvrez ce que nous construisons d'autre sur [/services](/services).

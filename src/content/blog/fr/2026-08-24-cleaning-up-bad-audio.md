---
title: "Nettoyer un audio dégradé : débruitage et extension de bande passante dans audiosronnx"
description: "Une plongée dans les deux tâches distinctes d'audiosronnx — retirer le bruit et reconstruire les hautes fréquences manquantes — avec le vrai registre de moteurs, les tailles de modèles et licences, la liste des modèles rejetés, et comment vérifier si la sortie s'est réellement améliorée."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "denoising"
  - "bandwidth extension"
  - "speech"
draft: false
---

Un enregistrement peut être mauvais de deux manières différentes, et les
remèdes ne se recoupent pas.

La première manière : du bruit de fond se superpose à la parole — trafic,
ventilateur, bourdonnement de pièce. Le signal qui compte est là ; autre
chose y est mélangé. Le retirer, c'est le **débruitage** (*denoising*).

La seconde manière : l'enregistrement n'a jamais capturé le signal complet
au départ. L'audio téléphonique est échantillonné à 8 000 échantillons par
seconde (8 kHz) ; un enregistrement pleine qualité est généralement à
48 kHz. Le **taux d'échantillonnage** fixe la fréquence la plus haute qu'un
signal numérique peut représenter, si bien qu'un appel à 8 kHz n'a
littéralement aucun contenu au-dessus de 4 kHz — pas atténué, pas filtré,
simplement jamais enregistré. Faire sonner cet audio de nouveau pleinement
signifie inventer des hautes fréquences plausibles qui n'ont jamais été
captées. C'est l'**extension de bande passante** (*bandwidth extension*).

`audiosronnx` traite ces deux problèmes comme distincts, avec deux points
d'entrée différents, parce qu'utiliser le mauvais fait la mauvaise chose.
Faire tourner un extenseur de bande passante sur un signal bruité et il
reconstruira fidèlement une version haute fréquence du bruit. Le débruitage
doit se produire d'abord.

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _     = load_sr("lavasr").upscale(clean, rate)              # extend to 48 kHz
```

`load_denoise()` et `load_sr()` refusent les moteurs de l'autre — demander à
`load_denoise` un extenseur de bande passante lève une erreur plutôt que de
faire silencieusement la mauvaise tâche.

## Pourquoi cela vient avant la reconnaissance

La reconnaissance vocale et l'identification du locuteur sont généralement
entraînées sur de l'audio comparativement propre. Fournissez à un
reconnaisseur de la parole téléphonique à 8 kHz, ou de la parole avec un
ventilateur en fond, et le taux d'erreur au mot grimpe — non parce que le
modèle est mauvais, mais parce que l'entrée ne ressemble plus à ce sur quoi
il a été entraîné. La même chose vaut pour les embeddings de locuteur
utilisés pour l'identification ou la diarisation : le bruit et la bande
passante manquante déforment le détail acoustique exact dont dépendent ces
embeddings.

Cela fait du nettoyage une étape de pipeline qui se situe *avant* la
reconnaissance, pas une alternative à celle-ci. Un vrai pipeline pour un
appel téléphonique bruité à 8 kHz ressemble à : débruiter, puis étendre à
48 kHz, puis exécuter la reconnaissance ou l'identification de locuteur sur
le résultat. Remplacer par un meilleur reconnaisseur sans d'abord corriger
l'entrée dépense l'effort au mauvais endroit — le modèle se dégrade sur le
même signal endommagé, aussi bon soit-il.

## Le registre des moteurs

`audiosronnx` livre dix débruiteurs et sept extenseurs de bande passante,
tous chargeables par nom via `load_denoise()` / `load_sr()`, tous en ONNX
pur sans torch à l'exécution.

Débruiteurs :

| Moteur | Taux | Taille | Licence |
|--------|------|--------|---------|
| dpdfnet (par défaut) | 8/16/48 kHz | 8.7–14.9 Mo | Apache-2.0 |
| mossformer2 | 48 kHz | 229 Mo | Apache-2.0 |
| frcrn | 16 kHz | 57.5 Mo | Apache-2.0 |
| mpsenet | 16 kHz | 9.7 Mo | MIT |
| gtcrn | 16 kHz | 0.54 Mo | MIT |
| cmgan | 16 kHz | 7.8 Mo | MIT |
| metadenoiser | 16 kHz | 19–34 Mo | CC-BY-NC-4.0 |
| mossformergan | 16 kHz | 17.7 Mo | Apache-2.0 |
| voicefixer | 44.1 kHz | 415 Mo | MIT |
| deepfilternet | 48 kHz | ~2 Mo | MIT |

Extenseurs de bande passante :

| Moteur | Entrée | Taille | Licence |
|--------|-------|--------|---------|
| lavasr (par défaut) | 8–48 kHz | ~52 Mo | Apache-2.0 |
| novasr | 16 kHz | ~0.2 Mo | Apache-2.0 |
| flowhigh | quelconque | ~200 Mo | MIT |
| hifiganbwe | quelconque | ~4 Mo | MIT |
| apbwe | quelconque (bande 12 kHz) | ~120 Mo | MIT |
| sidon | 16 kHz | ~410 Mo | MIT |
| callenhancer | 8–16 kHz | ~3 Go / ~1.3 Go int8 | CC-BY-NC-4.0 |

Le plus petit modèle de la bibliothèque, `gtcrn`, pèse 0.54 Mo. Le plus
grand, `voicefixer`, pèse 415 Mo — près de 800 fois plus gros, et il fait un
travail différent : c'est un modèle de *restauration* qui traite le bruit,
la réverbération, l'écrêtage et la bande passante manquante ensemble plutôt
qu'un problème à la fois.

La plupart des poids sont MIT ou Apache-2.0. Deux ne le sont pas :
`metadenoiser` et `callenhancer` sont livrés sous CC-BY-NC-4.0,
non-commercial. Cette licence couvre les poids, pas l'audio traité avec
eux, et la bibliothèque le déclare à chaque point d'usage — `audiosronnx
list` le rapporte par moteur. Rien n'empêche un appelant de choisir
`metadenoiser` pour son architecture dans le domaine temporel, mais le
choix doit être fait en connaissance de cause.

Le registre existe parce qu'aucun modèle unique ne gagne sur tous les
enregistrements. `dpdfnet` est le défaut parce qu'il ne nécessite aucune
dépendance supplémentaire et couvre 8, 16 et 48 kHz depuis un seul modèle.
`mossformer2` est le meilleur choix mesuré sur de l'entrée fullband.
`mossformergan` affiche le score PESQ publié le plus élevé (3.47) parmi les
débruiteurs livrés. `gtcrn` est le choix quand la contrainte déterminante
est l'empreinte, à 0.54 Mo. Sur un clip de test avec du bruit gaussien
large bande, les débruiteurs ont récupéré 3.5 à 5.9 dB de SNR à un SNR
d'entrée de 19 dB, montant à 7.5–13.7 dB à un cas plus dur de 5 dB
d'entrée. C'est un cas de bruit synthétique et hostile : il classe les
moteurs de manière cohérente mais dit peu de choses sur le bruit de babil
ou les artefacts de codec, ce qui est exactement pourquoi le registre garde
dix modèles plutôt que de ne livrer que le gagnant.

`cmgan` est le cas le plus clair d'un modèle gardé exprès malgré une
défaite : il est dominé à la fois en PESQ et en SNR par `gtcrn`, à quatorze
fois la taille, et il reste quand même — pour que les résultats publiés
construits avec `cmgan` restent reproductibles et qu'une architecture
distincte demeure disponible pour comparaison.

Du côté de l'extension de bande passante, `sidon` et `callenhancer` font un
travail différent de `lavasr` ou `novasr` : au lieu d'ajouter une bande
haute plausible par-dessus le signal existant, ils resynthétisent la parole
depuis zéro via un vocodeur neuronal, ce qui peut réparer des dégâts de
codec qu'un extenseur de bande ne peut pas toucher — à un coût de calcul
bien plus élevé. `callenhancer` est entraîné spécifiquement sur de l'audio
téléphonique, ce qui explique pourquoi ses poids portent la licence
non-commerciale.

## Ce qui n'a pas été retenu

`audiosronnx` ne livre un moteur que s'il s'exporte vers un unique graphe
ONNX statique, tourne sur CPU via onnxruntime, porte une licence claire, et
a été validé de bout en bout contre l'implémentation originale — pas
seulement contre le modèle brut, car un graphe qui correspond au réseau
mais pas à sa normalisation environnante produit un audio qui sonne bien et
est discrètement faux.

Le fichier `docs/not-shipped.md` du projet documente chaque candidat
évalué et rejeté, avec la raison précise, ce qui en fait l'un des documents
les plus utiles du dépôt car il montre les frontières réelles de ce que
« ONNX pur, CPU uniquement » peut faire aujourd'hui plutôt que de les
affirmer.

**Les échantillonneurs itératifs n'ont pas de graphe statique à exporter.**
Les modèles de diffusion et de flow-matching font tourner un réseau
plusieurs fois par énoncé, avec une boucle dont la longueur n'est pas fixée
au moment de l'export. AudioSR (un pipeline de diffusion latente d'environ
6 Go avec un VAE, un LDM et un vocodeur séparés) et SGMSE tombent tous deux
dans ce cas — le successeur streaming 2025 de SGMSE lui-même n'atteint le
temps réel que sur un GPU grand public, sans même parler du CPU.

**Les convolutions à variation de localisation ont l'air disqualifiantes
et ne le sont pas, en majorité.** `resemble-enhance` a longtemps été rejeté
dans ce document à cause de LVCNet, la convolution à variation de
localisation du vocodeur, sur la théorie que des noyaux prédits par
position via `unfold` et `einsum` ne peuvent pas se replier dans un graphe
statique. Testé directement, cela s'est avéré faux — les deux opérations
ont des équivalents ONNX. L'échec réel est une erreur de traçage distincte
et bien comprise (« ONNX export of convolution for kernel of unknown
shape ») déjà résolue ailleurs dans la base de code pour les
rééchantillonneurs de BigVGAN. Ce qui garde encore `resemble-enhance` de
côté, c'est l'échelle : quatre réseaux dont un échantillonneur d'EDO CFM et
un autoencodeur, à 44.1 kHz — une décision de périmètre, pas une
impossibilité.

**Certains modèles n'ont rien d'entraîné à exporter.** RNNoise est livré
comme du C écrit à la main, pas un graphe dans un framework entraînable —
le porter signifierait réentraîner un réseau équivalent depuis zéro.
Fast-ULCNet ne publie que le code d'architecture, aucun checkpoint du tout.

**Une licence restrictive est une décision d'étiquetage, pas une
disqualification automatique** — c'est exactement pourquoi `callenhancer`
et `metadenoiser` sont livrés. Ce qui *est* disqualifiant, ce sont des
poids publiés sans aucune licence : mdctGAN a été rejeté pour exactement
cette raison, en plus d'un front-end basé sur `torch.fft` qui ne s'exporte
pas de manière fiable.

**Un `torch.stft` appelé à l'intérieur du modèle est un véritable blocage
structurel.** La boucle d'échantillonnage de NU-Wave2 n'est pas le
problème — elle pourrait tourner en numpy hors du graphe, comme le fait la
STFT de chaque autre moteur. Ce qui bloque, c'est que sa méthode `forward`
appelle `torch.stft` et `torch.istft` en interne, ce que la bibliothèque
exclut délibérément de chaque graphe qu'elle livre, et qui est aussi
l'opérateur qui s'exporte le moins fiablement en général. Le corriger
signifierait scinder le modèle à la frontière de la transformation, une
vraie restructuration plutôt qu'un simple échange d'opérateur.

**Reproduire l'architecture d'un modèle n'est pas la même chose que
reproduire sa sortie.** LiSenNet compte 56 K paramètres, moins de 300 Ko —
ce serait le plus petit moteur de la bibliothèque. Son portage ONNX
publiquement disponible tourne et produit un audio atténué d'apparence
plausible, mais mesuré de bout en bout il détruit le signal : −10.8 dB de
SNR à 11 dB d'entrée. Reproduire exactement l'implémentation de référence
du portage lui-même donne le même résultat négatif identique, ce qui
signifie que l'implémentation de référence elle-même ne correspond pas au
front-end que sa propre documentation décrit — il n'y a pas encore de
cible correcte contre laquelle valider.

Le motif à travers tous ces cas, c'est que les échecs intéressants sont
rarement « le modèle est trop gros » ou « la diffusion est lente ». Ils
sont précis : un opérateur non supporté avec un remplacement exact
(`torch.complex` n'a pas d'opération ONNX, mais `atan2(im, re)` calcule le
même angle de phase), un tenseur construit à partir de la forme d'exécution
d'une entrée qu'un traceur ne peut pas fixer, ou une transformation placée
du mauvais côté d'une frontière de graphe.

## Confirmer que la sortie s'est réellement améliorée

Un fichier ONNX qui tourne n'est pas une preuve qu'un enregistrement s'est
amélioré. Deux modes d'échec différents se ressemblent de l'extérieur : un
débruiteur qui coupe la parole en même temps que le bruit, et un extenseur
de bande passante qui ajoute une bande haute avec un contenu harmonique
erroné, produisent tous deux un audio qui se lit sans erreur et peut même
sembler plus propre à une écoute rapide.

La bibliothèque sœur `speechonnxmetrics` existe pour rendre ce jugement
mesurable plutôt qu'impressionniste. Elle note l'audio sur le **MOS** (Mean
Opinion Score, une note de perception de qualité sur 1 à 5) de deux
manières : des prédicteurs neuronaux sans référence comme DNSMOS et UTMOS,
qui notent un enregistrement sans original propre auquel se comparer, et
des métriques intrusives comme STOI et SI-SDR, qui ont besoin de la
référence propre et mesurent à quel point la sortie s'en rapproche
réellement.

```python
import speechonnxmetrics as s

s.score("clean.wav", ["utmos"])
# -> {'utmos': 4.41}

s.score("denoised.wav", ["stoi", "si_sdr"], ref="clean.wav")
# -> {'stoi': 0.66, 'si_sdr': -26.9}
```

Exécuter avant et après un débruiteur ou un extenseur fait apparaître la
forme d'une vraie comparaison : DNSMOS ou UTMOS sur l'audio brut et traité
pour voir si la qualité perçue a bougé du tout, et — quand une référence
propre existe, ce qui est le cas pour des tests de bruit synthétique mais
rarement pour un vrai appel téléphonique — SI-SDR ou STOI pour voir si le
signal traité a réellement convergé vers elle plutôt que de simplement
sonner différemment. C'est la même discipline qui sous-tend les chiffres de
SNR dans le tableau des débruiteurs ci-dessus : un nombre attaché à une
condition de bruit spécifique, pas un adjectif. La famille plus large de
bibliothèques de parole en ONNX pur dans laquelle cela s'inscrit, y compris
`speechonnxmetrics` elle-même, est couverte dans
[A Family of Pure-ONNX Speech Libraries](/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries).

Nettoyer l'audio avant qu'il n'atteigne un reconnaisseur, un système
d'identification de locuteur, ou un auditeur humain est un travail
d'ingénierie à part entière, avec son propre registre de compromis et sa
propre liste d'approches essayées qui n'ont pas survécu au contact d'un
signal réel.

Questions sur l'application de tout cela à un pipeline spécifique :
[contactez-nous](/contact).

---
title: "Mesurer la qualité de la parole sans panel d'écoute"
description: "Un guide pratique de speechonnxmetrics : ce que mesurent réellement le MOS, les prédicteurs MOS sans référence, les métriques de signal intrusives et le WER/CER basé sur l'ASR, quand chacun s'applique, de vrais scores sur de vrais audios, et pourquoi un MOS prédit est une preuve, pas une vérité."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "speechonnxmetrics"
  - "TTS"
  - "ONNX"
  - "evaluation"
draft: false
---

Un modèle de débruitage publie un nouveau checkpoint. Une voix TTS est
réentraînée sur plus de données. Un pipeline de clonage vocal change de
vocodeur. Dans chaque cas, quelqu'un doit répondre : la sortie est-elle
meilleure ou pire qu'avant ? « Ça me semble meilleur » ne passe pas à
l'échelle. Ça s'effondre dès que la langue n'est pas une que vous parlez,
dès qu'il y a vingt checkpoints à comparer au lieu de deux, ou dès que le
changement doit être vérifié à chaque commit plutôt qu'une fois à la main.

La réponse rigoureuse à « est-ce que ça sonne mieux » est un **Mean
Opinion Score (MOS)** : placer l'audio devant un panel d'auditeurs, demander
à chacun de le noter de 1 à 5, et moyenner les scores. Le MOS est la
métrique de qualité de parole standard précisément parce qu'elle pose la
question qui compte — un humain trouverait-il cela acceptable — plutôt
qu'une approximation. C'est aussi coûteux. Recruter un panel, le faire
tourner de manière cohérente, et répéter l'opération pour chaque langue,
chaque condition d'enregistrement et chaque version de modèle qu'une petite
équipe publie n'est pas quelque chose qu'un panel d'écoute peut suivre.

[`speechonnxmetrics`](https://github.com/TigreGotico/speechonnxmetrics) est
une bibliothèque pour approximer ce jugement sans panel, à chaque build.
Elle regroupe ses métriques en trois familles, et choisir la bonne famille
pour la situation compte plus que n'importe quel nombre individuel.

## Trois familles, trois questions

Les **estimateurs MOS sans référence** sont des réseaux de neurones
entraînés à prédire ce que dirait un panel d'écoute, à partir de l'audio
seul. Ils n'ont besoin d'aucun original propre — seulement de la sortie que
vous voulez juger. Utilisez cette famille quand il n'y a pas de vérité
terrain à laquelle vous comparer : noter la sortie d'un système TTS, ou
vérifier un enregistrement réel déjà dégradé après débruitage.

Les **métriques intrusives** ont besoin d'une référence propre
correspondante et mesurent la distance entre elle et le signal dégradé.
Utilisez cette famille quand vous avez fabriqué vous-même la dégradation et
détenez encore l'original propre : vous avez fait passer un enregistrement
connu comme bon à travers un codec, un modèle d'extension de bande
passante, ou un convertisseur de voix, et voulez savoir à quel point la
sortie s'est éloignée de la source.

Les **métriques textuelles basées sur l'ASR** transcrivent la sortie avec
un système de reconnaissance vocale et comparent la transcription au texte
attendu. Cela capture quelque chose que les deux autres familles ne peuvent
pas : un audio qui sonne parfaitement naturel et propre mais qui dit les
mauvais mots. Un prédicteur MOS sans référence note le naturel, pas
l'exactitude — une mauvaise prononciation fluide obtient un bon score. Une
métrique intrusive a besoin d'une forme d'onde de référence, pas d'une
phrase de référence. Seule la comparaison de texte capture un mot erroné.

La bibliothèque expose tout cela via une seule fonction :

```python
import speechonnxmetrics as s

# No-reference: only the output needed, no ground truth exists
s.score("output.wav", ["utmos"])

# Intrusive: needs a clean reference, ref= is required
s.score("degraded.wav", ["stoi", "mcd", "si_sdr"], ref="clean.wav")
```

Les métriques textuelles vivent dans un module séparé,
`speechonnxmetrics.asr`, parce qu'elles comparent des chaînes, pas de
l'audio — `s.score()` ne répartit que les métriques qui prennent une forme
d'onde.

## MOS sans référence : lire les nombres

Quatre estimateurs MOS sont livrés, chacun retournant des valeurs sur une
échelle de 1 à 5 où plus haut est meilleur — la même échelle qu'utilise un
panel humain :

| métrique | dimensions | entraîné sur | usage commercial |
|---|---|---|---|
| `utmos` | un score de naturel | parole synthétisée (VoiceMOS Challenge) | oui |
| `dnsmos` | `sig` / `bak` / `ovrl` (qualité de la parole / bruit de fond / global) | ITU-T P.835 | oui |
| `dnsmos_p808` | un MOS d'écoute crowdsourcée | ITU-T P.808 | oui |
| `sigmos` | 7 dimensions (`col`, `disc`, `loud`, `noise`, `reverb`, `sig`, `ovrl`) | ITU-T P.804 | oui |
| `nisqa` | `mos` plus décomposition `noi`/`dis`/`col`/`loud` | NISQA-v2 | **non — CC BY-NC-SA 4.0** |

`nisqa` est la seule métrique de toute la bibliothèque aux poids
non-commerciaux. Les quatre autres sont sous licence MIT.
`speechonnxmetrics` ne filtre pas cela pour vous ; elle déclare la licence
et laisse le choix à l'appelant.

Voici ce que notent de vrais audios. En faisant tourner les propres
fixtures embarquées de la bibliothèque — un enregistrement propre
(`source.wav`) et une resynthèse par codec neuronal du même clip
(`facodec_aria.wav`) — à travers UTMOS :

```python
>>> s.score("source.wav", ["utmos"])
{'utmos': 4.41}
>>> s.score("facodec_aria.wav", ["utmos"])
{'utmos': 3.21}
```

L'enregistrement propre se situe près du haut de l'échelle, comme il se
doit — c'est de la vraie parole humaine, pas synthétisée. La resynthèse par
codec chute de plus d'un point complet. Cet écart, plus que l'un ou l'autre
nombre isolément, est le signal utile : il indique que le codec introduit
une dégradation audible, et donne un nombre à suivre à mesure que le codec
est ajusté.

DNSMOS sur le même enregistrement propre :

```python
>>> s.score("source.wav", ["dnsmos"])
{'dnsmos.sig': 3.45, 'dnsmos.bak': 3.60, 'dnsmos.ovrl': 2.93}
```

Trois nombres, pas un, et ils divergent — `ovrl` se situe nettement en
dessous de `sig` et `bak`. Cette divergence est informative plutôt qu'un
bug : `ovrl` est la note P.835 de l'expérience d'écoute globale, et elle
tend à pénaliser un enregistrement plus durement que ne le suggérerait
n'importe lequel des scores composants seul, surtout pour un enregistrement
du monde réel plutôt qu'un enregistrement de studio. Quand `bak` est bas,
cherchez du bruit de fond. Quand `sig` est bas, cherchez des artefacts au
niveau de la voix — écrêtage, coupures, timbre robotique. Rapportez
plusieurs prédicteurs pour le même clip : ils sont entraînés sur des
données différentes et divergent de manière informative, et un large écart
entre deux prédicteurs indépendants sur le même clip est une invite à aller
écouter.

## Métriques intrusives : lire les nombres

Onze métriques référencées mesurent la distance par rapport à un original
propre. Celles à connaître en premier :

| métrique | plage | direction | mesure |
|---|---|---|---|
| `stoi` / `estoi` | 0–1 | plus haut est meilleur | intelligibilité objective à court terme — quelle proportion du *contenu* survit, indépendamment du naturel |
| `si_sdr` / `sdr` / `snr` | dB, non borné | plus haut est meilleur | rapport signal-distorsion / signal-bruit |
| `mcd` | dB, non borné | plus bas est meilleur | distorsion mel-cepstrale — distance de l'enveloppe spectrale, une métrique classique de qualité TTS/VC |
| `log_f0_rmse` | non borné | plus bas est meilleur | erreur du contour de hauteur |
| `lsd` / `msd` | dB | plus bas est meilleur | distance log-spectrale / mel-spectrale |

Notez que le sens s'inverse : STOI et la famille SDR montent quand la
qualité s'améliore ; MCD, l'erreur de hauteur et la distance spectrale
descendent. Les confondre en lisant un tableau est une erreur facile.

Noter la même resynthèse par codec par rapport à sa source propre :

```python
>>> s.score("facodec_aria.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav")
{'stoi': 0.662, 'mcd': 10.46, 'si_sdr': -26.94}
```

Un STOI de 0.66 sur une échelle de 0 à 1 où 1.0 est une correspondance
parfaite indique que l'intelligibilité a subi un vrai coup — c'est bien en
dessous de ce que noterait un enregistrement légèrement traité. Un SI-SDR
d'environ −27 dB le confirme : le SI-SDR est négatif dès que l'énergie de
distorsion dépasse le signal, et un grand nombre négatif signifie un
changement structurel lourd, pas seulement du bruit ajouté. Un MCD de
10.46 dB est élevé ; les systèmes TTS publiés qui sonnent clairement
synthétiques mais restent cohérents en termes de locuteur se situent
typiquement à un chiffre, donc 10+ pointe vers une dérive substantielle de
l'enveloppe spectrale entre la resynthèse et l'original.

## Métriques basées sur l'ASR : lire les nombres

Cinq métriques textuelles proviennent d'un alignement de Levenshtein entre
une transcription de référence et une hypothèse (ce que l'audio a
réellement été transcrit comme étant) :

| métrique | plage | direction | signification |
|---|---|---|---|
| `wer` | ≥ 0 (généralement 0–1, peut dépasser 1) | plus bas est meilleur | taux d'erreur au mot : substitutions + suppressions + insertions, divisé par le nombre de mots de référence |
| `cer` | 0–1 | plus bas est meilleur | la même idée au niveau du caractère — plus indulgent face aux petits désaccords d'orthographe/tokenisation |
| `mer` | 0–1 | plus bas est meilleur | taux d'erreur de correspondance |
| `wil` | 0–1 | plus bas est meilleur | information de mot perdue |
| `wip` | 0–1 | plus haut est meilleur | information de mot préservée (`1 − wil`) |

Un exemple travaillé : référence « the quick brown fox jumps over the lazy
dog » contre hypothèse « the quick brown fox jumped over a lazy dog » (une
substitution, « jumps » → « jumped », une suppression de « the ») :

```python
>>> from speechonnxmetrics import asr
>>> from speechonnxmetrics.asr import BASIC
>>> asr.wer(reference, hypothesis, normalizer=BASIC)
0.222
>>> asr.cer(reference, hypothesis, normalizer=BASIC)
0.116
```

Un WER de 0.22 signifie qu'environ un mot sur cinq est faux — notable,
mérite d'être écouté. Le CER est plus bas sur la même paire parce que la
notation au niveau du caractère traite une substitution d'un mot comme une
poignée d'éditions de caractères à l'intérieur d'une chaîne bien plus
longue, pas comme tout un token manquant ; CER et WER répondent à des
questions différentes et ne sont pas directement comparables l'un à
l'autre. Un WER au-dessus d'environ 0.3–0.4 sur de la parole naturelle
signifie généralement que le système ASR, ou l'audio qu'il transcrit, a un
vrai problème, pas une erreur d'arrondi.

`speechonnxmetrics` ne normalise jamais le texte à votre place — une
comparaison brute compte la casse et la ponctuation comme des erreurs, ce
qui est rarement ce que vous voulez quand vous notez la prononciation
plutôt que le formatage exact de la transcription. Passez un normaliseur
explicitement : `BASIC` met en minuscules et réduit les espaces, `STRICT`
développe aussi les contractions et retire les diacritiques, la ponctuation
et les mots de remplissage.

## La mise en garde la plus importante

Chaque nombre MOS sans référence de cette bibliothèque est une prédiction
d'un modèle, pas la mesure d'un fait. UTMOS, DNSMOS, SIGMOS et NISQA ont
chacun été entraînés sur un jeu spécifique de données de tests d'écoute,
dans des langues et des conditions d'enregistrement spécifiques. Un
prédicteur entraîné surtout sur des enregistrements de studio en anglais
peut mal juger une langue qu'il n'a jamais vue à l'entraînement, un accent
que son panel d'entraînement n'a jamais noté, ou une condition
d'enregistrement — audio téléphonique, pièce bruyante, microphone bas de
gamme — en dehors de sa distribution d'entraînement. Le modèle ne ment pas ;
il extrapole, et l'extrapolation à partir d'entrées inconnues est là où les
prédicteurs neuronaux sont les moins fiables.

Traitez un MOS prédit comme une preuve, pas comme une vérité terrain. Il
est digne de confiance pour ce en quoi il excelle : détecter de grandes
régressions, classer plusieurs candidats les uns contre les autres, et
signaler une exécution qui nécessite qu'un humain écoute réellement. Ce
n'est pas un substitut à un vrai panel d'écoute quand une décision est
critique, et cela ne devrait pas avoir le dernier mot sur une langue ou une
condition que le modèle sous-jacent n'a pas été entraîné à juger. Rapporter
plusieurs prédicteurs ensemble, et traiter leur désaccord comme une invite
à écouter plutôt que du bruit à moyenner, est le palliatif pratique.

## Pourquoi c'est ce qui rend une comparaison utilisable

Rien de tout cela n'est utile isolément. Cela devient utile au moment où
plusieurs moteurs doivent être comparés sur un pied d'égalité — quel moteur
TTS, quel moteur STT, quel modèle d'amélioration adopter par défaut. Les
[bibliothèques de parole en ONNX pur](/blog/2026-08-03-a-family-of-pure-onnx-speech-libraries)
que `speechonnxmetrics` a été construite pour évaluer — TTS, ASR,
débruitage, clonage vocal — publient des comparaisons par moteur produites
avec exactement les métriques ci-dessus : MOS sans référence pour les
systèmes sans vérité terrain, métriques intrusives là où une référence
propre existe, WER/CER partout où la justesse de la transcription est en
question. C'est ce qui transforme « nous avons choisi ce moteur » en un
nombre que quelqu'un d'autre peut vérifier.

Si votre projet a besoin d'une langue, d'un moteur ou d'une condition
d'enregistrement évalués de cette manière et que ce n'est pas encore
couvert, [contactez-nous](/contact) ou consultez [nos services](/services).

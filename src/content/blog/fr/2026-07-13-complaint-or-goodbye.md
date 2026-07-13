---
title: "Votre modèle de sentiment ne sait pas distinguer une plainte d'un au revoir"
description: "Deux messages de support qui ont l'air en colère. L'un est sur le point d'escalader ; l'autre est sur le point de partir sans un mot. Presque aucun modèle d'émotion ne peut les distinguer — parce qu'ils leur manquent tous le même axe. Présentation de emotion-algebra."
date: 2026-07-13
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Affective Computing"
  - "Emotion"
  - "Machine Learning"
  - "LILACS"
  - "Open Source"
  - "Science"
draft: false
---

Deux messages arrivent dans votre file de support.

> « C'est la troisième fois que votre application perd mon travail. Corrigez ça. »

> « Je ne sais pas si je fais ça bien et j'ai peur d'avoir cassé quelque chose. »

Passez-les dans n'importe quel modèle de sentiment que vous voulez. Les deux reviennent
identiques : **négatif, forte activation**. On dirait de la colère. De la frustration.

Du coup vous les traitez de la même manière — et vous venez de faire une erreur,
parce que ces deux personnes ont besoin de choses opposées.

La première est *furieuse*, et les gens furieux sont **engagés**. Ils croient
qu'ils peuvent forcer un correctif, et ils vont continuer à pousser jusqu'à l'obtenir.
Envoyez-leur des excuses chaleureuses et une promesse de regarder le problème, et vous
allez les mettre encore plus en rage.

La seconde est *effrayée*. Elle ne croit pas pouvoir résoudre quoi que ce soit.
Un mauvais message de plus et elle ferme l'onglet sans jamais revenir — sans un bruit,
sans jamais vous dire pourquoi. Envoyez-lui un numéro de ticket et un délai de
cinq jours, et vous l'aurez perdue.

L'une est une plainte. L'autre est un au revoir. Et presque rien dans la boîte à
outils de l'émotion-AI ne peut vous dire laquelle est laquelle.

On a passé un moment à comprendre pourquoi. La réponse s'est révélée plus intéressante
qu'on ne l'attendait, et elle se termine par un réseau de neurones entraîné sur un
milliard de tweets qui donne raison à un article de psychologie de 1985 qu'il n'a
jamais lu.

## La dimension manquante

Voilà le truc avec la colère et la peur : **elles sont presque identiques,
mesurées de la façon habituelle.**

Les deux sont désagréables. Les deux sont très activatees — votre rythme cardiaque
s'accélère dans les deux cas. Ces deux qualités, « à quel point c'est agréable » et
« à quel point vous êtes tendu », sont les deux dimensions sur lesquelles presque
tous les modèles d'émotion sont construits. On les appelle généralement *valence*
et *activation*.

La colère et la peur se retrouvent l'une sur l'autre dans cet espace. Aucun modèle
construit à partir de ces deux chiffres ne peut les séparer, aussi sophistiqué
soit-il, parce que l'information n'y est tout simplement pas.

Ce qui les sépare vraiment, c'est une troisième chose : **est-ce que vous vous
sentez capable de faire quelque chose ?**

La colère, c'est ce que vous ressentez quand quelque chose ne va pas *et que vous
pouvez agir*. La peur, c'est ce que vous ressentez quand quelque chose ne va pas
*et que vous ne pouvez pas*. Ce sentiment de contrôle — les psychologues l'appellent
*potentiel de coping* ou *puissance* — c'est toute la différence. C'est aussi ce
qui vous dit si quelqu'un va se battre ou fuir, escalader ou disparaître.

Ce n'est pas une idée marginale. **Quatre programmes de recherche indépendants**
y sont arrivés séparément sur deux décennies, et l'un d'eux (Lerner & Keltner, 2001)
l'a démontré *causalement* : les gens en colère font des jugements optimistes et
tolérants au risque, tandis que les gens effrayés font des jugements pessimistes
et hostiles au risque — et l'effet passe par le contrôle et la certitude, pas par
le degré de désagrément.

Leur résultat le plus frappant mérite qu'on s'y arrête. **Les jugements des gens
en colère ressemblent à ceux des gens heureux.** Pas à ceux des gens effrayés.
La colère et le bonheur ont des valences opposées, et ça n'a aucune importance,
parce que ce n'est pas la valence qui fait le travail.

Alors pourquoi cet axe n'apparaît-il pas dans les outils ?

## Pourquoi l'axe a disparu

La plupart des outils d'émotion remontent à un petit nombre de modèles théoriques.
Les deux plus influents sont la **roue des émotions de Plutchik** (1980) et, construit
par-dessus, le **sablier des émotions de Cambria** (2012), qui est le modèle derrière
SenticNet.

La roue de Plutchik est un bel objet. Elle est en forme de cercle chromatique, et elle
transpose l'idée centrale du cercle chromatique : les émotions viennent en **paires
opposées**. La joie s'oppose à la tristesse. La confiance s'oppose au dégoût. Et la
colère s'oppose à la peur.

Cette dernière paire est le problème, et une fois que vous le voyez, vous ne pouvez
plus le dévoir.

Si la colère et la peur sont les extrémités opposées d'un même axe, alors elles se
neutralisent. Prenez la rage la plus intense qu'un être humain puisse ressentir,
mélangez-la à la terreur la plus intense, et demandez au modèle ce que vous obtenez :

```
(rage + terror) / 2  ==  neutrality
```

**Calme.** Mélangez les deux états négatifs les plus violents dont un être humain
est capable, et le modèle vous dit que vous ne ressentez rien du tout.

Ce n'est pas un bug d'implémentation. C'est une conséquence directe de la géométrie
— et ça signifie que le modèle a jeté exactement la quantité dont nous avions besoin.
En faisant de la colère et de la peur des *opposées*, il garantit qu'elles ne
pourront jamais être *distinguées*.

La roue le sait à moitié, d'ailleurs. Le Sablier a une formule pour calculer le
sentiment, et dans cette formule l'axe colère–peur est enveloppé dans une valeur
absolue : **les deux extrémités comptent comme désagréables.** Ce qui est vrai !
La colère et la peur sont toutes les deux désagréables. Mais ça contredit en douce
la géométrie qui les a mises aux pôles opposés au départ. L'arithmétique du modèle
contredit son propre diagramme.

## Ce que les preuves disent réellement

À ce stade on a arrêté d'écrire du code et on est allé lire la littérature, et ça
n'a pas été des jours très confortables.

La structure de paires opposées de Plutchik a été testée. En 2009, Smith & Schneider
l'ont soumise à plus de deux mille tests statistiques et ont conclu que la théorie
de la roue des émotions « ne reçoit aucun soutien empirique ». Les paires opposées
sont une métaphore élégante empruntée à la théorie des couleurs. Ce ne sont pas des
résultats sur les gens.

Pendant ce temps, ce qui *fonctionne* — le circumplexe valence–activation de Russell,
et la dimension de contrôle qui sépare la colère de la peur — ce sont exactement les
éléments qui arrivent rarement dans des logiciels en production.

Il y a un problème de second ordre ici, et c'est celui qui nous a réellement dérangés.
Chacun de ces modèles est *utilisable*. Ils sont vivants, faciles à enseigner, ils
tiennent sur une diapositive. Alors ils se répètent — et une fois qu'un modèle a été
répété suffisamment, vérifier d'où il vient commence à ressembler à de la pédanterie
plutôt qu'à de la rigueur. C'est comme ça qu'une métaphore devient silencieusement
un fondement.

## Construire sur ce qui survit

On a donc construit [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra),
en plaçant l'axe manquant au centre.

Le noyau a cinq chiffres : à quel point c'est agréable, à quel point c'est désagréable
(oui, séparément — on y reviendra), à quel point vous vous sentez en contrôle, à quel
point vous êtes activé, et à quel point tout ça était inattendu. Ils viennent de
Fontaine et ses collègues (2007), qui les ont déduits de 144 caractéristiques mesurées
à travers les cultures plutôt que d'un diagramme séduisant.

Maintenant le mélange se comporte correctement :

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Pas « calme ». **Détresse** — profondément désagréable, fortement activée, avec le
sentiment de contrôle annulé. Ce qui est exactement ce que devrait ressembler un
mélange de rage et de terreur.

Et la file de support fonctionne :

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'annoyance'
afraid.valence, afraid.potency   # -0.47, -0.43   -> 'apprehension'
```

Regardez ces chiffres. **La valence est quasi identique** — les deux messages sont
à peu près également désagréables, c'est pourquoi un modèle de sentiment classique
ne voit qu'une seule chose. La *puissance* est opposée. L'un se sent capable d'agir ;
l'autre non.

Ça, c'est votre plainte. Et ça, c'est votre au revoir.

## Le test qui pouvait tout faire échouer

Voilà ce qui nous inquiétait. Tout ce qui précède repose sur la littérature
psychologique, et cette littérature est construite presque entièrement sur des
**questionnaires** — des gens qui notent des mots sur une échelle de 1 à 9. Les
questionnaires ont une propriété désagréable : ils peuvent tranquillement *encoder*
une théorie plutôt que la tester. Si tout le monde qui rédige des questionnaires
d'émotion a appris le même manuel, les questionnaires seront d'accord avec le
manuel, et tout le monde se sentira bien validé.

On voulait un témoin sans aucune formation théorique.

**DeepMoji** est un réseau de neurones entraîné sur **1,2 milliard de tweets**
pour deviner quel emoji termine un message. C'est honnêtement tout ce qu'il fait.
Il n'a jamais entendu parler de Plutchik, ni de la théorie de l'évaluation, ni du
potentiel de coping. Il n'a aucune opinion sur les émotions — il a juste un sens
extrêmement bien informé de la façon dont les gens *écrivent réellement* quand ils
ressentent des choses.

Alors on lui a posé la seule question qui comptait :

> Arrives-tu à distinguer la colère de la peur ? Et si oui — qu'est-ce que tu
> utilises pour ça ?

**Il le peut.** Avec de vrais commentaires humains étiquetés par de vrais humains,
il sépare la colère de la peur bien au-delà du hasard. (Si on mélange les
étiquettes, la capacité disparaît complètement, donc ce n'est pas un artefact de
notre méthode.)

Ensuite on a regardé *comment*. On a pris la direction que DeepMoji utilise pour
distinguer les deux, et mesuré à quel point elle s'aligne avec chacun de nos cinq
axes.

Elle s'aligne avec la **puissance** — trois fois plus fortement qu'avec quoi que ce
soit d'autre. Pas la valence. Pas l'activation.

Un modèle entraîné sur un milliard de tweets, qui n'a jamais appris que la colère
implique un sentiment de contrôle et que la peur implique son absence, se tourne
vers exactement cette distinction quand vous le forcez à choisir. Il a trouvé l'axe
tout seul.

C'est la chose la plus convaincante que nous ayons, et nous tenons à être clairs :
ça aurait pu tourner autrement. Si DeepMoji avait séparé la colère et la peur en
se basant sur la valence, ou ne les avait pas séparées du tout, notre troisième axe
aurait été un artefact de la littérature psychologique et nous aurions été obligés
de le dire.

## Doux-amer, et autres choses qu'un seul nombre ne peut pas contenir

Une dernière conséquence, parce que c'est une jolie.

On transporte « à quel point c'est agréable » et « à quel point c'est désagréable »
comme **deux chiffres séparés**, plutôt qu'un score unique allant de négatif à
positif. Ça a l'air d'un détail technique. Ce n'en est pas un.

Les gens ressentent vraiment du bien et du mal en même temps. L'étude canonique
utilise la remise de diplômes : les étudiants rapportent du bonheur réel et de la
tristesse réelle *simultanément*, pas un tiède mélange des deux. Un score de valence
unique est mathématiquement incapable de représenter ça. Il doit rapporter « légèrement
heureux », ce que personne là-bas ne ressent.

Deux canaux peuvent le contenir. Ce qui signifie que le modèle peut représenter la
victoire reluctant, l'au revoir tendre, le client qui est soulagé *et* encore en
colère. Ce sont les émotions intéressantes, et ce sont celles qu'un seul nombre
aplatit.

## Des émotions pour l'autre côté

Tout ce qui précède concerne la lecture d'un humain. Le même mécanisme fonctionne
à l'envers, pour donner à un personnage une vie émotionnelle propre.

Une émotion, ici, c'est un *déplacement* — vous avez été poussé loin de votre
position habituelle, et avec le temps vous dérivez de retour. L'endroit vers lequel
vous dérivez n'est pas zéro. Il n'y a pas de « pas d'émotion » ; même au repos,
vous êtes quelque part, et ce quelque part est légèrement agréable, calme, et
légèrement sous contrôle. (Cette légère inclinaison positive est la raison pour
laquelle une créature au repos va *explorer* quelque chose au lieu de rester
inerte. C'est un effet réel, mesuré.)

Donc un garde qui vient de voir quelque chose de terrifiant ne revient pas à la
neutralité quand un minuteur s'écoule. Il redescend à travers :

```
terror → fear → apprehension → pensiveness → acceptance
```

La peur, puis la méfiance, puis une sorte de rumination silencieuse, et finalement
il va bien. On n'a pas écrit cette séquence ; elle découle de la géométrie.

Et deux gardes peuvent différer parce qu'ils se stabilisent vers des *positions de
repos différentes*. Donnez-en un légèrement moins de contrôle et une habitude de
prendre les mauvaises nouvelles deux fois plus fort, et il devient reconnaissablement
anxieux — il se surprend plus, récupère plus lentement, rumine plus longtemps.
Ça c'est un personnage, et c'est quatre chiffres plutôt qu'un arbre de comportement.

Puis la partie utile : qu'est-ce qu'il *fait* ? Ça aussi vient de l'axe de contrôle.
Le garde en colère vous charge. Le garde effrayé fuit. « Émotion négative » ne peut
pas choisir entre les deux, et elle ne l'a jamais pu.

## La partie où on vous dit ce qui ne va pas

Chaque modèle de la bibliothèque porte un **grade** et une citation — de
`ESTABLISHED` (répliqué, transculturel, méta-analytique) jusqu'à `METAPHOR`
(un joli diagramme qui n'a pas survécu aux tests).

La roue de Plutchik est dedans, classée `METAPHOR`, et elle fonctionne toujours
exactement comme Plutchik l'a spécifié — `-anger` donne toujours `fear`, parce que
c'est ce que son modèle dit. Son arithmétique est fidèlement implémentée, *et* son
modèle n'est pas juste sur les gens. Les deux choses sont vraies, et on préfère
vous dire les deux que d'en choisir une.

On est tout aussi honnête sur nos propres lacunes :

**Lire l'activation à partir du texte est un problème non résolu.** On arrive à
obtenir la valence, on arrive à obtenir la puissance — on ne peut pas dire de
façon fiable à quel point quelqu'un est *tendu* à partir de ses mots. Notre meilleur
chiffre est mauvais. On le livre en le qualifiant de mauvais plutôt qu'en espérant
discrètement que vous ne vérifierez pas.

**L'un de nos propres résultats est provisoire.** Le « sentiment de contrôle » qui
*cause* la colère et le « sentiment de contrôle » que les gens *rapportent quand ils
sont en colère » ne sont pas la même chose — on se sent moins maître de soi en plein
accès de rage que la théorie ne le prédirait. Perdre son calme, après tout, c'est
*perdre le contrôle*. On pense que c'est important. On pense aussi que nos preuves
à ce sujet sont maigres, et on l'a signalé en conséquence.

## Pourquoi on s'est donné la peine

Une bibliothèque d'émotion qui affirme tranquillement des choses que les preuves
contredisent est pire qu'inutile. Elle est *confiantement* inutile — et tout ce qui
est construit dessus hérite du silence, pour toujours.

On préfère livrer quelque chose qui vous dit combien faire confiance à chacune de
ses propres parties.

```bash
pip install emotion-algebra
```

La [documentation](https://github.com/TigreGotico/emotion-algebra) a un guide de
démarrage en cinq minutes, un guide pour donner à un agent une vie émotionnelle,
et le tableau complet des preuves avec chaque citation. Si vous pensez que l'un de
nos grades est faux, la source est là pour en débattre — et on aimerait sincèrement
en entendre parler.

Pendant ce temps : quelque part dans votre file de support, quelqu'un compose
tranquilllement un au revoir. Ce serait bien de savoir lequel il est.

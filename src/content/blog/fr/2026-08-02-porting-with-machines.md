---
title: "Porter avec des machines, et la question de licence à laquelle nous n'avons pas pu répondre"
description: "Nous avons réécrit plusieurs programmes en C, C++ et Java (le G2P d'espeak-ng, Cotovia, AhoTTS, HermiT) en Python pur, avec une IA lisant la source originale et un humain orchestrant. Personne de notre côté n'a lu les originaux. Cela soulève deux questions distinctes : le résultat peut-il seulement être possédé, et est-il une œuvre dérivée de l'entrée ? Nous avons gardé les licences amont parce que c'était moins coûteux que d'y répondre. Nous pensons toujours que la question reste ouverte."
date: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
---

Nous avons réécrit une poignée de vieux programmes en Python. Le front-end G2P
d'[espeak-ng](https://github.com/espeak-ng/espeak-ng), les règles de
transcription galicienne et espagnole de
[Cotovia](https://gtm.uvigo.es/en/transfer/software/cotovia/), le traitement
linguistique basque d'[AhoTTS](https://github.com/aholab/AhoTTS), le
raisonneur N3 [EYE](https://github.com/eyereasoner/eye), et le raisonneur
OWL 2 DL [HermiT](http://www.hermit-reasoner.com/). Du C, du C++ et du Java,
la plupart plus vieux qu'une décennie.

Le motif était ordinaire. Un programme en C qui phonémise le galicien est
excellent jusqu'à ce que vous vouliez l'intégrer dans une stack de parole
Python sur une carte ARM : il faut alors un compilateur, une chaîne d'outils,
de la compilation croisée, une frontière de sous-processus à travers laquelle
marshaler du texte. Un raisonneur Java a besoin d'une JVM ; le Python pur n'a
besoin que de `pip install`, et vous pouvez ouvrir le fichier qui décide où va
l'accent tonique et le modifier.

Les ports ont été réalisés de manière semi-autonome : une IA a lu la source
originale et écrit le Python, un humain a dirigé le travail et vérifié la
sortie par rapport au binaire original. Sur plusieurs d'entre eux, personne de
notre côté n'a jamais lu la source originale ; le modèle si, et nous avons lu
les diffs et les tests de parité.

Cela laisse une question à laquelle nous n'avons pas pu répondre : **le
résultat est-il une œuvre dérivée, et à qui appartient-il ?**

Nous sommes des ingénieurs. Rien ici n'est un conseil juridique, et nous ne
sommes pas qualifiés pour en donner : ceci est une description d'une décision
que nous avons prise et du raisonnement qui la sous-tend.

## Deux questions que l'on confond sans cesse

Réimplémenter un programme en lisant sa source n'est pas nouveau. Ce qui est
nouveau, c'est l'arrangement : le lecteur est une machine, l'implémenteur est
la même machine, et les humains dans la boucle n'ont jamais vu l'original.

Il y a deux questions indépendantes ici, presque toujours effondrées en une
seule, alors qu'on peut répondre oui à l'une et non à l'autre.

1. **Le résultat peut-il seulement être possédé ?** Le droit d'auteur
   s'attache à des œuvres ayant des auteurs. Si une machine a produit le
   code, qui en est l'auteur ?
2. **Le résultat est-il une œuvre dérivée de l'entrée ?** Quel que soit celui
   qui l'a créé, si quelqu'un l'a créé, le résultat contrefait-il
   l'original ?

Une **œuvre dérivée** (*derivative work*) est une œuvre fondée sur une œuvre
préexistante, comme une traduction ou un portage. Les licences **copyleft**
(la famille GPL) vous permettent d'utiliser et de modifier le code à
condition que ce que vous distribuez reste sous les mêmes termes. Les
licences **permissives** (MIT, Apache-2.0, BSD) vous permettent d'intégrer le
résultat dans un logiciel propriétaire. La **LGPL** se situe entre les deux.

## Question un : y a-t-il un auteur ?

Le droit d'auteur exige un auteur humain. Le Copyright Office américain l'a
maintenu de manière constante, et dans *Thaler v. Perlmutter*, la Cour
d'appel du D.C. Circuit a confirmé : le Copyright Act « exige que toute œuvre
éligible soit, en première instance, l'œuvre d'un être humain » (No. 23-5233,
D.C. Cir., 18 mars 2025 ; la Cour suprême a refusé le certiorari en mars
2026). La norme européenne aboutit à un résultat similaire : la protection
exige la « création intellectuelle propre à l'auteur », ce qui présuppose un
auteur qui crée.

Aucune de ces positions ne dit que le travail assisté par IA est
non protégeable, seulement que ce qu'une machine génère seule ne l'est pas,
et l'endroit exact où tombe la ligne dépend de l'ampleur de la contribution
humaine : dans nos ports, réelle mais ténue — choisir la cible, structurer le
paquet, juger les échecs de parité. Il n'est pas évident que cela fasse de
nous les auteurs des règles de transcription.

Ce qui produit un objet malaisé : une licence est une concession de
permission accordée par un titulaire de droits, donc si personne ne détient
de droits sur le résultat, le fichier de licence à la racine du dépôt n'est
que décoration, et l'argument se dévore lui-même. Quiconque soutient que du
code généré par machine n'appartient à personne soutient que ses propres
conditions de publication ne sont pas opposables, avant même d'aborder celles
de l'amont.

## Question deux : est-ce dérivé ?

Celle-ci ne se soucie pas de savoir qui est l'auteur. La contrefaçon repose
sur l'accès à l'original plus une similarité substantielle avec son
**expression** protégée, la manière particulière dont la chose a été écrite,
pas ce qu'elle fait, et nous avions accès : le modèle a lu la source, et
cette moitié n'est pas contestée.

La moitié de la similarité est là où le changement de langage compte moins
qu'on ne l'attend. Traduire un roman produit une œuvre dérivée ; changer de
langage défait une accusation de copie littérale, mais pas une accusation
portant sur la structure, l'ordre des transformations, la décomposition en
fonctions, la forme des tables de règles.

Un outil ne blanchit rien non plus : si vous dirigez une copie et livrez le
résultat, c'est vous qui l'avez fait, et « le modèle l'a écrit » n'est pas
une défense, pas plus que « le compilateur l'a émis » n'en serait une.

## L'argument le plus fort dans l'autre sens

Il existe un argument sérieux selon lequel une réimplémentation
inter-langages est parfaitement licite. Dans *SAS Institute v World
Programming* (CJUE, C-406/10, 2 mai 2012), la Cour a jugé que « ni la
fonctionnalité d'un programme d'ordinateur, ni le langage de programmation,
ni le format des fichiers de données utilisés dans le cadre d'un programme
d'ordinateur pour exploiter certaines de ses fonctions ne constituent une
forme d'expression de ce programme ». La directive Logiciels (2009/24/CE,
article 1(2)) dit la même chose des idées et principes qui sont à la base
d'un programme, et la Cour a jugé qu'un licencié peut étudier le
comportement d'un programme pour en déterminer les idées sous-jacentes, et
les réimplémenter.

Cela signifie que ce qu'un phonémiseur *fait*, transformer cette séquence de
graphèmes en tel phonème, n'est possédé par personne : les règles
d'accentuation galiciennes sont des faits sur le galicien, et la sémantique
directe OWL 2 est une spécification W3C publiée. Une réimplémentation qui
reproduit un comportement plutôt qu'une expression est licite, et une
réécriture d'un langage à un autre se situe bien plus loin de la contrefaçon
qu'un copier-coller.

L'écart entre cet argument et notre situation, c'est la source : *SAS*
concerne l'étude d'un comportement, et notre modèle a lu le code.

## Le précédent qui existe déjà, et jusqu'où il porte

L'argument « la sortie machine n'a pas d'auteur, donc aucun droit d'auteur
ne s'y attache » n'est pas une expérience de pensée : la distillation de
modèles et les données d'entraînement synthétiques reposent toutes deux
dessus, à l'échelle de l'industrie. L'énoncé public le plus clair en est
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), un modèle TTS
ouvert largement utilisé, dont la fiche indique qu'il a été entraîné
exclusivement sur de l'audio permissif ou non protégé par le droit d'auteur,
et cite parmi les sources permises :

> Synthetic audio generated by closed TTS models from large providers

avec une note de bas de page renvoyant vers les
[recommandations de politique IA](https://copyright.gov/ai/ai_policy_guidance.pdf)
du Copyright Office américain : la sortie machine n'a pas d'auteur humain,
donc rien ne subsiste à contrefaire en entraînant dessus. Le modèle est
publié sous Apache-2.0, et la fiche exclut aussi l'audio synthétique issu de
modèles TTS *ouverts* et des clones de voix personnalisés, signe que les
auteurs ont déterminé où l'argument s'arrête.

Ce précédent résout l'autre moitié du problème. L'argument de Kokoro porte
sur l'**entrée** : ce qu'ils ont consommé était lui-même généré par machine,
donc l'affirmation est qu'il ne portait aucun droit d'auteur au départ.
Notre situation est l'image en miroir : ce que nous avons consommé, le C
d'espeak-ng, le C++ de Cotovia et le Java de HermiT, est écrit par des
humains et protégé par le droit d'auteur, par des personnes nommées dans des
universités nommées, et ce qui en est *sorti* a été écrit par une machine,
donc l'argument retombe sur notre sortie, pas sur notre entrée, et ne remonte
pas en amont.

Il y a une asymétrie supplémentaire : l'exposition résiduelle de Kokoro,
s'il en existe une, relève du **contrat** plutôt que du droit d'auteur, et
cette obligation survit là même où le droit d'auteur ne s'applique pas. Le
copyleft ne fonctionne pas ainsi ; personne ne clique « J'accepte » pour la
GPL, et elle ne vous lie que si ce que vous avez fait est une œuvre dérivée.

Tout retombe donc sur la question à laquelle personne n'a répondu. Si une
réimplémentation inter-langages écrite par une machine n'est pas une œuvre
dérivée, la GPL n'a jamais été engagée. Si c'en est une, elle s'appliquait
dès la première ligne. Il n'y a pas de troisième état.

## Salles blanches, et deux modèles font-ils une salle blanche

La réponse classique à ce problème est le protocole de la salle blanche
(*clean room*) : une équipe lit l'original et écrit une spécification
fonctionnelle de ce que fait le programme, et une seconde équipe, qui n'a
jamais vu l'original, implémente uniquement à partir de cette spécification.
C'est ainsi que le BIOS du PC a été réimplémenté, et pourquoi cela a survécu.

Le geste moderne évident est de faire tourner un modèle pour lire et
décrire, et un modèle différent, avec un contexte neuf, pour implémenter,
structurellement le même protocole. Cela en a la bonne forme, mais une salle
blanche n'est pas une construction technique, c'est une construction
**probatoire**, dont toute la valeur consiste à démontrer la séparation à
quelqu'un qui suppose que vous avez triché. La version à deux modèles ne
signifie quelque chose que si la discipline tient :

- Les deux côtés ne partagent réellement jamais de contexte. Pas « on lui a
  dit d'oublier » — des exécutions séparées, des transcriptions séparées.
- La spécification porte le comportement et rien d'autre. Pas de pseudo-code
  qui reflète le flux de contrôle de l'original. Pas de noms d'identifiants.
  Pas d'ordre des fonctions. Ce sont de l'expression, et une spécification
  pleine de cela est l'original déguisé.
- Les enregistrements des deux côtés sont conservés, car une salle blanche
  que vous ne pouvez pas prouver est une histoire.

Si le côté lecture émet de la structure, la contamination passe tout droit,
et vous avez une œuvre dérivée avec des étapes supplémentaires et une
facture de tokens plus élevée.

Nous n'avons pas fait cela : le modèle qui implémentait a lu la source
directement, ce qui explique pourquoi le README de pycotovia dit,
publiquement :

> Because the implementing AI **read the GPL source**, this is **not a
> clean-room reimplementation** and we make no such claim. It is a
> source-derived port.

Nous préférons avoir écrit cette phrase plutôt que d'avoir à y répondre plus
tard.

## Ce que nous avons fait

Nous avons conservé les licences amont : copyleft en entrée, copyleft en
sortie ; permissif en entrée, permissif en sortie.
[espyak](https://github.com/TigreGotico/espyak) est GPL-3.0-or-later,
correspondant à espeak-ng ; ce n'est même pas un cas difficile, puisqu'il
embarque verbatim les propres fichiers de données d'espeak-ng
(`dictsource`, `phsource`, `lang`), et aucune théorie de l'auctorialité ne
touche des fichiers copiés sans modification.
[pycotovia](https://github.com/TigreGotico/pycotovia) est GPL-3.0,
correspondant à Cotovia (GPL-3.0+).
[ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) et
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
sont GPL-3.0, correspondant à AhoTTS. [pyeye](https://github.com/TigreGotico/pyeye)
est MIT, correspondant à EYE.

Nous n'avons pas fait cela parce que nous avons établi que c'était requis,
mais parce que l'asymétrie a pris la décision sans avoir besoin de la
réponse : le copyleft ne nous coûte presque rien ici, tandis qu'une licence
permissive sur quelque chose qui aurait dû être copyleft est la pire erreur,
découverte tardivement et publiquement, après que d'autres ont construit
dessus sous des conditions que vous n'étiez pas en droit d'offrir.

Cette asymétrie vaut la peine d'être guettée en général : rien ne se plaint
quand un portage structurel d'un original LGPL devient tranquillement
Apache-2.0 en traduction. HermiT est LGPL et notre portage Python en porte
la LGPL-3.0 pour correspondre. Le reste de l'ensemble en a révélé deux
autres, tous deux sans drame : un wrapper déclarant Apache-2.0 dont l'amont
est MIT, et des dépôts dont le README nommait une licence sans fichier
correspondant. Vous vérifiez, vous corrigez ce qui doit l'être, et la
question intéressante reste ouverte.

Vous n'avez pas besoin de résoudre le droit pour prendre cette décision ;
vous prenez simplement la branche où se tromper est supportable.

## La même question, dans l'autre sens

La même logique s'applique au code que nous recevons : quelqu'un ouvre une
pull request écrite par un modèle, et la question est de savoir ce qu'il
nous concède.

La plupart des projets gèrent cela avec le
[Developer Certificate of Origin](https://developercertificate.org/) : la
ligne `Signed-off-by:` attestant que vous avez écrit la contribution, ou
qu'elle provient d'une source compatible que vous avez le droit de
soumettre. C'est ainsi que le noyau Linux et QEMU établissent d'où vient
leur code.

Pour un patch écrit par une machine, aucun des deux volets n'est
franchement vrai : si la sortie machine ne porte aucun droit d'auteur, le
contributeur ne détient aucun droit dessus ; si au contraire elle dérive des
données d'entraînement, les droits appartiennent à quiconque a écrit ces
données. Dans les deux cas, ils ne peuvent pas concéder ce qu'ils ne
détiennent pas, et la signature, bien que non malhonnête, transfère quelque
chose qui n'a jamais été le sien à transférer.

Les conséquences diffèrent nettement. Sur la première branche, un matériau
que personne ne possède peut être utilisé par n'importe qui, mais le
copyleft ne peut pas s'attacher à un matériau qui n'en porte aucun, si bien
qu'un projet GPL qui accueille des patchs écrits par machine accumule
tranquillement des parties que sa propre licence pourrait ne pas atteindre.
La seconde a des dents : si un modèle reproduit verbatim des données
d'entraînement mémorisées, ce qui arrive davantage avec des idiomes qu'avec
une logique inédite, vous avez accepté le code protégé de quelqu'un
d'autre sur l'assurance d'un contributeur qui n'avait aucun moyen de le
vérifier, et cela frappe le plus durement les projets à la provenance la
plus soignée.

Debian travaille cette question. Une
[résolution générale sur l'usage des LLM](https://www.debian.org/vote/2026/vote_002)
est entrée en période de discussion en juillet 2026, allant de l'interdiction
pure et simple des contributions assistées par LLM à leur autorisation sous
divulgation et responsabilisation, et rien n'est décidé. Une
[tentative antérieure en 2024](https://lwn.net/Articles/972331/) s'est aussi
terminée sans résolution : l'objection n'était pas que la préoccupation
était sans fondement, mais qu'une règle que personne ne peut faire respecter
ne vaut pas la peine d'être adoptée.

Nous sommes mal placés pour être stricts : nous publions des ports écrits
par un modèle, et un projet qui publie du code écrit par machine tout en
refusant les contributions écrites par machine tient deux positions
incompatibles à la fois.

La licence n'est pas le seul axe le long duquel court cet argument, même si
c'est celui dont traite cet article. Codeberg a adopté deux motions
approuvées par ses membres en juillet 2026 et
[a exposé son raisonnement](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
en des termes qui touchent à peine aux licences : coût en énergie et en
matériel, trafic de robots d'exploration, projets à usage unique jamais
maintenus, et la charge que les patchs à faible effort font peser sur les
personnes qui les relisent. C'est distinct de la question de savoir si le
code peut être mis sous licence. Debian vote sur la première question et
n'a pas conclu ; Codeberg a agi sur la seconde.

## La partie que nous n'allons pas prétendre réglée

Nous n'avions peut-être pas besoin de faire tout cela.

Prenez les trois arguments ensemble. La fonctionnalité n'est pas protégée —
la CJUE l'a dit directement. Une sortie purement générée par machine peut
n'avoir aucun auteur humain, donc il se peut qu'il n'y ait aucun nouveau
droit d'auteur dont s'inquiéter et, maladroitement, aucun qui soit le nôtre
non plus. Et un protocole à deux modèles exécuté avec une vraie discipline
pourrait être une authentique salle blanche, auquel cas le portage n'a
jamais touché d'expression protégée du tout.

Si les trois tiennent, certains de ces ports auraient pu être mis sous
licence permissive en toute bonne conscience. Si aucun ne tient, notre choix
prudent était simplement correct. Nous ne savons pas lequel, nous ne l'avons
pas testé, et nous ne tenons pas à être le cas qui tranche la question.

La question ne disparaît pas parce qu'on l'ignore. Ce genre de portage
devient ordinaire, et il y a une grande quantité de C non maintenu qui
mérite d'être déplacé quelque part où il pourra l'être. Chacun de ces ports
fera face aux deux mêmes questions, et la plupart y répondront en ne les
posant pas. Comme le fera tout projet qui fusionne un patch qu'il n'a pas
écrit, c'est-à-dire tous.

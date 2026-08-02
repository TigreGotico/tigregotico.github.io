---
title: "Porter avec des machines, et la question de licence à laquelle nous n'avons pas pu répondre"
description: "Nous avons réécrit plusieurs programmes en C, C++ et Java — le G2P d'espeak-ng, Cotovia, AhoTTS, HermiT — en Python pur, avec une IA lisant la source et un humain orchestrant. Cela soulève deux questions : le résultat peut-il être possédé, et est-il une œuvre dérivée ? Nous avons gardé les licences amont, faute de mieux."
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
la plupart plus vieux qu'une décennie, tous encore ce qui se fait de mieux
pour ce qu'ils font.

Le motif était ordinaire. Un programme en C qui phonémise le galicien est
excellent jusqu'à ce que vous vouliez l'intégrer dans une stack de parole
Python sur une carte ARM. Il vous faut alors un compilateur, une chaîne
d'outils, de la compilation croisée, une histoire d'empaquetage par
plateforme, et une frontière de sous-processus à travers laquelle marshaler
du texte. Un raisonneur Java a besoin d'une JVM. Le Python pur n'a besoin que
de `pip install`. Cela se lit aussi ainsi : vous pouvez ouvrir le fichier qui
décide où va l'accent tonique et le modifier, sans savoir comment fonctionne
le système de build original.

Les ports ont été réalisés de manière semi-autonome. Une IA a lu la source
originale et écrit le Python ; un humain a dirigé le travail et vérifié la
sortie par rapport au binaire original. Sur plusieurs d'entre eux, personne
de notre côté n'a jamais lu la source originale. Le modèle l'a lue. Nous
avons lu les diffs et les tests de parité.

Cela laisse une question à laquelle nous avons dû prendre une décision, et à
laquelle nous n'avons pas pu répondre : **le résultat est-il une œuvre
dérivée, et à qui appartient-il ?**

Nous sommes des ingénieurs. Rien ici n'est un conseil juridique, et nous ne
sommes pas qualifiés pour en donner. Ceci est une description d'une décision
que nous avons prise et du raisonnement qui la sous-tend.

## Deux questions que l'on confond sans cesse

Réimplémenter un programme en lisant sa source n'est pas nouveau. Les gens
réécrivent du C en Python depuis qu'il y a du Python. Ce qui est nouveau,
c'est l'arrangement : le lecteur est une machine, l'implémenteur est la même
machine, et les humains dans la boucle n'ont jamais vu l'original.

Il y a deux questions ici, et presque toute discussion à ce sujet les
effondre en une seule. Elles sont indépendantes.

1. **Le résultat peut-il seulement être possédé ?** Le droit d'auteur
   s'attache à des œuvres ayant des auteurs. Si une machine a produit le
   code, qui en est l'auteur ?
2. **Le résultat est-il une œuvre dérivée de l'entrée ?** Quel que soit celui
   qui l'a créé — si quelqu'un l'a créé —, le résultat contrefait-il
   l'original ?

Vous pouvez répondre oui à l'une et non à l'autre, dans les deux sens. Il
faut les garder séparées.

Un peu de vocabulaire, car la suite en dépend. Une **œuvre dérivée**
(*derivative work*) est une œuvre fondée sur une œuvre préexistante — une
traduction, une adaptation, un portage. Le droit d'en créer une appartient au
titulaire des droits d'auteur de l'original. Les licences **copyleft**
(la famille GPL) vous permettent d'utiliser et de modifier le code à
condition que ce que vous distribuez reste sous les mêmes termes. Les
licences **permissives** (MIT, Apache-2.0, BSD) vous permettent de faire
essentiellement tout ce que vous voulez, y compris intégrer le résultat dans
un logiciel propriétaire. La **LGPL** se situe entre les deux : le copyleft
s'applique à la bibliothèque elle-même, mais la lier à un programme plus
large ne force pas ce programme à s'ouvrir. Toutes reposent sur le droit
d'auteur. Elles ne mordent que s'il existe un droit d'auteur à faire
respecter.

## Question un : y a-t-il un auteur ?

Le droit d'auteur exige un auteur humain. Le Copyright Office américain l'a
maintenu de manière constante, et dans *Thaler v. Perlmutter*, la Cour
d'appel du D.C. Circuit a confirmé : le Copyright Act « exige que toute
œuvre éligible soit, en première instance, l'œuvre d'un être humain »
(No. 23-5233, D.C. Cir., 18 mars 2025 ; la Cour suprême a refusé le
certiorari en mars 2026). La norme européenne est différente dans sa forme
et aboutit à un résultat similaire — la protection exige la « création
intellectuelle propre à l'auteur », ce qui présuppose un auteur qui crée.

Aucune de ces positions ne dit que le travail assisté par IA est
non protégeable. Toutes deux disent que ce que la machine a généré seule
l'est. La ligne traverse l'œuvre, elle ne la contourne pas, et l'endroit
exact où elle tombe dépend de l'ampleur de la contribution humaine. Dans nos
ports, la contribution humaine est réelle mais ténue : choisir la cible,
structurer le paquet, juger les échecs de parité. Il n'est pas évident que
cela fasse de nous les auteurs des règles de transcription.

Ce qui produit un objet malaisé. Une licence est une concession de
permission accordée par un titulaire de droits. Si personne ne détient de
droits sur le résultat, le fichier de licence à la racine du dépôt n'est que
décoration. Notez où cet argument mène : il dévore d'abord votre propre
licence. Quiconque soutient que du code généré par machine n'appartient à
personne soutient que ses propres conditions de publication ne sont pas
opposables, avant même d'aborder celles de l'amont.

## Question deux : est-ce dérivé ?

Celle-ci ne se soucie pas de savoir qui est l'auteur. La contrefaçon repose
sur l'accès à l'original plus une similarité substantielle avec son
**expression** protégée — la manière particulière dont la chose a été
écrite, pas ce qu'elle fait.

Nous avions accès. Le modèle a lu la source. Cette moitié n'est pas
contestée.

La moitié de la similarité est là où cela devient intéressant, et où le
changement de langage compte moins qu'on ne l'attend. Traduire un roman dans
une autre langue produit une œuvre dérivée ; c'est l'exemple manuel. Changer
de langage défait une accusation de copie littérale. Cela ne défait pas une
accusation portant sur la structure — l'ordre des transformations, la
décomposition en fonctions, la forme des tables de règles, la manière dont
les cas limites sont découpés.

Il vaut aussi la peine de le dire clairement : un outil ne blanchit rien. Si
vous dirigez une copie et livrez le résultat, c'est vous qui l'avez fait.
« Le modèle l'a écrit » n'est pas une défense, pas plus que « le compilateur
l'a émis » n'en serait une.

## L'argument le plus fort dans l'autre sens

Il existe un argument sérieux selon lequel une réimplémentation
inter-langages est parfaitement licite, et il mérite d'être exposé
correctement plutôt que balayé d'un geste.

Dans *SAS Institute v World Programming* (CJUE, C-406/10, 2 mai 2012), la
Cour a jugé que « ni la fonctionnalité d'un programme d'ordinateur, ni le
langage de programmation, ni le format des fichiers de données utilisés
dans le cadre d'un programme d'ordinateur pour exploiter certaines de ses
fonctions ne constituent une forme d'expression de ce programme ». Ils ne
sont donc pas protégés par le droit d'auteur. La directive Logiciels
(2009/24/CE, article 1(2)) dit la même chose des idées et principes qui sont
à la base de tout élément d'un programme. La Cour a également jugé qu'un
licencié peut étudier et observer le comportement d'un programme pour en
déterminer les idées sous-jacentes, et les réimplémenter.

Ce n'est pas une technicité. Cela signifie que ce qu'un phonémiseur *fait* —
cette séquence de graphèmes, dans ce contexte, devient tel phonème — n'est
possédé par personne. Les règles d'accentuation galiciennes sont des faits
sur le galicien. La sémantique directe OWL 2 est une spécification W3C
publiée. Sous cette lecture, une réimplémentation qui reproduit un
comportement et non une expression est licite, et une réécriture d'un
langage à un autre se situe bien plus loin de la contrefaçon qu'un
copier-coller.

L'écart entre cet argument et notre situation, c'est la source. *SAS*
concerne l'étude d'un comportement. Notre modèle a lu le code.

## Le précédent qui existe déjà, et jusqu'où il porte

L'argument « la sortie machine n'a pas d'auteur, donc aucun droit d'auteur
ne s'y attache » n'est pas une expérience de pensée. Il est structurant en
production, à l'échelle de l'industrie. La distillation de modèles et les
données d'entraînement synthétiques reposent toutes deux dessus.

L'énoncé public le plus clair en est
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), un modèle TTS
ouvert largement utilisé. Sa fiche indique qu'il a été entraîné
exclusivement sur de l'audio permissif ou non protégé par le droit d'auteur,
et cite parmi les sources permises :

> Synthetic audio generated by closed TTS models from large providers

avec une note de bas de page renvoyant vers les
[recommandations de politique IA](https://copyright.gov/ai/ai_policy_guidance.pdf)
du Copyright Office américain. La chaîne de raisonnement est celle
ci-dessus : l'audio a été généré par une machine, la sortie machine n'a pas
d'auteur humain, donc aucun droit d'auteur n'y subsiste, donc il n'y a rien
à contrefaire en entraînant dessus. Le modèle est publié sous Apache-2.0. La
fiche trace aussi une frontière — elle exclut l'audio synthétique issu de
modèles TTS *ouverts* et des clones de voix personnalisés — signe que les
auteurs ont déterminé où l'argument s'arrête plutôt que de l'appliquer à
tout.

Voici la partie qui compte pour le portage. **Ce précédent résout l'autre
moitié du problème.**

L'argument de Kokoro porte sur l'**entrée**. Ce qu'ils ont consommé était
lui-même généré par machine, donc l'affirmation est qu'il ne portait aucun
droit d'auteur au départ. Non protégeable en entrée, donc rien à hériter.

Notre situation est l'image en miroir. Ce que nous avons consommé — le C
d'espeak-ng, le C++ de Cotovia, le Java de HermiT — est sans ambiguïté écrit
par des humains et protégé par le droit d'auteur, par des personnes
nommées, dans des universités nommées, il y a des décennies. Ce qui en est
*sorti* a été écrit par une machine. L'argument « pas de droit d'auteur sur
la sortie IA » retombe sur notre sortie, pas sur notre entrée. Il ne remonte
pas en amont. C'est, encore une fois, l'argument qui sape notre propre
licence tout en laissant les droits de l'amont totalement intacts.

Il y a une asymétrie supplémentaire à noter. L'exposition résiduelle de
Kokoro n'est pas vraiment une question de droit d'auteur — c'est du
**contrat**. Les conditions d'utilisation des fournisseurs fermés
interdisent généralement d'utiliser leur sortie pour entraîner des modèles
concurrents, et une condition à laquelle vous avez adhéré ne s'évapore pas
parce que la sortie s'est avérée non protégeable. Le copyleft ne fonctionne
pas ainsi. Personne ne clique « J'accepte » pour la GPL. C'est une
concession unilatérale de permission, et elle ne vous lie que si vous avez
besoin de cette permission — c'est-à-dire seulement si ce que vous avez fait
est une œuvre dérivée.

Tout retombe donc sur la seule question à laquelle personne n'a répondu. Si
une réimplémentation inter-langages écrite par une machine n'est pas une
œuvre dérivée, la GPL n'a jamais été engagée et rien ne s'y appliquait. Si
c'en est une, la GPL s'appliquait dès la première ligne. Il n'y a pas de
troisième état, et aucune quantité d'arguments sur l'auctorialité IA ne
déplace cette aiguille en particulier.

## Salles blanches, et deux modèles font-ils une salle blanche

La réponse classique à exactement ce problème est le protocole de la salle
blanche (*clean room*), et il vaut la peine de le décrire précisément parce
que sa forme compte.

Une équipe lit l'original et écrit une spécification fonctionnelle : ce que
fait le programme, en termes comportementaux. Une seconde équipe, qui n'a
jamais vu l'original, implémente uniquement à partir de cette spécification.
La sortie de la seconde équipe n'est démontrablement pas copiée d'une
expression qu'elle n'a jamais vue. C'est ainsi que le BIOS du PC a été
réimplémenté, et c'est pourquoi cette réimplémentation a survécu.

Le geste moderne évident est de faire tourner un modèle pour lire et
décrire, et un modèle différent, avec un contexte neuf, pour implémenter.
Structurellement, c'est le même protocole. Est-ce une salle blanche ?

Cela en a la bonne forme. Mais une salle blanche n'est pas une construction
technique — c'est une construction **probatoire**. Toute sa valeur consiste
à pouvoir démontrer la séparation après coup, à quelqu'un qui suppose que
vous avez triché. La version à deux modèles ne signifie donc quelque chose
que si la discipline tient jusqu'au bout :

- Les deux côtés ne partagent réellement jamais de contexte. Pas « on lui a
  dit d'oublier » — des exécutions séparées, des transcriptions séparées.
- La spécification porte le comportement et rien d'autre. Pas de
  pseudo-code qui reflète le flux de contrôle de l'original. Pas de noms
  d'identifiants. Pas d'ordre des fonctions. Ce sont de l'expression, et une
  spécification pleine de cela est l'original déguisé.
- Les enregistrements des deux côtés sont conservés, car une salle blanche
  que vous ne pouvez pas prouver est une histoire.

Si le côté lecture émet de la structure, la contamination passe tout droit
et vous avez une œuvre dérivée avec des étapes supplémentaires et une
facture de tokens plus élevée.

Nous n'avons pas fait cela. Le modèle qui implémentait a lu la source
directement. C'est pourquoi le README de pycotovia dit, dans le dépôt,
publiquement :

> Because the implementing AI **read the GPL source**, this is **not a
> clean-room reimplementation** and we make no such claim. It is a
> source-derived port.

Nous préférons avoir écrit cette phrase plutôt que d'avoir à y répondre plus
tard.

## Ce que nous avons fait

Nous avons conservé les licences amont.

[espyak](https://github.com/TigreGotico/espyak) est GPL-3.0-or-later,
correspondant à espeak-ng. Ce n'est même pas un cas difficile : le paquet
embarque verbatim les propres fichiers de données d'espeak-ng —
`dictsource`, `phsource`, `lang` — et aucune théorie de l'auctorialité ne
touche des fichiers que nous avons copiés sans modification. Les données de
l'amont sont dans la wheel, donc la licence de l'amont vient avec.

[pycotovia](https://github.com/TigreGotico/pycotovia) est GPL-3.0,
correspondant à Cotovia (GPL-3.0+).
[ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) et
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
sont GPL-3.0, correspondant à AhoTTS, dont le fichier de licence indique
GPL-3.0+ pour le traitement linguistique.
[pyeye](https://github.com/TigreGotico/pyeye) est MIT, correspondant à EYE.
Copyleft en entrée, copyleft en sortie ; permissif en entrée, permissif en
sortie.

Nous n'avons pas fait cela parce que nous avons établi que c'était requis.
Nous l'avons fait parce que l'asymétrie a pris la décision sans avoir besoin
de la réponse.

Nous publions en open source de toute façon. Le copyleft ne nous coûte
presque rien — le seul coût réel est le cas où un client veut le code à
l'intérieur de quelque chose de propriétaire, et pour ces bibliothèques
spécifiques ce cas est rare. Donc être copyleft alors que ce n'était pas
strictement nécessaire coûte approximativement zéro.

L'autre erreur n'est pas symétrique. Publier sous licence permissive
quelque chose qui aurait dû être copyleft est un problème découvert
tardivement, publiquement, par quelqu'un d'autre, après que d'autres
personnes ont construit dessus sous des conditions que vous n'étiez pas en
droit d'offrir. Défaire cela signifie contacter chaque utilisateur en aval.

Cette asymétrie est aussi pourquoi il vaut la peine de guetter ce
décalage en général. Un portage structurel d'un original LGPL ne peut pas
simplement devenir Apache-2.0 en étant réécrit dans un autre langage — et
c'est exactement le genre de décalage facile à créer et difficile à
remarquer, parce que rien ne se plaint. Le build passe. Les tests passent.
L'en-tête de licence n'est qu'un fichier. HermiT est LGPL, donc la licence
de notre portage Python de celui-ci fait partie des cas que nous
réexaminons — ce qui est le résultat banal et correct : vous vérifiez, et
vous corrigez ce qui doit l'être.

Sous une asymétrie aussi déséquilibrée, vous n'avez pas besoin de résoudre
la question juridique pour prendre la décision. Vous prenez simplement la
branche où se tromper est supportable.

## La même question, dans l'autre sens

Tout ce qui précède concerne le code que nous produisons. La même logique
identique s'applique au code que nous recevons. Quelqu'un ouvre une pull
request contre l'un de nos dépôts. Le patch a été écrit par un modèle. Que
nous concèdent-ils ?

La plupart des projets gèrent cela avec le
[Developer Certificate of Origin](https://developercertificate.org/) — le
DCO, la ligne `Signed-off-by:` en bas d'un message de commit. C'est une
brève déclaration à laquelle le contributeur atteste en signant : qu'il a
créé la contribution lui-même, ou qu'elle provient d'une source sous
licence compatible et qu'il a le droit de la soumettre sous les termes du
projet. C'est délibérément léger. Pas d'avocats, pas de paperasse, une
ligne par commit. C'est ainsi que le noyau Linux et QEMU, parmi beaucoup
d'autres, établissent d'où vient leur code.

Pour un patch écrit par une machine, aucun des deux volets n'est
franchement vrai. Et la fourche se résout de la même manière quelle que
soit la branche empruntée.

Si la sortie générée par machine ne porte aucun droit d'auteur, le
contributeur ne détient aucun droit dessus. Il n'y a rien à vous concéder
sous licence.

Si au contraire elle est traitée comme dérivée de ses données
d'entraînement, les droits — quels qu'ils soient — appartiennent à quiconque
a écrit ces données. Le contributeur ne détient toujours rien, et n'a
toujours rien à vous concéder.

Dans les deux cas, ils ne peuvent pas concéder ce qu'ils ne détiennent pas.
La signature n'est pas malhonnête. Le contributeur a signé de bonne foi et
a fait le travail. C'est simplement vide : un transfert de quelque chose qui
n'a jamais été le sien à transférer.

La conséquence pratique est moins alarmante que cela n'y paraît, et les
deux branches diffèrent nettement.

Sur la première branche, vous n'avez besoin d'aucune concession du tout. Un
matériau que personne ne possède peut être utilisé par n'importe qui.
Accepter le patch ne pose aucun problème et rien de fâcheux ne se produit.
Ce qui change discrètement, c'est l'autre direction : le copyleft est bâti
sur le droit d'auteur, et il ne peut pas s'attacher à un matériau qui n'en
porte aucun. Un projet GPL qui accumule des patchs écrits par machine
accumule des parties que sa propre licence pourrait ne pas atteindre. La
licence continue de régir l'œuvre telle que distribuée. Le noyau opposable
en son sein s'amincit, lentement, sans que personne ne s'en aperçoive.

La seconde branche a des dents. Si un modèle reproduit verbatim des données
d'entraînement mémorisées — ce qui arrive, davantage avec des idiomes
courants et des implémentations bien connues qu'avec une logique inédite —
alors vous avez accepté le code protégé de quelqu'un d'autre, sur
l'assurance d'un contributeur qui n'avait aucun moyen de le vérifier. Toute
la valeur du DCO tient à ce que la personne qui signe était en position de
savoir. Ici, elle ne l'est pas.

Debian travaille cette question en ce moment. Une
[résolution générale sur l'usage des LLM](https://www.debian.org/vote/2026/vote_002)
est entrée en période de discussion le 23 juillet 2026 avec cinq
propositions au scrutin. Elles couvrent tout l'éventail : la Proposition A
modifierait le Contrat social pour interdire purement et simplement les
contributions assistées par LLM aux paquets, à la documentation et aux
ressources web ; la Proposition C demande aux contributeurs d'éviter les
LLM autant que possible, exige une rédaction strictement humaine pour les
communications du projet, et laisse les mainteneurs individuels imposer
leurs propres interdictions ; les Propositions B, D et E autorisent le
travail assisté par IA sous conditions, fondées diversement sur la
vérification des licences, la responsabilisation des contributeurs, la
divulgation, et des restrictions sur l'envoi de matériel confidentiel à des
services cloud. Au moment d'écrire, c'est en discussion et rien n'est
décidé.

C'est la deuxième fois. Une
[tentative antérieure en 2024](https://lwn.net/Articles/972331/) s'est
terminée sans résolution, et le raisonnement pour s'arrêter vaut d'être
retenu : l'objection à agir n'était pas que la préoccupation était sans
fondement, mais qu'une règle que personne ne peut faire respecter ne vaut
pas la peine d'être adoptée. On ne peut pas regarder un diff et le dire.

Ce n'est pas une inquiétude marginale. Elle frappe le plus durement
exactement les projets à la provenance la plus soignée, parce que le modèle
entier d'un projet fondé sur le DCO, quant à l'origine de son code, repose
sur cette seule attestation.

Nous n'avons pas résolu comment nous allons gérer cela, et nous sommes mal
placés pour être stricts. Nous publions des ports écrits par un modèle. Un
projet qui publie du code écrit par machine et refuse les contributions
écrites par machine tient deux positions incompatibles à la fois, et nous
préférons ne pas le faire. Les options honnêtes sont les mêmes que celles
que Debian pèse — divulgation, responsabilisation des contributeurs, ou une
règle que personne ne peut vérifier — et nous n'en avons choisi aucune.

## L'autre axe le long duquel court l'argument

Le débat de Debian porte sur la provenance et la licence. Ce n'est pas le
seul axe, et le second n'a rien à voir avec le droit d'auteur.

Codeberg, la forge FLOSS, a adopté deux motions approuvées par ses membres
en juillet 2026 et
[a exposé son raisonnement](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
en des termes qui touchent à peine aux licences. Les objections portent sur
les coûts et l'effort : une consommation d'énergie et de matériel poussée
sur tout le monde ; un trafic de robots d'exploration qui pousse les
petites forges vers des défenses qui gênent aussi les utilisateurs
ordinaires ; des projets à usage unique « codés à l'instinct » (*vibe-coded*)
publiés et jamais maintenus ; et la charge sur les personnes qui relisent :

> Maintainers are under an increased work-load due to people submitting
> (often well-meaning) low-effort, LLM-generated contributions that require
> substantial amounts of time to review.

Leurs Conditions d'utilisation découragent désormais de tels projets,
appliquées au cas par cas par des modérateurs plutôt que par une
suppression massive.

Il y a donc deux questions indépendantes en circulation, et un projet peut
se situer n'importe où sur la grille : si le code écrit par machine peut
seulement être mis sous licence, et si l'écosystème peut absorber le
volume. Debian vote sur la première et n'a pas conclu. Codeberg a agi sur la
seconde. Aucun résultat ne règle l'autre, et les réponses qu'un projet donne
à chacune sont largement décorrélées.

## La partie que nous n'allons pas prétendre réglée

Nous n'avions peut-être pas besoin de faire tout cela.

Considérez les trois arguments ensemble. La fonctionnalité n'est pas
protégée — la CJUE l'a dit directement. Une sortie purement générée par
machine peut n'avoir aucun auteur humain, donc il se peut qu'il n'y ait
aucun nouveau droit d'auteur dont s'inquiéter et, maladroitement, aucun qui
soit le nôtre non plus. Et un protocole à deux modèles exécuté avec une
vraie discipline pourrait être une authentique salle blanche, auquel cas le
portage n'a jamais touché d'expression protégée du tout.

Si les trois tiennent, certains de ces ports auraient pu être mis sous
licence permissive en toute bonne conscience. Si aucun ne tient, notre choix
prudent était simplement correct. Nous ne savons pas lequel, et nous ne
l'avons pas testé. Nous ne tenons pas à être le cas qui tranche la
question.

La question ne disparaît pas parce qu'on l'ignore. Ce genre de portage
devient ordinaire — c'est bon marché maintenant, et il y a une grande
quantité de C non maintenu qui mérite d'être déplacé quelque part où il
pourra l'être. Chacun de ces ports fera face aux deux mêmes questions, et
la plupart y répondront en ne les posant pas. Comme le fera tout projet qui
fusionne un patch qu'il n'a pas écrit, c'est-à-dire tous. Les questions
arrivent que vous écriviez le code ou que vous vous contentiez de
l'accepter.

---
title: "Usenet & remailers en 2026 : une capsule temporelle intacte et un réseau de confidentialité qui refuse de mourir"
description: "Usenet est une archive intacte du discours humain d'avant l'IA — des données d'entraînement sans LLM, issues de décennies d'histoire d'Internet. Mais ce n'est pas que de l'archéologie : le réseau de remailers cypherpunk fonctionne encore en 2026 et offre une véritable messagerie anonyme. Nous avons construit deux petits outils pour vous montrer les deux."
date: 2026-07-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

La plupart des corpus du web ouvert sont contaminés — du texte généré par des LLM s'est infiltré dans Reddit, Stack Overflow, GitHub, les blogs. Usenet est différent : des décennies de guerres de flammes, de questions-réponses techniques et de disputes de newsgroups, le tout écrit par des humains, sans aucune trace de modèles de langage. Et en fouillant dedans, j'ai trouvé autre chose qui tourne encore : **le réseau de remailers cypherpunk fonctionne toujours en 2026**, entretenu par un petit groupe de passionnés de cryptographie qui n'ont jamais arrêté.

Nous avons construit deux petits outils Python pour les deux.

-----

## La capsule temporelle : Usenet comme corpus d'avant l'IA

Usenet reçoit des milliers de messages par jour à travers des centaines de groupes actifs. En remontant aux années 1980, vous obtenez des **millions d'articles** — chacun un signal de ce qui intéressait réellement les humains, de ce dont ils débattaient, de ce qu'ils voulaient savoir — avec une provenance suffisamment propre pour être citée.

Nous avons construit un outil appelé **usenet** qui rend cette collecte simple :

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

La plupart des serveurs publics ne prennent plus en charge `NEWNEWS` (interrogation par date), donc **la navigation par groupe est l'approche standard.** Vous récupérez un groupe à la fois — ce n'est pas un obstacle, juste la réalité du protocole.

Pour transformer un newsgroup en jeu de données d'entraînement, `dataset.py` collecte les articles au format JSONL :

```
{
  "group": "comp.lang.python",
  "message_id": "<12345@example.com>",
  "subject": "Best practices for list comprehensions",
  "author": "Alice",
  "date": "1999-03-15T10:22:00Z",
  "language": "en",
  "text": "In my experience, list comprehensions are most readable when...",
}
```

Un article par ligne. Poussez-en quelques milliers vers Hugging Face et vous avez un **jeu de données disponible publiquement, écrit par des humains et à la provenance propre** que vous pouvez citer et republier.

Dépôt : [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Les cypherpunks ne sont jamais partis

Le réseau de remailers fonctionne toujours.

**Les remailers de type I** (remailers Cypherpunk) : envoyez un message enveloppé dans un chiffrement PGP imbriqué — chaque saut déchiffre une couche et transmet à la suivante. De l'extérieur, le message semble provenir du remailer, pas de vous. Au dernier saut, l'expéditeur d'origine est perdu.

**Les remailers de type II** (Mixmaster) : ajoutent un rembourrage aléatoire, retirent les en-têtes, retiennent les messages avant de les transmettre et les enchaînent à travers plusieurs remailers simultanément. Bien plus difficiles à tracer.

Les deux fonctionnent encore. Il y a **environ une demi-douzaine de remailers actifs** en 2026. Le réseau de pingers publie des statistiques quotidiennes sur `alt.privacy.anon-server.stats`, comme il le fait depuis des décennies. En mai 2026 :

- **frannie** (mix@franxial.com) — 100 % de disponibilité
- **frell** (godot@remailer.frell.eu.org) — 100 % de disponibilité
- **yeahno** (mix@yeahno.net) — 100 % de disponibilité
- **dizum** (remailer@dizum.com) — ~99 % de disponibilité
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92 % de disponibilité

La bibliothèque **remailers** découvre le réseau actif en analysant ces messages de statistiques quotidiennes :

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Les utiliser aujourd'hui

### Lire Usenet sans compte

```python
from usenet import UsenetServer

servers = [
    "news.neodome.net",
    "news.samoylyk.net",
    "freenews.netfront.net"
]

for server in servers:
    try:
        with UsenetServer(server) as s:
            articles = s.get_articles("alt.test", limit=5)
            print(f"Success on {server}: {len(articles)} articles")
            break
    except OSError:
        continue
```

### Publier de manière anonyme

La plupart des serveurs exigent un compte gratuit pour publier. **paganini.bofh.team** et **news.tcpreset.net** acceptent les publications anonymes, y compris vers `alt.anonymous.messages` — la boîte de dépôt traditionnelle pour les destinataires anonymes.

### Envoyer un message anonyme via la chaîne de remailers

Les remailers utilisent encore des **clés PGP DSA + ElGamal** des années 1990 — de la cryptographie ancienne à laquelle les bibliothèques PGP modernes de Python ne peuvent pas chiffrer. Nous déléguons à **GnuPG** (l'ancien code est porteur) :

```python
from remailers.network import fetch_live_remailers, fetch_keyring_blob
from remailers.gpg import GPGKeyring
from remailers.cypherpunk import build_chain

remailers = fetch_live_remailers()

# the published keyring is full of DSA/ElGamal keys -> use the GnuPG backend
with GPGKeyring(fetch_keyring_blob()) as gpg:
    have = set(gpg.recipients())
    chain = [r for r in remailers
             if r.is_cpunk and r.accepts_pgp and r.address in have][:3]

    # nest a PGP layer per hop; the exit posts to a newsgroup
    message, entry = build_chain(
        hops=[(r.address, r.address) for r in chain],
        anon_post_to="alt.anonymous.messages",
        body="Hello from the shadows",
        encrypt=gpg.encrypt,
    )

# `message` goes to `entry` over SMTP (remailers.cypherpunk.send_chain) —
# the one piece you bring yourself: an email sender.
```

### Trouver les réponses : les sujets hachés

Si vous attendez une réponse sur `alt.anonymous.messages`, vous ne voulez pas que le sujet révèle le contenu. Le protocole des remailers prend en charge **hSub** : le destinataire hache le sujet d'origine avec SHA-256 et publie la réponse avec le hachage comme sujet. Seul quelqu'un qui connaît le sujet d'origine peut l'identifier dans le flot.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Pour davantage de confidentialité, certains messages utilisent **eSub** — des sujets chiffrés que seul le destinataire peut déchiffrer.

-----

## Pourquoi cela compte encore

Le réseau de remailers est lent et conçu pour une autre époque. Mais il est **décentralisé, sans propriétaire et impossible à fermer** — aucune entreprise à assigner en justice, aucun service à interrompre. La même conception cypherpunk qui fonctionnait en 1995 fonctionne encore.

Usenet est le prix le plus rare : une archive à la provenance propre de texte écrit par des humains, à grande échelle. Que vous entraîniez des modèles, construisiez des jeux de données ou étudiiez le véritable discours d'Internet, Usenet est là — propre, non corrompu, libre.

**Dépôts :**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Collectez Usenet en jeux de données d'entraînement ; lisez publiquement sans compte.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Trouvez des remailers actifs, construisez des chaînes anonymes, envoyez via Cypherpunk Type-I.

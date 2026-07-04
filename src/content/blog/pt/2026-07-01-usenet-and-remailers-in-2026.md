---
title: "Usenet & Remailers em 2026: uma cápsula do tempo imaculada e uma rede de privacidade que se recusa a morrer"
description: "A Usenet é um arquivo intacto do discurso humano pré-IA — dados de treino livres de LLM provenientes de décadas de história da internet. Mas não é só arqueologia: a rede de remailers cypherpunk ainda funciona em 2026, oferecendo mensagens verdadeiramente anónimas. Construímos duas pequenas ferramentas para lhe mostrar as duas coisas."
date: 2026-07-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Privacy"
  - "Remailers"
  - "Datasets"
  - "Cypherpunk"
draft: false
---

A maioria dos corpora da web aberta está contaminada — texto gerado por LLM infiltrou-se no Reddit, no Stack Overflow, no GitHub, nos blogs. A Usenet é diferente: décadas de flame wars, perguntas e respostas técnicas e discussões em newsgroups, tudo escrito por humanos, nada disso tocado por modelos de linguagem. E, enquanto escavava nela, encontrei outra coisa ainda a funcionar: **a rede de remailers cypherpunk continua a operar em 2026**, mantida por um pequeno grupo de entusiastas da criptografia que nunca desistiram.

Construímos duas pequenas ferramentas em Python para as duas coisas.

-----

## A Cápsula do Tempo: a Usenet como Corpus Pré-IA

A Usenet recebe milhares de publicações por dia em centenas de grupos ativos. Recue no arquivo até aos anos 80 e terá **milhões de artigos** — cada um um sinal do que os humanos realmente valorizavam, discutiam, queriam saber — com uma proveniência suficientemente limpa para citar.

Construímos uma ferramenta chamada **usenet** que torna esta recolha simples:

```python
from usenet import UsenetServer

# Connect to a public news server (no account required)
with UsenetServer("news.neodome.net") as server:
    articles = server.get_articles("comp.lang.python", limit=100)
    
    for article in articles:
        print(f"{article.subject} by {article.author}")
```

A maioria dos servidores públicos já não suporta `NEWNEWS` (consulta por data), pelo que **a navegação por grupo é a abordagem padrão.** Faz-se scraping de um grupo de cada vez — não é uma barreira, apenas a realidade do protocolo.

Para transformar um newsgroup num dataset de treino, o `dataset.py` recolhe artigos para JSONL:

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

Um artigo por linha. Envie alguns milhares desses para o Hugging Face e terá um **dataset disponível publicamente, escrito por humanos e com proveniência limpa** que pode citar e republicar.

Repositório: [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet)

-----

## Os Cypherpunks Nunca Se Foram

A rede de remailers continua a funcionar.

**Remailers de Tipo I** (remailers cypherpunk): enviam uma mensagem envolvida em cifragem PGP encaixada — cada salto decifra uma camada e reencaminha para o seguinte. Vista de fora, a mensagem parece vir do remailer, não de si. No salto final, o remetente original perdeu-se.

**Remailers de Tipo II** (Mixmaster): adicionam preenchimento aleatório, removem cabeçalhos, retêm as mensagens antes de as reencaminhar e encadeiam através de vários remailers em simultâneo. Muito mais difíceis de rastrear.

Ambos ainda funcionam. Há **cerca de meia dúzia de remailers ativos** em 2026. A rede de pingers publica estatísticas diárias em `alt.privacy.anon-server.stats`, tal como faz há décadas. Em maio de 2026:

- **frannie** (mix@franxial.com) — 100% de uptime
- **frell** (godot@remailer.frell.eu.org) — 100% de uptime
- **yeahno** (mix@yeahno.net) — 100% de uptime
- **dizum** (remailer@dizum.com) — ~99% de uptime
- **paranoia** (mixmaster@remailer.paranoici.org) — ~92% de uptime

A biblioteca **remailers** descobre a rede ativa fazendo o parsing dessas publicações de estatísticas diárias:

```python
from remailers.network import fetch_live_remailers

for r in fetch_live_remailers():
    print(f"{r.name} — {r.uptime} uptime, {r.address}")
    print("  capabilities:", sorted(r.capabilities))
```

-----

## Usá-los Hoje

### Ler a Usenet Sem Conta

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

### Publicar Anonimamente

A maioria dos servidores exige uma conta gratuita para publicar. O **paganini.bofh.team** e o **news.tcpreset.net** aceitam publicações anónimas, incluindo em `alt.anonymous.messages` — o ponto de entrega tradicional para destinatários anónimos.

### Enviar uma Mensagem Anónima pela Cadeia de Remailers

Os remailers ainda usam **chaves PGP DSA + ElGamal** dos anos 90 — criptografia antiga que as bibliotecas PGP modernas de Python não conseguem usar para cifrar. Recorremos ao **GnuPG** através da shell (o código antigo é essencial):

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

### Encontrar Respostas: Assuntos com Hash

Se estiver à espera de uma resposta em `alt.anonymous.messages`, não quer que o assunto revele o conteúdo. O protocolo dos remailers suporta o **hSub**: o destinatário faz o hash do assunto original com SHA-256 e publica a resposta com o hash como assunto. Só quem conhece o assunto original o consegue identificar no meio da torrente.

```python
from remailers import create_hsub, match_hsub

hsub = create_hsub("Secret plan for next week")   # SHA-256(IV + subject)

# post using hsub as Subject; later scan the group:
if match_hsub(hsub, "Secret plan for next week"):
    print("This message is for me!")
```

Para mais privacidade, algumas mensagens usam **eSub** — assuntos cifrados que só o destinatário consegue decifrar.

-----

## Porque É Que Isto Ainda Importa

A rede de remailers é lenta e foi concebida para outra era. Mas é **descentralizada, sem dono e impossível de encerrar** — não há empresa para intimar, não há serviço para descontinuar. O mesmo desenho cypherpunk que funcionava em 1995 ainda funciona.

A Usenet é o prémio mais raro: um arquivo de proveniência limpa de texto escrito por humanos, em escala. Quer esteja a treinar modelos, a construir datasets ou a estudar o verdadeiro discurso da internet, a Usenet está lá — limpa, incorrupta, livre.

**Repositórios:**

- [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — Recolha a Usenet para datasets de treino; leia publicamente sem conta.
- [**github.com/TigreGotico/remailers**](https://github.com/TigreGotico/remailers) — Encontre remailers ativos, construa cadeias anónimas, envie via Cypherpunk Tipo I.

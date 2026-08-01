---
title: "A Usenet em 2026: um corpus de texto limpo e pré-IA para treino e avaliação"
description: "A Usenet é um arquivo intacto do discurso humano pré-IA — décadas de publicações em newsgroups, tudo escrito por humanos, nada disso tocado por modelos de linguagem. Isso torna-a valiosa como dados de treino e avaliação para modelos de linguagem e de fala. Construímos uma pequena ferramenta em Python para a recolher."
date: 2026-07-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Usenet"
  - "Datasets"
  - "NLP"
draft: false
---

A maioria dos corpora de texto da web aberta está contaminada: texto gerado por LLM infiltrou-se no Reddit, no Stack Overflow, no GitHub e nos blogs, pelo que um modelo treinado com eles está em parte a aprender a partir de outros modelos. A Usenet é diferente. São décadas de flame wars, perguntas e respostas técnicas e discussões em newsgroups, tudo escrito por humanos, precedendo por completo os modelos de linguagem atuais. Para quem treina ou avalia modelos de linguagem e de fala, um grande arquivo de texto escrito por humanos com proveniência limpa é exatamente o tipo de dados que se está a tornar cada vez mais difícil de encontrar.

-----

## A Usenet como corpus pré-IA

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

## Ler a Usenet sem conta

A maioria dos servidores de notícias públicos permite ler sem registo:

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

-----

## Porque é que isto importa

A Usenet é um arquivo de proveniência limpa de texto escrito por humanos, em escala, anterior à era do conteúdo gerado por máquinas. Quer esteja a treinar modelos, a construir datasets ou a estudar o discurso da internet antes de ele ser diluído por texto gerado por IA, esse arquivo continua lá e continua a crescer.

**Repositório:** [**github.com/TigreGotico/usenet**](https://github.com/TigreGotico/usenet) — recolha a Usenet para datasets de treino; leia publicamente sem conta.

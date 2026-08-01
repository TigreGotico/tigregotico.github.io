---
title: "Um Dataset Multilingue de Tipos de Frase: Perguntas, Comandos, Afirmações"
description: "Publicámos o sentence-types-multilingual — quase 70.000 frases em sete línguas, classificadas por tipo gramatical (pergunta, comando, afirmação, exclamação). É o corpus de treino por detrás da biblioteca de encaminhamento little_questions."
date: 2026-04-01
updated: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Multilingual"
  - "NLP"
  - "Intent"
  - "Classification"
  - "FOSS"
draft: false
---

A lógica de encaminhamento de um assistente de voz depende de saber que tipo de frase recebeu antes de tentar responder seja ao que for. Uma pergunta precisa de uma resposta. Um comando precisa de ser executado. Uma afirmação poderá precisar de reconhecimento ou de armazenamento. Acertar nessa classificação, em qualquer língua que o utilizador fale, é o pré-requisito para tudo o resto.

O **[sentence-types-multilingual](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual)** é o corpus de treino por detrás dessa camada — 69.300 frases anotadas, 9.900 para cada uma de sete línguas: inglês, espanhol, francês, alemão, italiano, português e neerlandês.

## O que as etiquetas significam na prática

O dataset usa um conjunto plano de seis etiquetas — uma coluna `label` por linha, sem divisão tipo/subtipo — que mapeiam diretamente para a forma como o `little_questions` (a biblioteca de inferência que consome estes dados) encaminha os enunciados:

- **wh_question** — perguntas construídas à volta de uma palavra interrogativa (o quê, onde, quem, e assim por diante).
- **polar_question** — perguntas de sim/não. A taxonomia EAT dentro do `little_questions` acrescenta 53 etiquetas granulares de tipo de resposta (pessoa, localização, quantidade, definição, e assim por diante) por cima das etiquetas de pergunta, mas a classificação do tipo de frase é o primeiro portão.
- **command** — formas imperativas. Os comandos não esperam uma resposta; esperam uma ação.
- **request** — pedidos de ação corteses ou indiretos, distintos de um imperativo puro.
- **statement** — declarativa. As afirmações num contexto de diálogo carregam muitas vezes uma polaridade que importa a jusante: um classificador de sim/não/talvez é executado sobre as afirmações para interpretar respostas a perguntas anteriores.
- **exclamation** — enunciados marcados emocionalmente que precisam de um tratamento diferente do das declarativas neutras.

```json
{
  "language": "en",
  "label": "wh_question",
  "text": "What time is it?"
}
```

## Porque é que a cobertura interlinguística não é trivial

A mesma intenção comunicativa manifesta-se de forma diferente em gramáticas diferentes:

- O inglês marca as perguntas com inversão da ordem das palavras; o português e o espanhol marcam-nas muitas vezes apenas com pontuação e entoação, deixando a ordem das palavras intacta.
- O alemão separa os verbos para a posição final da frase de formas que deslocam o sítio onde reside o sinal classificador.
- As línguas românicas usam morfologia imperativa dedicada para os comandos que o inglês exprime com o verbo na sua forma nua.

Um modelo treinado apenas em inglês erra estes casos em todo o lado. Dados paralelos e anotados nas sete línguas fornecem o sinal interlinguístico de que os classificadores por língua precisam — e a mesma pipeline de geração estende-se a mais línguas à medida que vão sendo adicionadas.

## A stack a jusante

Os modelos treinados com estes dados são distribuídos dentro do **[little_questions](https://github.com/TigreGotico/little_questions)** — uma biblioteca offline sem dependências (numpy + onnxruntime) com classificadores ONNX por língua para o tipo de frase e um modelo de polaridade sim/não para 43 línguas. Os modelos são incluídos na própria wheel para o inglês e descarregados de forma lazy para as outras línguas. Os classificadores de tipo de frase são publicados como `TigreGotico/sentence-types` no HuggingFace; os classificadores de tipo de resposta EAT são treinados internamente e não são publicados.

```python
from little_questions import Sentence

s = Sentence("What time is it?")
print(s.sentence_type)     # "question"
print(s.classification)    # e.g. "NUM:date"
```

O `little_questions` é a camada de encaminhamento de linguagem natural para o OVOS e o LILACS: classificar se um enunciado é uma pergunta, um comando ou uma afirmação é a primeira decisão de despacho que uma pipeline de voz toma.

[**sentence-types-multilingual no HuggingFace**](https://huggingface.co/datasets/TigreGotico/sentence-types-multilingual) · [**little_questions no GitHub**](https://github.com/TigreGotico/little_questions)

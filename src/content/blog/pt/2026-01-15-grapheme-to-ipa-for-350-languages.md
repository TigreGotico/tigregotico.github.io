---
title: "Grafema-para-IPA para mais de 350 Línguas"
description: "O orthography2ipa é um recurso de dados puros, linguisticamente fundamentado, que mapeia a grafia para IPA e modela como os fonemas se realizam enquanto alofones em mais de 350 códigos de língua e mais de 20 famílias linguísticas. Um tokenizador maximal-munch, métricas de distância fonológica e de escrita, linhagem dialetal e um conjunto de especificações validado por esquema — sem pesos treinados, totalmente auto-hospedável."
date: 2026-01-15
lang: pt
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "ASR"
  - "Linguistics"
  - "FOSS"
draft: false
---

O **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** é um pacote Python de dados puros — JSON declarativo, lógica fina e plugável, sem pesos treinados — que mapeia a grafia para IPA e modela como esses fonemas se realizam em contexto ao longo de **394 especificações de língua e mais de 20 famílias linguísticas**. Instale-o, leia os dados, faça fork dos dados. Nada está escondido num checkpoint.

Alimenta tudo o que vem a jusante: as stacks específicas do português [silabificador](https://github.com/TigreGotico/silabificador) e [TugaPhone](https://github.com/TigreGotico/tugaphone) (ver **[NLP clássico para sílabas e fonemas do português](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), o G2P do barranquenho e o alicerce fonémico do **[TTS que corre numa batata](/pt/blog/2026-05-10-tts-that-runs-on-a-potato)**.

## Dois mapas, não um

A distinção crítica: um **mapa de grafemas** diz-lhe que fonemas uma grafia *pode* representar. Um **mapa de alofones** diz-lhe como um fonema *se realiza* em contexto. Confundir os dois é o modo de falha mais comum nos sistemas de G2P.

```python
import orthography2ipa
en = orthography2ipa.get("en-GB")

en.graphemes["th"]   # ['θ', 'ð']   — one spelling, two possible phonemes
en.allophones["t"]   # ['t', 'tʰ', 'ʔ', 'ɾ']  — one phoneme, four realisations
```

O ⟨th⟩ inglês é genuinamente ambíguo entre /θ/ e /ð/ — isso é um facto de grafia-para-fonema. O /t/ inglês surge como uma oclusiva simples, uma oclusiva aspirada, uma oclusiva glotal ou um flap, dependendo de onde cai — isso é um facto de fonema-para-realização. Manter os dois separados significa que se pode ir de *texto → candidatos a fonema* para a transcrição e de *fonema → realização de superfície* para a modelação da pronúncia, sem que um corrompa o outro. Para o TTS, é a diferença entre um sotaque credível e um robótico; para o ASR, é a diferença entre um léxico que corresponde ao que as pessoas realmente dizem e um que corresponde ao dicionário.

## O que cada língua transporta

Cada língua é uma dataclass `LanguageSpec` congelada, e transporta muito mais do que uma lista de fonemas: grafemas (incluindo dígrafos e trígrafos), um mapa de alofones, **grafemas posicionais** para substituições sensíveis ao contexto (início de palavra, intervocálico, antes de /i/), **ascendência** ponderada com múltiplos antepassados, **regras de sândi** entre palavras, um **inventário tonal** opcional e a proveniência — um `QualityTier` que percorre `stub → skeleton → research → production`, um `ScriptType` (alfabeto, abjad, abugida, …) e fontes bibliográficas.

A regra de inclusão é estrita e vale a pena afirmá-la sem rodeios: **só os mapeamentos fundamentados na ortografia oficial e na gramática documentada entram. As regras arbitrárias de substrings são excluídas.** O ⟨lh⟩ português, o ⟨sch⟩ alemão e o ⟨th⟩ inglês estão lá porque são unidades ortográficas padrão. Heurísticas convenientes-mas-inventadas não estão. Quando uma especificação declara grafemas mas nenhum mapa de alofones explícito, deriva-se um mapa de identidade de base — cada fonema é, no mínimo, a sua própria realização de superfície — para que nada desapareça silenciosamente.

As variedades regionais têm as suas próprias especificações, em vez de uma flag num progenitor. O português brasileiro e o europeu divergem sistematicamente, pelo que são objetos `LanguageSpec` distintos, ligados por ascendência:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

As árvores de dialetos mantêm-se sustentáveis porque os ficheiros JSON suportam herança `graphemes_base` / `allophones_base`: uma variante declara apenas o que difere do seu progenitor. A linhagem é ponderada e com múltiplos antepassados — progenitor, substrato, superestrato, adstrato — que é a forma honesta de modelar línguas que são produtos de contacto e não descendentes puros.

## Um tokenizador que admite a ambiguidade

A grafia não é um problema de segmentação limpo, por isso o pacote traz o `PhonetokTokenizer`, um tokenizador de grafemas **maximal-munch** com expansão de IPA por beam-search. Prefere de forma gananciosa a unidade ortográfica correspondente mais longa e depois explora transcrições candidatas ordenadas quando uma grafia é ambígua:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

Em vez de apostar num único resultado, obtém-se um beam pontuado — exatamente o input que um léxico, uma lattice ou um reranker de pronúncia a jusante quer.

## Medir a distância entre línguas

Como os dados são estruturados em vez de cozidos em pesos, pode-se comparar línguas diretamente. As métricas de distância abrangem as dimensões de inventário, grafema, alofone e ascendência, além de uma família de distância de escrita separada:

```python
from orthography2ipa.distance import phonological_distance
d = phonological_distance(orthography2ipa.get("pt-BR"), orthography2ipa.get("pt-PT"))

d.combined                    # 0.04 — near-identical
d.inventory.feature_mean      # phoneme-inventory distance
d.grapheme.mean_ipa_distance  # grapheme-mapping divergence
d.allophone_sim               # allophone-overlap similarity
```

Os vetores de características também são expostos, pelo que um par quase idêntico como os dois padrões portugueses fica em 0,04, enquanto pares genuinamente distantes se separam de forma nítida. Isto é útil tanto para decisões de transfer learning, como para bootstrapping de línguas de poucos recursos e para dialetometria.

## A CLI

Tudo o que está acima é acessível sem escrever Python. O script de consola `orthography2ipa` traz `list`, `info`, `transcribe` e `distance`, e cada subcomando aceita `--json` para encaminhar para uma pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Porque é que os dados puros importam

Todo o conjunto de especificações é validado por esquema — dataclasses congeladas ao estilo pydantic, **394 especificações** varridas por uma suite de testes de integridade, com o `SCHEMA.md` a documentar a forma. Onde uma tabela estática genuinamente não consegue exprimir as regras, lógica específica da língua encaixa em torno dos dados: os silabadores registam-se através de um grupo de entry-points, e o G2P algorítmico mais pesado (como o nosso tokenizador de árabe [arbtok](https://github.com/TigreGotico/arbtok), que lida com a assimilação das letras solares, a elisão da hamzat al-wasl e as formas de tanwin) assenta nas mesmas especificações a jusante.

Não há um modelo opaco a decidir como soam as línguas dos seus utilizadores. Os mapeamentos são auditáveis, as fontes são citadas e adicionar uma língua é escrever um único ficheiro JSON validado. Para quem constrói TTS, ASR ou NLP fonético e se recusa a terceirizar a sua fonologia para uma caixa negra — e que a quer a correr no seu próprio hardware — é este o ponto. É Apache 2.0, e é seu para inspecionar, estender e auto-hospedar.

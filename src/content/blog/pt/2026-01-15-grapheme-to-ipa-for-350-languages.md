---
title: "Grafema-para-IPA para 676 Línguas"
description: "O orthography2ipa é um recurso de dados puros, linguisticamente fundamentado, que mapeia a grafia para IPA e modela como os fonemas se realizam enquanto alofones ao longo de ~750 especificações de língua, 676 línguas e mais de 20 famílias linguísticas. Uma lattice de candidatos, linhagem dialetal e um conjunto de especificações validado por esquema e citado à literatura dialetológica — sem pesos treinados, totalmente auto-hospedável."
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

O **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)** é um pacote Python de dados puros — JSON declarativo, lógica fina e plugável, sem pesos treinados — que mapeia a grafia para IPA e modela como esses fonemas se realizam em contexto. Traz **~750 especificações de língua que cobrem 676 línguas** (mais 73 nós de clado apenas para classificação) ao longo de **mais de 20 famílias linguísticas**. Instale-o, leia os dados, faça fork dos dados. Nada está escondido num checkpoint.

É a camada de fonologia por baixo de tudo o que vem a jusante: a lattice de candidatos que produz é consumida pelo frontend de TTS árabe [arbtok](https://github.com/TigreGotico/arbtok), pelas stacks portuguesas [TugaPhone](https://github.com/TigreGotico/tugaphone) e [silabificador](https://github.com/TigreGotico/silabificador) (ver **[NLP clássico para sílabas e fonemas do português](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**), pelo [phonemizer do barranquenho](/pt/blog/2025-12-12-barranquenho), pelo phonemizer do mirandês, e pela fundamentação fonémica do **[TTS que corre numa batata](/pt/blog/2026-05-10-tts-that-runs-on-a-potato)**.

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

Cada língua é uma dataclass `LanguageSpec` congelada, e transporta muito mais do que uma lista de fonemas: grafemas (incluindo dígrafos e trígrafos), um mapa de alofones, **grafemas posicionais** para substituições sensíveis ao contexto (início de palavra, intervocálico, antes de /i/), **ascendência** ponderada com múltiplos antepassados, **regras de sândi** entre palavras, um **inventário tonal** opcional e a proveniência — um `QualityTier` que percorre `stub → skeleton → research → production`, um `ScriptType` (alfabeto, abjad, abugida, …) e fontes bibliográficas com fixação de página.

A regra de inclusão é estrita e vale a pena afirmá-la sem rodeios: **só os mapeamentos fundamentados na ortografia oficial e na gramática documentada entram. As regras arbitrárias de substrings são excluídas.** O ⟨lh⟩ português, o ⟨sch⟩ alemão e o ⟨th⟩ inglês estão lá porque são unidades ortográficas padrão. Heurísticas convenientes-mas-inventadas não estão. Quando uma especificação declara grafemas mas nenhum mapa de alofones explícito, deriva-se um mapa de identidade de base — cada fonema é, no mínimo, a sua própria realização de superfície — para que nada desapareça silenciosamente.

As variedades regionais têm as suas próprias especificações, em vez de uma flag num progenitor. O português brasileiro e o europeu divergem sistematicamente, pelo que são objetos `LanguageSpec` distintos, ligados por ascendência:

```python
pt_br = orthography2ipa.get("pt-BR")
pt_br.graphemes["t"]   # ['t', 't͡ʃ']  — palatalisation before /i/
```

As árvores de dialetos mantêm-se sustentáveis porque os ficheiros JSON suportam herança `graphemes_base` / `allophones_base`: uma variante declara apenas o que difere do seu progenitor. A linhagem é ponderada e com múltiplos antepassados — progenitor, substrato, superestrato, adstrato — que é a forma honesta de modelar línguas que são produtos de contacto e não descendentes puros.

## Profundo no terreno, não apenas amplo

O número 676 é a amplitude; a profundidade é onde está o trabalho. As especificações vão lecto a lecto onde a literatura dialetológica o faz, e cada uma é citada a essa literatura com fixação de página, em vez de ser inferida por correspondência de padrões a partir de uma tabela de fonemas.

A cobertura **ibérica** é o exemplo mais claro: **mais de 100 especificações** para as línguas da península. Todas as línguas românicas de Espanha — castelhano, catalão/valenciano, galego (tanto a norma da RAG como a reintegracionista), asturiano, aragonês e as suas variedades de vale (ansotano, chistabín, benasqués…), estremenho — a par do basco, dos crioulos ibero-românicos e das camadas históricas que a maioria dos recursos ignora por completo: o **árabe andalusi** e o **moçárabe**. O lado árabe transporta **34 lectos dialetais** (do najdi e do hijazi ao levantino, ao magrebino e às variedades peninsulares), e o lado lusófono **46 lectos do português e das línguas de Portugal**, até ao rionorês, ao guadramilês e aos subdialetos do mirandês.

Tanto quanto sabemos, vários destes são a **primeira fonologia legível por máquina** alguma vez publicada para a variedade — o rionorês, o guadramilês, o benasqués, o angolar e o árabe andalusi entre eles — e o trabalho a jusante entrega os **primeiros dicionários de IPA** para o **barranquenho** e o **mirandês**.

## Uma lattice de candidatos, não um único palpite

A grafia não é um problema de segmentação limpo, por isso a arquitetura de referência é uma **lattice de candidatos**. O `PhonetokTokenizer` faz tokenização de grafemas **maximal-munch** — preferindo de forma gananciosa a unidade ortográfica correspondente mais longa — e, sobre a tabela de grafemas da especificação, produz uma lattice por posição de candidatos a IPA ordenados, em vez de um único resultado frágil:

```python
from orthography2ipa.phonetok import PhonetokTokenizer
tok = PhonetokTokenizer(orthography2ipa.get("en-GB"))

tok.ipa_best("through")                 # 'θɹɔː'
for path in tok.ipa_beam("through", beam_width=8):
    print(path.ipa, path.score)         # θɹɔː 0.0, ðɹɔː 1.0, θɹoʊ 1.0, …
```

A lattice é o contrato sobre o qual toda a família a jusante assenta. Um motor específico de uma língua consome a lattice partilhada e acrescenta apenas a fonologia que uma tabela estática não consegue exprimir, mantendo cada consumidor sobre o mesmo núcleo fundamentado:

- O **[arbtok](https://github.com/TigreGotico/arbtok)** constrói a fonologia de TTS árabe sobre a lattice, acrescentando a assimilação das letras solares, a elisão da hamzat al-waṣl, a geminação e o tratamento de ligaturas — e uma nova **fusão rawi-lattice** que restaura as vogais breves em falta do texto dialetal não diacritizado, pontuando a distribuição por carácter de um ensemble *sob o licenciamento do lecto pedido*, em vez de confiar num gerador livre.
- O **[TugaPhone](https://github.com/TigreGotico/tugaphone)**, o **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** (mirandês) e o **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** consomem todos o mesmo lattice-core para as suas variedades lusófonas.

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

## Como sabemos que os dados prestam

Um "gold" fiável para G2P mal existe — a maioria dos conjuntos de dados públicos é o próprio output de um phonemizer reutilizado como referência, pelo que uma taxa de erro baixa contra eles significa "concorda com essa ferramenta", não "correto". Somos explícitos quanto a isto e construímos uma metodologia de verificação em torno disso, em vez de reportar um único número lisonjeiro.

Para as variedades que mais nos importam, o gold é **de autoria, não raspado**: um conjunto de frases fixado ao motor por lecto, avaliado em **pares cegos**, arbitrado contra **literatura com fixação de página**, e reintroduzido através de **classes de correção** num ciclo de feedback do motor — uma discordância entre o output do motor e a forma corrigida é uma pista de um bug real na especificação. Ao longo do gold de TTS fixado ao motor e das atestações de fonte primária há **vários milhares de linhas verificadas**. O enquadramento é deliberadamente honesto quanto à proveniência: sintético e arbitrado por literatura onde é tudo o que existe, e gold humano genuíno onde o há — o conjunto `mirandese_g2p` de falante nativo de mirandês, as atestações de fonte primária com fixação de página e as contribuições nativas. As afirmações de exatidão são feitas **apenas** contra gold humano; uma pontuação perfeita contra o próprio rascunho do motor não significaria nada.

Os números, lidos como direcionais e sempre citados à sua fonte ([`docs/scoreboard.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/scoreboard.md), [`docs/benchmarks.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/benchmarks.md), e os documentos de benchmark dos repositórios a jusante):

- **Dialetos árabes, input não diacritizado e nu** — o caso difícil e realista para deployment. No gold de TTS de input nu do arbtok (33 lectos), a fusão rawi-lattice sob licenciamento dialetal atinge um **PER médio de 0,189**, batendo o mesmo ensemble corrido como gerador livre (0,193), com a margem concentrada nos lectos que mais divergem do MSA. Na maioria dos lectos o arbtok bate o espeak-ng no input nu; no próprio MSA, o espeak — que é afinado para MSA — ainda vence (espeak 0,176 vs arbtok 0,245).
- **Dialetos árabes, input diacritizado** — com as marcas presentes o PER do arbtok fica em **0,01–0,08** por lecto, bem abaixo da única voz MSA do espeak (por exemplo, najdi 0,009 vs espeak 0,221; egípcio 0,027 vs espeak 0,287). O espeak não tem vozes dialetais, pelo que isto é honestamente comparar alhos com bugalhos — mas a diferença é o que interessa.
- **Português, contra gold humano especializado** — o português europeu de Lisboa fica em **PER 0,029** (88% de correspondência exata) sobre fontes primárias com fixação de página, e o gold mirandês de falante nativo em **0,146**.

Cada um destes é uma propriedade do estado atual dos dados, cruzada com um intervalo de confiança bootstrap, não um troféu de leaderboard. Onde o intervalo é largo ou a amostra minúscula, o scoreboard di-lo.

## A CLI

Tudo o que está acima é acessível sem escrever Python. O script de consola `orthography2ipa` traz `list`, `info`, `transcribe` e `distance`, e cada subcomando aceita `--json` para encaminhar para uma pipeline.

```bash
orthography2ipa list --family Romance
orthography2ipa info pt-BR --graphemes
orthography2ipa transcribe en-GB "through" --beam 8
orthography2ipa distance es-ES it-IT --json
```

## Porque é que os dados puros importam

Todo o conjunto de especificações é validado por esquema — dataclasses congeladas ao estilo pydantic, varridas por uma suite de testes de integridade, com o `SCHEMA.md` a documentar a forma. Onde uma tabela estática genuinamente não consegue exprimir as regras, lógica específica da língua encaixa em torno dos dados: os silabadores registam-se através de um grupo de entry-points, e os motores mais pesados assentam na lattice partilhada a jusante.

Não há um modelo opaco a decidir como soam as línguas dos seus utilizadores. Os mapeamentos são auditáveis, as fontes são citadas à página, e adicionar uma língua é escrever um único ficheiro JSON validado — comece pelo [`docs/adding_a_language.md`](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/adding_a_language.md) e pelo [guia de introdução](https://github.com/TigreGotico/orthography2ipa/blob/dev/docs/getting_started.md). Para quem constrói TTS, ASR ou NLP fonético e se recusa a terceirizar a sua fonologia para uma caixa negra — e que a quer a correr no seu próprio hardware — é este o ponto. É Apache 2.0, e é seu para inspecionar, estender e auto-hospedar.

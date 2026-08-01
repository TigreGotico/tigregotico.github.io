---
title: "Como a Stack de Fonologia se Encaixa"
description: "Uma visita à arquitetura da nossa stack de texto-para-pronúncia: o scriptconv para notação, o orthography2ipa como motor interlinguístico de grafema-para-IPA, frontends específicos de língua construídos sobre ele para português, basco, mirandês, barranquenho e árabe, e o phonematcher para pesquisa baseada em som. Mostra porque existem as camadas, o que é uma lattice de candidatos, e resultados reais por dialeto."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "G2P"
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "TTS"
  - "Linguistics"
  - "FOSS"
draft: false
---

Peguemos na palavra inglesa "read". Escrita, não diz como se pronuncia. "I read the book yesterday" e "I read the book every day" usam as mesmas cinco letras para dois sons diferentes — um rima com "red", o outro com "reed". Um leitor de ecrã, um assistente de voz ou uma caixa de pesquisa que apenas olhe para a grafia não consegue acertar nisto. Precisa de raciocinar sobre a pronúncia, não apenas sobre o texto.

Esse problema de raciocínio — transformar palavras escritas nos sons que representam — é o que a nossa stack de fonologia resolve. Este artigo é um mapa de como as suas peças se encaixam, desde a notação em bruto até motores de pronúncia específicos de língua e pesquisa baseada em som.

## Alguns termos, definidos com clareza

Algumas palavras que surgem ao longo do texto:

- **Grafema**: um símbolo escrito — uma letra, ou uma combinação de letras como "ch".
- **Fonema**: uma unidade distinta de som numa língua, como o som "k" em "cat".
- **IPA** (Alfabeto Fonético Internacional): um alfabeto padrão para escrever sons com precisão, independentemente da grafia de qualquer língua. "Cat" escreve-se `kæt` em IPA.
- **G2P** (grafema-para-fonema): o problema geral de converter grafia em som.
- **Alofone**: uma realização variante do mesmo fonema consoante o contexto — o "t" em "top" e o "t" em "stop" são o mesmo fonema em inglês mas pronunciam-se de forma ligeiramente diferente.
- **Silabação**: dividir uma palavra em sílabas, por exemplo "extraordinário" em `ex-tra-or-di-ná-ri-o`.
- **Homógrafo**: duas palavras escritas da mesma forma mas com significados diferentes; um **homógrafo heterofónico** (ou heterófono) é um homógrafo pronunciado de forma diferente consoante o significado pretendido, como "read"/"read" acima.
- **Morfologia**: a estrutura interna das palavras — prefixos, radicais, sufixos, flexões.
- **Etiquetagem morfossintática (POS)**: rotular cada palavra de uma frase como nome, verbo, adjetivo, e assim por diante.

## O problema central

A grafia é uma codificação com perdas do som. Três coisas separadas tornam-na difícil de inverter:

1. **Ambiguidade.** As mesmas letras podem mapear para sons diferentes consoante o significado, a gramática, ou a pura irregularidade ("read" acima; o inglês está cheio destes casos).
2. **Dialeto.** A mesma palavra, na mesma língua, pronuncia-se de forma diferente consoante a origem do falante. O português europeu e o brasileiro partilham a grafia mas não as vogais.
3. **Cobertura.** A maioria das línguas do mundo não tem sequer um dicionário de pronúncia curado profissionalmente. Um sistema de G2P que só funciona por consulta a uma tabela é um sistema que só funciona para um punhado de línguas.

Qualquer tentativa séria de texto-para-fala, dados de treino de reconhecimento de fala, ou pesquisa foneticamente consciente tem de lidar com as três.

## Porque é que a stack é em camadas

A stack divide o problema em camadas que não precisam de se conhecer mutuamente:

- **Notação** — converter entre alfabetos fonéticos e escritas. Isto não tem nada a ver com a fonologia de nenhuma língua em particular; é tradução de símbolos.
- **Fonologia** — mapear a grafia para IPA numa dada língua, usando uma spec do sistema sonoro dessa língua.
- **Tratamento de exceções específico da língua** — as palavras irregulares, as manias dialetais, os homógrafos e a estrutura morfológica que um motor geral não consegue inferir apenas a partir de regras de grafia.

Manter estas camadas separadas é uma decisão de design, não um acidente, e tem um retorno direto: acrescentar uma nova língua significa escrever uma **spec** (dados que descrevem o seu sistema sonoro), não um novo programa. O motor que consome a spec, a pesquisa na lattice, o tokenizador, as métricas de distância — nada disso é reescrito. A camada de notação por baixo é partilhada por todas as línguas, incluindo aquelas de que o motor de fonologia nunca ouviu falar.

### A camada de notação: scriptconv

O [scriptconv](https://github.com/TigreGotico/scriptconv) é um núcleo sem dependências para notação fonética e tratamento de escritas: deteção de escrita ISO-15924, conversões de IPA de e para ARPABET, X-SAMPA, Lexique, Kirshenbaum, notação Cotovía e RFE, transliteração Buckwalter para árabe, decomposição de Hangul em jamo, e tratamento de kana. Nada disto requer saber a que língua uma palavra pertence — uma cadeia de fonemas em IPA converte-se para ARPABET da mesma forma independentemente da língua de origem:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Todas as camadas acima desta podem assumir que a conversão de notação já está resolvida.

### O motor: orthography2ipa

O [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) é o motor interlinguístico. Recebe uma spec de língua — uma descrição declarativa das regras de grafema-para-fonema dessa língua — e um trecho de texto, e produz IPA. À data desta publicação, traz specs que cobrem **807 línguas** (`available_codes()` no pacote instalado devolve uma lista com esse comprimento; trate o número exato como um alvo móvel, já que as specs vão sendo adicionadas ao longo do tempo).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
807
```

O próprio motor não tem código específico de nenhuma língua embutido. Uma nova língua é um novo ficheiro de spec, verificado face ao mesmo esquema que todas as outras specs.

## A lattice: candidatos ordenados, não um único palpite

Dado o problema de ambiguidade acima, comprometer-se com um único resultado por palavra é muitas vezes errado. Em vez disso, o orthography2ipa produz uma **lattice** — um conjunto de pronúncias candidatas ordenadas — e deixa que camadas superiores a restrinjam usando contexto que o próprio motor não tem (significado, categoria gramatical, uma entrada de léxico).

Peguemos novamente em "read":

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Sem mais contexto, o motor devolve o seu melhor palpite (presente, custo mais baixo) mas mantém a alternativa (passado) na lattice com o seu custo associado. Um componente a jusante que saiba que a frase está no passado pode escolher o segundo candidato em vez do primeiro. É a mesma ideia usada, a maior escala, pelo bifonia (abaixo) para os heterófonos portugueses: uma lattice de uso geral fornece candidatos, uma camada mais estreita e mais bem informada escolhe entre eles.

## Os dialetos são cidadãos de pleno direito

Dois falantes da mesma língua podem pronunciar a mesma frase de forma diferente, e uma stack de fonologia que trate o "português" como um único sistema sonoro fixo vai errar todos os dialetos menos um. O orthography2ipa expõe o tratamento de dialetos diretamente — `available_profiles()` no pacote instalado lista perfis de dialeto e lecto como `lisbon`, `porto`, `estremenho`, `galician`, e outros — e o [tugaphone](https://github.com/TigreGotico/tugaphone), o frontend português construído sobre ele, fonemiza a mesma frase ao longo das variedades lusófonas. Aqui está uma frase passada pelas cinco variedades suportadas:

| Dialeto | Resultado |
|---|---|
| pt-PT (Portugal) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brasil) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Moçambique) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Timor-Leste) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

("Bom dia, como está você?") O esqueleto consonântico mantém-se reconhecível nas cinco, mas dois marcadores bem conhecidos separam-nas imediatamente. Em "dia", o português brasileiro transforma o `d` antes de `i` em `dʒ`, o som no início do inglês "jam" — os outros mantêm um `d` simples. Em "está", o português europeu pronuncia o `s` no final de sílaba como `ʃ`, o "sh" de "shoe", enquanto todas as outras variedades mantêm `s`. Um dicionário de pronúncia construído a partir das regras de um dialeto erra ambos estes casos para o ouvinte de qualquer outro dialeto.

O [euskaphone](https://github.com/TigreGotico/euskaphone) faz o mesmo para os dialetos do basco, construído diretamente sobre a lattice do orthography2ipa em vez de um motor separado:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## Os frontends específicos de língua

Sobre o motor partilhado assentam frontends que acrescentam o que uma spec geral não consegue: palavras irregulares, um léxico curado, sandhi (mudanças de som nas fronteiras de palavras), e substituições específicas de dialeto.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — português, ao longo de pt-PT, pt-BR, pt-AO, pt-MZ e pt-TL, combinando um léxico curado com um recurso baseado em regras (mostrado acima).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — basco, sensível ao dialeto, construído sobre a mesma lattice (mostrado acima).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** — mirandês, a língua asturo-leonesa da Terra de Miranda, Portugal, com sandhi entre palavras, alofonia e acento tónico:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** — o primeiro G2P aberto para barranquenho, a língua de contacto ibero-românica de Barrancos, na fronteira Portugal–Espanha. Vê **[Apresentamos o Primeiro Phonemizer para Barranquenho](/blog/2025-12-12-barranquenho)** para saber como as suas regras foram derivadas da própria convenção ortográfica do município.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — árabe, construído sobre a lattice do orthography2ipa, acrescentando diacritização sensível ao dialeto e cobrindo o árabe padrão moderno, o clássico, e várias variedades regionais. A escrita árabe normalmente omite as marcas de vogais curtas de que um phonemizer precisa, pelo que a principal tarefa do arbtok é recuperá-las antes de entregar o resultado ao motor partilhado. É mantido por alguém que não fala árabe nativamente, por isso trate-o como em desenvolvimento ativo em vez de uma referência acabada e revista por um nativo — útil, mas o sítio onde vale a pena verificar o resultado junto de um falante nativo antes de o incluir em qualquer coisa voltada para o utilizador.

Cada um destes frontends é uma camada fina de lógica específica de língua sobre o mesmo motor de lattice partilhado e a mesma camada de notação partilhada por baixo. Nenhum deles reimplementa a conversão de IPA ou a pesquisa na lattice.

## Ferramentas de suporte para português

O português tem a stack mais profunda, porque a pronúncia portuguesa depende de mais do que regras de grafia: depende da estrutura silábica, da classe de palavra, e por vezes do simples significado.

- O **[silabificador](https://github.com/TigreGotico/silabificador)** divide palavras em sílabas usando regras feitas à mão:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- O **[tugalex](https://github.com/TigreGotico/tugalex)** é o léxico por trás do tugaphone: transcrições IPA, dados silábicos e regras ortográficas para palavras reais, para que o vocabulário comum e irregular não tenha de ser re-derivado a partir da grafia de cada vez.
- O **[tugatagger](https://github.com/TigreGotico/tugatagger)** envolve vários motores de etiquetagem morfossintática (spaCy, Stanza, um tagger ao estilo Brill, um recurso heurístico sem dependências) por trás de uma interface, para que outras ferramentas possam perguntar "que categoria gramatical é esta palavra" sem se comprometerem com um motor específico.
- O **[tugamorph](https://github.com/TigreGotico/tugamorph)** é um analisador morfológico baseado em regras: segmenta uma palavra em prefixo, radical, sufixo, flexão e clítico, usando apenas a biblioteca padrão do Python, opcionalmente afinado pelo silabificador e pelo tugatagger.
- O **[bifonia](https://github.com/TigreGotico/bifonia)** resolve homógrafos heterofónicos do português europeu — palavras como "sede" (vontade de beber, `ˈsedɨ`, versus sede de organização, `ˈsɛdɨ`) em que a pronúncia correta depende do significado, não da gramática. Vê **[Dizer Bem: Desambiguar Heterófonos do Português para TTS](/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** para saber como foi construído e avaliado. Este é o caso concreto por trás da ideia de lattice acima: o orthography2ipa consegue fornecer ambas as leituras candidatas de "sede", mas só uma camada consciente do significado como o bifonia consegue escolher entre elas.

Para mais sobre como o silabificador e o tugaphone trabalham juntos no dia a dia, vê **[NLP Clássico para Português: Silabação e Grafema-para-Fonema](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, e para o motor mais amplo por baixo de tudo isto, **[Grafema-para-IPA para 676 Línguas](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Pesquisa baseada em som: phonematcher

Tudo o que foi descrito acima transforma texto em som. O [phonematcher](https://github.com/TigreGotico/phonematcher) trabalha com as próprias representações sonoras: calcula a distância fonética entre símbolos IPA e faz pesquisa difusa sobre listas de palavras com base em como soam em vez de como se escrevem.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

Essa métrica de distância é útil em duas situações concretas: pesquisar um catálogo de palavras ou nomes pela forma como algo soa em vez da sua grafia exata (útil para interfaces de voz tolerantes a erros e para fazer corresponder empréstimos entre sistemas de escrita), e comparar quão foneticamente próximos são dois lectos relacionados — o mesmo tipo de comparação que a tabela de dialetos acima faz a olho, mas calculada em vez de estimada visualmente. O phonematcher não está no PyPI; instala-se a partir da fonte (`pip install -e .` sobre o checkout do GitHub, mais `rapidfuzz`).

## Limites, com honestidade

A cobertura ao longo de 807 specs de língua é desigual por construção: línguas com uma literatura fonológica estabelecida e um léxico obtêm um resultado melhor do que línguas com uma spec ligeira inferida sobretudo a partir de convenções ortográficas gerais. A qualidade é consistentemente melhor onde existe um léxico curado — o português, apoiado pelo tugalex, é o caso mais forte da stack; línguas que dependem apenas de regras de spec sem léxico vão lidar mal com vocabulário irregular e de empréstimo.

Alguns componentes são explicitamente referências ainda não acabadas nem revistas por um nativo: o arbtok é mantido por um falante não nativo de árabe e deve ser verificado face ao julgamento de um nativo antes de ser usado em qualquer coisa voltada para o utilizador. Os frontends construídos sobre specs ligeiras herdam essa fragilidade — um frontend só é tão bom quanto a spec e o léxico por baixo dele.

## Porque é que isto importa se a sua língua não tem ferramentas de fala

A maioria das línguas do mundo não tem nenhuma voz comercial de TTS, nenhum modelo comercial de STT, e nenhum dicionário de pronúncia mantido profissionalmente. O design em camadas acima significa que essa lacuna não requer construir um motor de fonologia de raiz: requer escrever uma spec para o sistema sonoro da língua-alvo e, quando possível, um léxico das suas palavras irregulares. O motor de lattice, as conversões de notação, e as ferramentas de pesquisa já lá estão. Se a sua língua, dialeto ou produto precisa de suporte de pronúncia que ainda não existe, é esse o tipo de trabalho que assumimos — vê **[os nossos serviços](/services)** ou [entre em contacto](/contact).

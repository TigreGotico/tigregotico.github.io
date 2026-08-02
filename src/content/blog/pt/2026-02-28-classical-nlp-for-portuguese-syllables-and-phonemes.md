---
title: "NLP Clássico para Português: Silabação e Grafema-para-Fonema"
description: "Um olhar sobre a nossa stack de NLP para português, baseada em regras e totalmente offline: o silabificador para silabação e o TugaPhone para grafema-para-fonema sensível ao dialeto, e como se ligam ao trabalho mais alargado do orthography2ipa para as variedades lusófonas. Sem caixas negras de deep learning: determinístico, rápido e com poucas dependências."
date: 2026-02-28
updated: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "NLP"
  - "Portuguese"
  - "Phonemization"
  - "Grapheme-to-Phoneme"
  - "Lusophone"
  - "FOSS"
draft: false
---

As fronteiras silábicas, a posição do acento e o mapeamento entre grafia e som em português seguem regras que os linguistas documentaram muito antes de alguém treinar uma rede neuronal. Quando essas regras são explícitas, a ferramenta certa é uma biblioteca pequena, determinística e totalmente offline que se pode ler, auditar e executar em qualquer lado. É essa a filosofia por detrás da nossa stack clássica de NLP para português: [silabificador](https://github.com/TigreGotico/silabificador) para silabação e [TugaPhone](https://github.com/TigreGotico/tugaphone) para grafema-para-fonema (G2P).

### Porquê clássico, e porquê agora

A fonética é uma das áreas onde as regras determinísticas verdadeiramente brilham. As regras de fronteira da silabação portuguesa e as regularidades da sua ortografia estão bem documentadas, pelo que um motor de regras feito à mão produz transcrições que se podem inspecionar linha a linha. Sem GPU, sem descarregar modelos, sem chamadas de rede. Isso é importante para a soberania dos dados: uma pipeline de voz lusófona não devia ter de enviar o seu texto para uma API remota só para descobrir como pronunciar uma palavra. Também é importante para a velocidade e o footprint: estas bibliotecas têm poucas dependências e correm num portátil, num servidor ou num dispositivo embebido com igual facilidade.

### silabificador: fronteiras de sílabas

O `silabificador` é um silabador de português leve, construído inteiramente a partir de regras feitas à mão, **sem dependências**. A interface é tão pequena quanto parece:

```python
from silabificador import syllabify

syllabify("computador")
# ['com', 'pu', 'ta', 'dor']
```

Foi afinado e testado com dados limpos do [Portal da Língua Portuguesa](http://www.portaldalinguaportuguesa.org) e avaliado sobre o [Portuguese Phonetic Lexicon](https://huggingface.co/datasets/TigreGotico/portuguese_phonetic_lexicon), um dataset aberto com mais de 100 000 entradas provenientes da mesma fonte. A segmentação silábica é um passo fundamental para a atribuição de acento, a translineação e a transcrição fonémica, pelo que fazê-la bem e depressa compensa em tudo o que vem a jusante.

### TugaPhone: grafema-para-fonema sensível ao dialeto

O `TugaPhone` transforma texto português arbitrário em IPA, e fá-lo através dos principais dialetos lusófonos: europeu (`pt-PT`), brasileiro (`pt-BR`), angolano (`pt-AO`), moçambicano (`pt-MZ`) e timorense (`pt-TL`). Fundamentalmente, preserva a variação dialetal em vez de nivelar tudo para um único "padrão". A mesma frase sai de forma diferente consoante o sítio onde é falada:

```
Choveu muito ontem à noite.
pt-PT → ʃuˈvew ˈmũjtu ˈõtɐ̃j a ˈnojt
pt-BR → ʃoˈvew ˈmwĩtʊ ˈõtẽj a ˈnojtʃɪ
pt-AO → ʃoˈvew ˈmũjntʊ ˈõntẽj a ˈnojtɨ
pt-MZ → ʃoˈvew ˈmũjtu ˈõtẽj a ˈnɔjtɨ
pt-TL → ʃoˈvew ˈmujtʊ ˈõntɐ̃j a ˈnojtʰ
```

Nos bastidores, o TugaPhone conduz o motor partilhado de lattice de candidatos do `orthography2ipa` e sobrepõe-lhe as questões específicas do português através dos próprios pontos de extensão desse motor. Consulta um léxico fonético curado (o mesmo Portuguese Phonetic Lexicon acima) para palavras conhecidas. Para tudo o que não esteja no léxico (nomes, neologismos, empréstimos estrangeiros) a lattice gera candidatos a partir das regras de grafemas e alofones do dialeto.

Há dois detalhes que vale a pena destacar. A **normalização de números** transforma dígitos nas suas formas faladas em português, com concordância correta de género e número:

```python
from tugaphone.number_utils import normalize_numbers

normalize_numbers("vou comprar 1 casa")    # uma casa
normalize_numbers("vou adotar 2 cães")     # dois cães
```

Respeita até as convenções de escala: escala longa `biliões` para `pt-PT`, escala curta `trilhões` para `pt-BR`. A **desambiguação de homógrafos** é delegada à biblioteca [bifonia](https://github.com/TigreGotico/bifonia), que detém o conhecimento baseado em sentido sobre que homógrafos heterofónicos existem e que leitura carregam, pelo que `para` como preposição é tratado de forma diferente de `para` como verbo, e marca a leitura escolhida com diacríticos extra antes de a lattice sequer ver a frase.

O TugaPhone fonemiza conduzindo a lattice de candidatos partilhada do `orthography2ipa`: a seleção de dialeto *é* a escolha da spec de lecto do `orthography2ipa`. Por isso os fenómenos dialetais (betacismo, os ditongos ascendentes do Porto, a palatalização do /l/ madeirense, o avanço do /u/ açoriano, o sandhi de sibilantes em coda, entre outros) vêm da própria lattice, e não de edições de string a posteriori.

O TugaPhone acrescenta apenas o que o `orthography2ipa` deliberadamente deixa ao cargo do chamador, ligado através dos seus próprios pontos de extensão. A expansão de números/ordinais sensível ao género e a marcação de heterófonos do bifonia correm como a etapa de normalização do motor antes de a lattice ver o texto. O léxico de pronúncia curado do **[Tugalex](https://github.com/TigreGotico/tugalex)** é registado por lecto através de `orthography2ipa.register_lexicon`, pelo que uma palavra coberta entra no mesmo caminho de substituição que as próprias exceções de uma spec, e a lattice só gera candidatos para palavras que o léxico não cobre. A silabação vem do plugin do próprio `orthography2ipa` apoiado no `silabificador`, pelo que o acento recai na mesma sílaba que o TugaPhone escolheria de outra forma. Peças pequenas e componíveis a alimentar um motor partilhado, cada uma útil por si só.

O TugaPhone é honesto quanto aos seus limites: a cobertura do léxico é mais escassa para os dialetos africanos e timorense, os sotaques sub-regionais (Porto, Minho, Braga, entre outros) são aproximações experimentais de características documentadas e a prosódia ao nível da frase é simplificada. Estas são limitações documentadas abertamente, não modos de falha ocultos.

### O quadro mais alargado: orthography2ipa

O português é uma variedade entre muitas, e o mesmo padrão de engenharia generaliza-se. O [orthography2ipa](https://github.com/TigreGotico/orthography2ipa) é um pacote Python de dados puros com mapeamentos grafema→IPA e de alofones linguisticamente motivados, abrangendo 820 línguas em mais de 20 famílias linguísticas. Traça uma distinção nítida de que qualquer sistema de G2P sério precisa: um **mapa de grafemas** diz que fonemas uma grafia *pode* representar, ao passo que um **mapa de alofones** diz como um fonema efetivamente *se realiza* num dado contexto. As variedades regionais são modeladas como as suas próprias especificações, ligadas através de uma linhagem ponderada com múltiplos antepassados, pelo que as árvores dialetais herdam dos seus progenitores em vez de duplicar dados.

É esse o mesmo instinto por detrás de `pt-PT`, `pt-BR`, `pt-AO`, `pt-MZ` e `pt-TL` no TugaPhone: tratar cada variedade lusófona pelos seus próprios méritos, com as suas próprias regras, e não como um desvio de um único sotaque canónico. Os dados são declarativos e a lógica é fina e plugável, pelo que pode ler as regras, citar as suas fontes e confiar no resultado.

### Experimente

Tudo o que aqui está é open source e pode ser instalado já hoje:

```bash
pip install tugaphone
pip install git+https://github.com/TigreGotico/silabificador
```

Para os mapeamentos multilingues mais alargados, veja o [orthography2ipa](https://github.com/TigreGotico/orthography2ipa). Determinístico, rápido, offline e construído para toda a amplitude do mundo lusófono.

Esta stack de fonética portuguesa assenta no nosso **[trabalho de grafema-para-IPA para 820 línguas](/pt/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**, formando a espinha dorsal fonética do **[TTS que corre numa batata](/pt/blog/2026-05-10-tts-that-runs-on-a-potato)** e das **[vozes multilingues Miro & Dii](/pt/blog/2026-06-15-two-voices-every-language-miro-and-dii)**.

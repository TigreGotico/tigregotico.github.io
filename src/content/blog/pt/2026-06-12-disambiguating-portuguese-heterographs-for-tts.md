---
title: "Dizê-lo Corretamente: Desambiguar Heterófonos do Português para TTS"
description: "Muitas palavras do português europeu escrevem-se da mesma forma mas pronunciam-se de modo diferente consoante o significado — e errar a vogal faz uma voz de TTS dizer a palavra errada. Construímos o bifonia-pt-homographs, um dataset aberto e anotado por significado com 56.891 frases sobre 27 palavras, e um resolvedor minúsculo e sem dependências que atinge ≈94% onde etiquetadores morfossintáticos pesados estagnam nos ≈75%."
date: 2026-06-12
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: true
---

## Dizê-lo Corretamente: Desambiguar Heterófonos do Português para TTS

Quando uma voz de síntese de fala lê "Tenho sede", um ouvinte português espera ouvir *thirst* (o sentido de ter sede). Mas exatamente a mesma grafia, `sede`, também pode significar *sede/quartel-general* — e as duas pronunciam-se com vogais diferentes. Diga-a com a vogal errada e a voz não soa apenas estranha; diz uma palavra diferente em voz alta. Para alguém que depende do TTS para lhe ler o ecrã, essa é a fronteira entre o inteligível e o confuso.

Isto é um problema de front-end — a fase de grafema-para-fonema que decide *que sons* uma palavra representa, muito antes de qualquer vocoder neuronal transformar esses sons em áudio. Nenhuma qualidade de vocoder resolve isto. Se o front-end escolhe a pronúncia errada, a voz articula a palavra errada, de forma nítida.

### Homógrafos heterófonos: mesma grafia, som diferente, significado diferente

O português europeu está cheio de palavras escritas de forma idêntica mas pronunciadas com uma qualidade vocálica diferente — uma vogal *aberta* versus uma *fechada* — em que a escolha correta depende do **significado**, e não apenas da gramática. Algumas:

- **`sede`** — *sede/ter sede* (e fechado, `ˈsedɨ`) vs *sede/quartel-general* (e aberto, `ˈsɛdɨ`). Ambas são nomes.
- **`forma`** — *forma de cozinha/molde* (o fechado, `ˈfoɾmɐ`, escrito *fôrma*) vs *forma/maneira* (o aberto, `ˈfɔɾmɐ`).
- **`molho`** — *molho/tempero* (o fechado) vs *molho/feixe* (o aberto).
- **`corte`** — *corte real* (o fechado) vs *um corte* (o aberto).

Um sistema de TTS ingénuo compromete-se com uma única pronúncia por grafia. Assim, lê *ter sede* com a vogal de *quartel-general* — sempre — e o ouvinte ouve a palavra errada.

### Porque "basta etiquetar a classe gramatical" não funciona

A correção óbvia é passar um etiquetador morfossintático (POS) sobre a frase e escolher a pronúncia pela classe gramatical. Isso ajuda em alguns pares, mas falha *por construção* sempre que dois significados partilham a mesma classe gramatical.

Voltemos a `sede`. *Ter sede* e *quartel-general* são **ambos nomes**. Um etiquetador POS rotula-os de forma idêntica — não há sinal gramatical que os distinga — pelo que só pode adivinhar a leitura mais comum. Medimos exatamente isto: no nosso conjunto de teste, tanto o spaCy como o Stanza obtêm **0%** no sentido de *ter sede* de `sede`. Escolhem sempre *quartel-general*. O mesmo teto estrutural surge em `corte` (corte vs corte real), `forma` (molde vs forma) e `molho` (tempero vs feixe): quando o significado se divide dentro de uma única classe gramatical, a gramática não o consegue ver.

### O dataset: anotar o significado, não a gramática

Por isso construímos um dataset aberto que anota aquilo que realmente importa — o significado. O **`bifonia-pt-homographs`** é composto por **56.891 frases em português europeu** que cobrem **27 homógrafos heterófonos**. Cada frase está anotada com a palavra, o seu **significado** (sentido), a sua classe gramatical, a sua pronúncia em IPA e uma forma com diacríticos restaurados (por exemplo *sêde* vs *séde*) que torna a leitura pretendida inequívoca na página.

A chave de agrupamento é o significado — é esse todo o objetivo. Um único registo tem este aspeto:

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

As pronúncias foram verificadas contra o dicionário [infopédia](https://www.infopedia.pt) (Porto Editora) em vez de adivinhadas, e as divisões train/test estão estratificadas por `(word, meaning)`, de modo a que um modelo a jusante — um BiLSTM, digamos — veja cada sentido em ambas as metades. Está publicado no Hugging Face como [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs).

### Até que ponto pode ser resolvido?

Com dados anotados por significado, pudemos medir como diferentes abordagens se saem a escolher o significado correto — e, portanto, a pronúncia correta:

| Abordagem | Exatidão |
| --- | --- |
| Adivinhar sempre o sentido mais comum | ≈53% |
| POS do spaCy → significado | ≈66% |
| POS do Stanza → significado | ≈75% |
| Regra `bifonia` + resolvedor de significado | **≈94%** |

As abordagens baseadas em POS estagnam exatamente onde seria de esperar: conseguem encaminhar por gramática mas nunca por significado, pelo que as divisões dentro da mesma classe de nome ficam fora de alcance. O nosso resolvedor — a biblioteca [`bifonia`](https://github.com/TigreGotico/bifonia), leve e **totalmente sem dependências** — atinge **≈94%** e, crucialmente, chega aos **100%** no caso `sede`/*ter sede* em que os etiquetadores POS obtêm **0%**.

O destaque não é apenas o número. É que um componente pequeno, rápido e totalmente aberto supera etiquetadores POS neuronais pesados nesta tarefa — porque resolve o *significado*, e não apenas a gramática. Sem GPU, sem descarregar modelos, sem chamadas de rede.

### Porque é que isto importa

A pronúncia correta é fundacional, não cosmética. Os leitores de ecrã e os assistentes de voz são a forma como utilizadores cegos e que dependem apenas da voz leem o mundo, e um front-end que pronuncia mal palavras comuns degrada silenciosamente cada frase em que toca. Corrigir a desambiguação de heterófonos na origem significa que a voz diz aquilo que o texto significa.

Como o dataset é aberto e o resolvedor é minúsculo e passível de fork, qualquer pessoa que construa um front-end de TTS para português pode acertar nisto sem um modelo gigantesco — e a mesma abordagem transfere-se de forma limpa para uma língua aparentada como o galego, onde a distinção de vogal aberta/fechada cria a mesma armadilha. Os dados anotados servem ainda um duplo propósito: são exatamente o que é preciso para treinar modelos estatísticos compactos, como um classificador por palavra, para equipas que têm o corpus e querem um resolvedor aprendido a par do baseado em regras.

### Experimente

O dataset está no Hugging Face em [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs), e o resolvedor vive em [`bifonia`](https://github.com/TigreGotico/bifonia). Encaixa-se no trabalho mais amplo de fonética do português por detrás de **[NLP Clássico para Português](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** e da **[stack de grafema-para-IPA para mais de 350 línguas](/pt/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** — peças pequenas e determinísticas que fazem uma voz pronunciar uma língua da forma como os seus falantes realmente o fazem.

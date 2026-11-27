---
title: "Translating into Barranquenho and Mirandese"
description: "Two small languages of Portugal have almost no text to train a translation model on. pt2barranquenho and pt2mirandese translate from Portuguese with rules that cite their sources, and they run in a browser with no server."
date: 2026-11-06
authors: ["Casimiro Ferreira", "Claude"]
tags:
  - "Barranquenho"
  - "Mirandese"
  - "machine translation"
  - "low-resource languages"
draft: false
---

Portugal has two languages besides Portuguese, and both are small.

**Barranquenho** is the language of Barrancos, a town of about 1,500 people on the
border with Spain. It has a Portuguese base with Andalusian and Extremaduran Spanish
features. Portugal recognised it as cultural heritage in 2021, and its first
orthographic convention, grammar and dictionary appeared only in 2025.

**Mirandese** (*lhéngua mirandesa*) is an Astur-Leonese language of the Terra de
Miranda, in the north-east. It has fewer than 4,000 speakers and is co-official with
Portuguese in its region.

A translation model learns from parallel text: many sentences together with their
translations. For Barranquenho, no parallel corpus exists. For Mirandese, there is some
Wikipedia text, a neural system (MADLAD-400 3B, a 3-billion-parameter Google model
that the Wikimedia translation service uses) and an older rule-based tool in
JavaScript. Apertium, the usual rule-based
platform for small languages, has no pair for either language. We searched GitHub, Hugging Face and the web and found no other translator into
Barranquenho, so `pt2barranquenho` is, as far as we know, the first.

We wrote [g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho), a
pronunciation model for the language, earlier. These two translators are the next step:
they write the text.

## What they do

```bash
uv pip install pt2barranquenho pt2mirandese
```

```python
from pt2barranquenho import translate as to_barranquenho
from pt2mirandese import translate as to_mirandese

to_barranquenho("Ontem fomos à feira e comprámos três quilos de feijão.")
# 'Onten fomu à fêra i compramu trêh quilu de fejãu.'

to_mirandese("Ela foi com o irmão para a escola e começou a escrever um poema.")
# 'Eilha fui cul armano pa la scola i ampeçou a screbir un poema.'
```

The same Portuguese sentences, in both languages (pt2barranquenho 0.1.1a4,
pt2mirandese 0.0.1a2):

| Portuguese | Barranquenho | Mirandese |
| :--- | :--- | :--- |
| A minha mãe disse-me que o leite estava frio. | A minha mãi me dissi que a lêti ehtaba friu. | La mie mai dixo-me que l lheite staba friu. |
| O livro do meu pai está na mesa. | U libru du mê pai ehtá na mesa. | L lhibro de l miu pai stá na mesa. |
| As meninas brincavam. | Ah menina brincabon. | Las ninas gaiában. |
| Ele disse que não. | Eli dissi que nãu. | El dixo que nó. |
| Lisboa é a capital de Portugal. | Lihboa é a capitá de Portugá. | Lisboua ye la capital de Pertual. |

The two languages go in different directions. Barranquenho changes *s* before a
consonant to *h* (*Lihboa*), drops a final *-l* or *-r* after the stressed vowel
(*capitá*), and moves a pronoun before the verb (*me dissi*). Its *leite* is feminine,
*a lêti*, because the gender follows Spanish *la leche*. Mirandese writes *lh-* in
traditional words (*lhibro*, *lheite*), uses its own articles (*l*, *la*), and has its own
words: *gaiar* for "to play".

Both translators keep template slots such as `{name}` as they are, so they can convert
the message files of an application:

```python
to_mirandese("Olá {name}, o alarme está ligado.")
# 'Oulá {name}, l'alarme stá ligado.'
```

## Barranquenho: rules from two books

With no corpus, the only sources are the two reference books of 2025, from the
University of Évora: the *Convenção Ortográfica do Barranquenho* and the *Gramática
Básica de Barranquenho*, by M. F. Gonçalves, M. V. Navas and
V. M. D. Correia.

Each rule in `pt2barranquenho` names the section of the book it comes from. A table
quotes that section with its page, and a test fails if the rule and the quote disagree.
Where the two books disagree, the Convenção wins, and the repository lists each case.

The rules cover spelling (*viva* → *biba*), the final vowels (*tempo* → *tempu*), the
sibilants, the verb endings (*-ava* → *-aba*), the place of the pronoun, the
periphrases, the possessives and the closed word classes. Some rules are grammar, not
spelling. Barranquenho uses a pronoun with some verbs where Portuguese uses none:

```python
to_barranquenho("O meu avô já morreu.")
# 'U mê abô já se morreu.'
```

Some nouns take the other gender, as in Spanish: *as laranjeiras* → *uh laranjêru*. And
13 nouns are a different word: *cócegas* → *cohquilha*, *javali* → *jabardu*.

## Mirandese: rules, word lists and a native speaker

Mirandese has more text, so its translator uses three layers. A word goes to the
first layer that has it.

1. **A native speaker's corrections** win over everything. Some of them are false
   friends. Portuguese *brincar* ("to play") is Mirandese *gaiar*, because Mirandese
   *brincar* means "to jump". Portuguese *bolo* ("cake") is *bolho*, because Mirandese
   *bolo* means "flight".
2. **Word lists.** 1,699 words that the 1999 orthographic convention prints, then
   10,098 words learned from 113,253 parallel rows, mostly from Wikipedia. Where the
   writers disagree (*lhéngua* and *léngua*), the most frequent form wins, but the
   convention's form wins over the corpus.
3. **Spelling rules** for the rest: *v* → *b*, *-ção* → *-çon*, *es-* → *s-*, and the verb
   endings of the convention.

Some rules look at the words around a word. *Não* is *nun* before a verb and *nó*
before a pause: *el dixo que nó*.

## How good are they?

chrF2 measures how many character sequences a translation shares with the reference,
from 0 to 100. Copying the Portuguese unchanged is the baseline.

For Barranquenho:

| Test set | Rows | Copy the Portuguese | pt2barranquenho |
| :--- | ---: | ---: | ---: |
| The Convenção's own sample text | 8 | 59.1 | 94.8 |
| The examples in the two books (the rules come from them) | 321 | 40.3 | 85.1 |
| Sentences from other sources, respelled to the 2025 norm | 34 | 34.2 | 61.7 |

The first set is the best test of running text: the rules were not written from it.
The third is unseen speech from older sources. It is hard, because those speakers'
words and grammar differ from the books.

For Mirandese, against MADLAD-400:

| Test set | Rows | Copy the Portuguese | MADLAD-400 3B | Rules alone | pt2mirandese |
| :--- | ---: | ---: | ---: | ---: | ---: |
| Wikimedia translations (test split) | 1,489 | 62.4 | 89.0 | 87.2 | 94.8 |
| Tatoeba, everyday sentences | 35 | 35.1 | 48.0 | 49.9 | 63.5 |

"Rules alone" switches the word lists off. It is the honest score on unseen text,
because the word lists learn from all the parallel text, test sets included. On
encyclopaedic text the rules alone come close to a 3-billion-parameter model. On
everyday sentences they are better. With the lists, pt2mirandese is a 368 KB
wheel of Python that runs on any CPU, and MADLAD needs about 5 GB.

## What you can do with them

- **Try them in a browser.** Both have a demo on Hugging Face:
  [pt2barranquenho](https://huggingface.co/spaces/TigreGotico/pt2barranquenho) and
  [pt2mirandese](https://huggingface.co/spaces/TigreGotico/pt2mirandese). The page
  loads the package with Pyodide, so the rules run in your browser and no server sees
  your text.
- **Translate an application.** Feed it the Portuguese message files. The slots stay
  intact, and a speaker corrects the draft, which is faster than translating from
  zero.
- **Make training data.** The Mirandese translator exists partly to make synthetic
  parallel text for a later neural model.
- **Translate from other languages.** [linguonnx](https://github.com/TigreGotico/linguonnx)
  routes Portuguese to Mirandese through pt2mirandese, so English can reach
  Mirandese through Portuguese.

## What they cannot do

- **No speaker has reviewed the Barranquenho output.** Its rules come from the
  books only.
- **Unseen everyday text is still hard.** The Barranquenho score on external
  sentences is 61.7, and Mirandese misses everyday words such as *teç* for *pele*
  ("skin") and idioms.
- **Gender changes are not complete in Mirandese.** When the word list changes the
  gender of a noun, the article does not always follow.
- **One way only.** Both translate from European Portuguese, not back.

## Get them

- [pt2barranquenho on GitHub](https://github.com/TigreGotico/pt2barranquenho) and
  [on PyPI](https://pypi.org/project/pt2barranquenho/)
- [pt2mirandese on GitHub](https://github.com/TigreGotico/pt2mirandese) and
  [on PyPI](https://pypi.org/project/pt2mirandese/)

---
title: "How the Phonology Stack Fits Together"
description: "An architecture tour of our text-to-pronunciation stack: scriptconv for notation, orthography2ipa as the cross-language grapheme-to-IPA engine, language-specific frontends built on top of it for Portuguese, Basque, Mirandese, Barranquenho and Arabic, and phonematcher for sound-based search. Shows why the layers exist, what a candidate lattice is, and real dialect output."
date: 2026-08-01
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
lang: en
---

Take the English word "read". Written down, it does not tell you how to say it. "I read the book yesterday" and "I read the book every day" use the same five letters for two different sounds — one rhymes with "red", the other with "reed". A screen reader, a voice assistant, or a search box that only looks at spelling cannot get this right. It needs to reason about pronunciation, not just text.

That reasoning problem — turning written words into the sounds they represent — is what our phonology stack solves. This post is a map of how its pieces fit together, from raw notation up to language-specific pronunciation engines and sound-based search.

## Some terms, defined plainly

A few words that come up throughout:

- **Grapheme**: a written symbol — a letter, or a letter combination like "ch".
- **Phoneme**: a distinct unit of sound in a language, such as the "k" sound in "cat".
- **IPA** (International Phonetic Alphabet): a standard alphabet for writing down sounds precisely, independent of any language's spelling. "Cat" is written `kæt` in IPA.
- **G2P** (grapheme-to-phoneme): the general problem of converting spelling to sound.
- **Allophone**: a variant realization of the same phoneme depending on context — the "t" in "top" and the "t" in "stop" are the same phoneme in English but are pronounced slightly differently.
- **Syllabification**: splitting a word into syllables, e.g. "extraordinário" into `ex-tra-or-di-ná-ri-o`.
- **Homograph**: two words spelled the same but with different meanings; a **heterophonic homograph** (or heterophone) is a homograph pronounced differently depending on which meaning is meant, like "read"/"read" above.
- **Morphology**: the internal structure of words — prefixes, roots, suffixes, inflections.
- **Part-of-speech (POS) tagging**: labelling each word in a sentence as a noun, verb, adjective, and so on.

## The core problem

Spelling is a lossy encoding of sound. Three separate things make it hard to reverse:

1. **Ambiguity.** The same letters can map to different sounds depending on meaning, grammar, or plain irregularity ("read" above; English is full of these).
2. **Dialect.** The same word, in the same language, is pronounced differently depending on where the speaker is from. European and Brazilian Portuguese share spelling but not vowels.
3. **Coverage.** Most of the world's languages have no professionally curated pronunciation dictionary at all. A G2P system that only works via a lookup table is a system that only works for a handful of languages.

Any serious attempt at text-to-speech, speech recognition training data, or phonetically-aware search has to deal with all three.

## Why the stack is layered

The stack splits the problem into layers that don't need to know about each other:

- **Notation** — converting between phonetic alphabets and scripts. This has nothing to do with the phonology of any particular language; it is symbol translation.
- **Phonology** — mapping spelling to IPA for a given language, using a spec of that language's sound system.
- **Language-specific exception handling** — the irregular words, dialect quirks, homographs, and morphological structure that a general engine cannot infer from spelling rules alone.

Keeping these separate is a design decision, not an accident, and it has a direct payoff: adding a new language means writing a **spec** (data describing its sound system), not a new program. The engine that consumes the spec, the lattice search, the tokenizer, the distance metrics — none of that is rewritten. The notation layer underneath is shared by every language, including ones the phonology engine has never heard of.

### The notation layer: scriptconv

[scriptconv](https://github.com/TigreGotico/scriptconv) is a zero-dependency core for phonetic notation and script handling: ISO-15924 script detection, IPA conversions to and from ARPABET, X-SAMPA, Lexique, Kirshenbaum, Cotovía and RFE notation, Buckwalter transliteration for Arabic, Hangul decomposition to jamo, and kana handling. None of this requires knowing what language a word belongs to — a phoneme string in IPA converts to ARPABET the same way regardless of the source language:

```python
>>> import scriptconv as s
>>> s.ipa_to_arpa("kæt")
'K AE T'
>>> s.ipa_to_xsampa("kæt")
'k{t'
```

Every layer above this one can assume notation conversion is already solved.

### The engine: orthography2ipa

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) is the cross-language engine. It takes a language spec — a declarative description of that language's grapheme-to-phoneme rules — and a piece of text, and produces IPA. As of this writing it ships specs covering **807 languages** (`available_codes()` on the installed package returns a list of that length; treat the exact figure as a moving target, since specs are added over time).

```python
>>> import orthography2ipa as o
>>> len(o.available_codes())
807
```

The engine itself has no language-specific code baked in. A new language is a new spec file, checked against the same schema as every other spec.

## The lattice: ranked candidates, not one guess

Given the ambiguity problem above, committing to a single output per word is often wrong. orthography2ipa instead produces a **lattice** — a set of ranked candidate pronunciations — and lets higher layers narrow it down using context the engine itself doesn't have (meaning, part of speech, a lexicon entry).

Take "read" again:

```python
>>> from orthography2ipa import G2P
>>> g = G2P("en")
>>> g.transcribe("read")
'ɹiːd'
>>> g.candidates("read")
[IPAPath('ɹiːd', score=0.0), IPAPath('ɹɛd', score=1.0)]
```

Without more context the engine returns its best guess (present tense, lower cost) but keeps the alternative (past tense) on the lattice with its cost attached. A downstream component that knows the sentence is in the past tense can pick the second candidate instead of the first. This is the same idea used, at a larger scale, by bifonia (below) for Portuguese heterophones: a general-purpose lattice supplies candidates, a narrower, better-informed layer picks among them.

## Dialects are first-class

Two speakers of the same language can pronounce the same sentence differently, and a phonology stack that treats "Portuguese" as one fixed sound system will get every dialect but one wrong. orthography2ipa exposes dialect handling directly — `available_profiles()` on the installed package lists dialect and lect profiles such as `lisbon`, `porto`, `estremenho`, `galician`, and others — and [tugaphone](https://github.com/TigreGotico/tugaphone), the Portuguese frontend built on it, phonemizes the same sentence across Lusophone varieties. Here is one sentence run through all five supported dialects:

| Dialect | Output |
|---|---|
| pt-PT (Portugal) | `ˈbõ ˈdiɐ ˈkomu eˈʃta vɔˈse` |
| pt-BR (Brazil) | `ˈbõ ˈdʒiɐ ˈkɔ̃mʊ eˈsta voˈse` |
| pt-AO (Angola) | `ˈbõ ˈdiɐ ˈkomʊ eˈsta vɔˈse` |
| pt-MZ (Mozambique) | `ˈbõ ˈdiɐ ˈkomu eˈsta vɔˈse` |
| pt-TL (Timor-Leste) | `ˈbõ ˈdiə ˈkoɔmʊ eˈsta vɔˈse` |

("Bom dia, como está você?" — "Good morning, how are you?") The consonant skeleton stays recognizable across all five, but two well-known markers separate them immediately. In "dia", Brazilian Portuguese turns the `d` before an `i` into `dʒ`, the sound at the start of English "jam" — the others keep a plain `d`. In "está", European Portuguese pronounces the `s` at the end of a syllable as `ʃ`, the "sh" of "shoe", while every other variety keeps `s`. A pronunciation dictionary built from one dialect's rules gets both of these wrong for every other dialect's listener.

[euskaphone](https://github.com/TigreGotico/euskaphone) does the same for Basque dialects, built directly on the orthography2ipa lattice rather than a separate engine:

```python
>>> from euskaphone import EuskaPhonemizer
>>> EuskaPhonemizer().phonemize_sentence("Kaixo, zer moduz zaude?")
'kai̯ʃo s̻er modus̻ s̻au̯de'
```

## The language-specific frontends

Above the shared engine sit frontends that add what a general spec cannot: irregular words, a curated lexicon, sandhi (sound changes at word boundaries), and dialect-specific overrides.

- **[tugaphone](https://github.com/TigreGotico/tugaphone)** — Portuguese, across pt-PT, pt-BR, pt-AO, pt-MZ and pt-TL, combining a curated lexicon with rule-based fallback (shown above).
- **[euskaphone](https://github.com/TigreGotico/euskaphone)** — Basque, dialect-aware, built on the same lattice (shown above).
- **[mwl_phonemizer](https://github.com/TigreGotico/mwl_phonemizer)** — Mirandese, the Asturleonese language of Terra de Miranda, Portugal, with cross-word sandhi, allophony and stress:

  ```python
  >>> from mwl_phonemizer import phonemize
  >>> phonemize("Falo la lhéngua mirandesa.")
  'ˈfalu lɐ ˈʎɛŋɡwa miɾɐˈndez̺ɐ.'
  ```

- **[g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho)** — the first open G2P for Barranquenho, the Ibero-Romance contact language of Barrancos, on the Portugal–Spain border. See **[Introducing the First Phonemizer for Barranquenho](/blog/2025-12-12-barranquenho)** for how its rules were derived from the municipality's own orthographic convention.
- **[arbtok](https://github.com/TigreGotico/arbtok)** — Arabic, built on orthography2ipa's lattice, adding dialect-aware diacritization and covering Modern Standard, Classical, and a number of regional varieties. Arabic script normally omits the short-vowel marks a phonemizer needs, so arbtok's main job is recovering them before handing the result to the shared engine. It is maintained by someone who does not speak Arabic natively, so treat it as under active development rather than a finished, native-reviewed reference — useful, but the place to double-check output against a native speaker before shipping it in anything user-facing.

Every one of these frontends is a thin layer of language-specific logic over the same shared lattice engine and the same shared notation layer underneath it. None of them reimplement IPA conversion or lattice search.

## Supporting Portuguese tools

Portuguese has the deepest stack, because Portuguese pronunciation depends on more than spelling rules: it depends on syllable structure, word class, and sometimes plain meaning.

- **[silabificador](https://github.com/TigreGotico/silabificador)** splits words into syllables using hand-crafted rules:

  ```python
  >>> from silabificador import syllabify
  >>> syllabify("extraordinário")
  ['ex', 'tra', 'or', 'di', 'ná', 'ri', 'o']
  ```

- **[tugalex](https://github.com/TigreGotico/tugalex)** is the lexicon behind tugaphone: IPA transcriptions, syllable data, and orthographic rules for real words, so common and irregular vocabulary doesn't have to be re-derived from spelling every time.
- **[tugatagger](https://github.com/TigreGotico/tugatagger)** wraps several POS tagging backends (spaCy, Stanza, a Brill-style tagger, a dependency-free heuristic fallback) behind one interface, so other tools can ask "what part of speech is this word" without committing to one specific backend.
- **[tugamorph](https://github.com/TigreGotico/tugamorph)** is a rule-based morphological analyser: it segments a word into prefix, root, suffix, inflection and clitic, using only the Python standard library, optionally sharpened by silabificador and tugatagger.
- **[bifonia](https://github.com/TigreGotico/bifonia)** resolves European Portuguese heterophonic homographs — words like "sede" (thirst, `ˈsedɨ`, vs. headquarters, `ˈsɛdɨ`) where the correct pronunciation depends on meaning, not grammar. See **[Saying It Right: Disambiguating Portuguese Heterophones for TTS](/blog/2026-06-12-disambiguating-portuguese-heterographs-for-tts)** for how it was built and evaluated. This is the concrete case behind the lattice idea above: orthography2ipa can supply both candidate readings of "sede", but only a meaning-aware layer like bifonia can choose between them.

For more on how silabificador and tugaphone work together day to day, see **[Classical NLP for Portuguese: Syllabification and Grapheme-to-Phoneme](/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)**, and for the broader engine underneath all of this, **[Grapheme-to-IPA for 676 Languages](/blog/2026-01-15-grapheme-to-ipa-for-350-languages)**.

## Sound-based search: phonematcher

Everything above turns text into sound. [phonematcher](https://github.com/TigreGotico/phonematcher) works with the sound representations themselves: it computes phonetic distance between IPA symbols and does fuzzy search over word lists based on how words sound rather than how they're spelled.

```python
>>> from phonematcher.distance import phonetic_distance
>>> phonetic_distance('b', 'p')   # voiced vs. voiceless bilabial stop — very similar
0.043478260869565216
>>> phonetic_distance('p', 'k')   # bilabial vs. velar stop — less similar
0.34782608695652173
>>> phonetic_distance('a', 'k')   # vowel vs. consonant — maximally different
1.0
```

That distance metric is useful in two concrete situations: searching a catalogue of words or names by how something sounds rather than its exact spelling (useful for typo-tolerant voice interfaces and for matching loanwords across writing systems), and comparing how phonologically close two related lects are — the same kind of comparison the dialect table above makes by eye, but computed rather than eyeballed. phonematcher is not on PyPI; it installs from source (`pip install -e .` against the GitHub checkout, plus `rapidfuzz`).

## Honest limits

Coverage across 807 language specs is uneven by construction: languages with an established phonological literature and a lexicon get better output than languages with a thin spec inferred mostly from general orthographic conventions. Quality is consistently best where a curated lexicon exists — Portuguese, backed by tugalex, is the strongest case in the stack; languages relying purely on spec rules without a lexicon will mishandle irregular and loan vocabulary.

A few components are explicitly not finished, native-reviewed references: arbtok is maintained by a non-native Arabic speaker and should be checked against native judgment before use in anything user-facing. Frontends built on thin specs inherit that thinness — a frontend is only as good as the spec and lexicon underneath it.

## Why this matters if your language has no speech tooling

Most of the world's languages have no commercial TTS voice, no commercial STT model, and no professionally maintained pronunciation dictionary. The layered design above means that gap doesn't require building a phonology engine from scratch: it requires writing a spec for the target language's sound system and, where possible, a lexicon of its irregular words. The lattice engine, the notation conversions, and the search tooling are already there. If your language, dialect, or product needs pronunciation support that doesn't exist yet, that's the kind of work we take on — see **[our services](/services)** or **[get in touch](/contact)**.

---
title: "One File Holds the Voice and Its Text Rules"
description: "A text-to-speech voice is useless without a phonemizer, and a phonemizer is usually a separate program for each language and each runtime. orthography2ipa compiles its pronunciation rules to a versioned IR that a 3,632-line Lua interpreter runs inside a loom GGUF. A Kabyle voice is one file: text goes in, audio comes out."
date: 2026-11-27
authors: ["Casimiro Ferreira", "Claude"]
tags:
  - "orthography2ipa"
  - "loom"
  - "TTS"
  - "G2P"
  - "GGUF"
draft: false
---

A neural text-to-speech voice does not read letters. It reads phonemes: the sounds
of the language, written in a phonetic alphabet such as IPA. Before the voice makes a
sound, a **phonemizer** turns the text into phonemes:

```text
Azul fell-awen.   →   æzul fəlː æwən
```

The voice model is one file. The phonemizer usually is not. It is a separate program
with its own dependencies, its own data and its own runtime. If you move the voice to
a phone, a browser or a small board, you must move the phonemizer too, and often you
must rewrite it.

## The cost of a hand port

[orthography2ipa](https://github.com/TigreGotico/orthography2ipa) (o2i) is our
phonemizer. It reads the spelling of a language and gives IPA, with rules for each
language and each local variety (lect). It was written in Python. To run it outside
Python, somebody wrote a port in C++: 19,550 lines that hold their own copy of the
engine and of the language data.

A port works, but it does not stay correct. Each rule fix in Python must be made again
in C++. Each new language must be copied. The two copies drift, and nobody can prove
which one a voice was trained on.

So we changed the design. The pronunciation rules stopped being code and became
**data**.

## Rules as data: the IR

o2i now has three parts:

1. A **compiler** reads the spec of a language (its graphemes, its rules, its
   exceptions, and everything it inherits from its parent language) and writes one
   JSON document: the **IR** (intermediate representation).
2. A **Python interpreter** runs the IR.
3. A **Lua interpreter** runs the same IR, with byte-identical output.

The interpreters hold no knowledge of any language. They contain no branch on a
language, a script or a family, and a CI check enforces this. Every language fact
lives in the IR. A fix to a rule is a change to data, and both interpreters get it at
once.

The IR is small. Its runtime part holds only integers, arrays and objects. Every
string is an array of codepoints in one table, and every number fits a double
exactly, so LuaJIT reads every value without loss.

<picture>
  <source srcset="/blog/o2i-loom/ir-size-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="/blog/o2i-loom/ir-size-light.svg" alt="Bar chart of the compiled IR size per language: ja 66 KiB, kab 75, ar 93, fr-FR 125, pt-PT 174, en-GB 200, pt-BR 216, ru 263." width="800" loading="lazy">
</picture>

The **revision** of a language is the SHA-256 hash of its IR bytes. A voice records
the revision of the rules it was trained on. If the rules change, the hash changes,
and you can prove which rules a voice expects.

## One sentence, three lects

The IR keeps each lect as its own compiled document. Here is one sentence in three of
them, from orthography2ipa 7.133.1a3:

| Lect | "A cidade tem dois rios." |
| :--- | :--- |
| pt-PT (Lisbon norm) | ɐ siˈdadɨ ˈtɐ̃j̃ ˈdojʒ ˈʁiuʃ |
| pt-PT-x-porto | ɐ siˈdadɨ ˈtẽj̃ ˈdojʒ ˈʁiuʃ |
| pt-BR | ɐ siˈdad͡ʒi ˈtẽj̃ ˈdojz ˈʁius |

Listen to "tem": [ɐ̃j̃] in Lisbon, [ẽj̃] in Porto. In Brazil, "-de" becomes
[d͡ʒi] and the final s is [s], not [ʃ]. Each row is a different IR, run by the same
interpreter.

## Into a loom GGUF

[loom.cpp](https://github.com/loom-ai-org/loom.cpp), by Flávio Eler De Melo, is a
small inference engine on ggml for speech, audio and small language models. Its
central idea: each model is one self-describing GGUF file that carries its weights,
its compute graphs and a **Lua driver script**. The engine hard-codes no model. In
Flávio's words, a new architecture is "an export, not an engine release". His post
[loom.cpp: AI on a $20 computer](https://huggingface.co/blog/fdemelo/loom-cpp-ai-on-a-20-dollars-computer)
shows speech recognition and small voices that run faster than real time on a
Raspberry Pi Zero W.

A loom file already contains a Lua runtime. o2i already has a Lua interpreter and an
IR. Thus the phonemizer can travel inside the voice file:

1. o2i compiles the spec of a language to its IR.
2. `orthography2ipa.export_to_loom` writes the Lua interpreter, with the IR of each
   language, as a loom driver script.
3. loom-exporter exports the VITS voice. A merge script puts the o2i driver in front
   of the voice driver, in one GGUF.

`infer({text})` then runs the phonemizer, maps the IPA to the voice's symbol ids, and
runs the voice.

## Try it: a Kabyle voice in one file

Kabyle is a good first case. Its spelling is regular, and its text needs no number or
date expansion, so o2i is its whole text front end.

```bash
pip install loom-py-rt==1.0.0 huggingface_hub numpy
```

```python
import loom, numpy as np
from huggingface_hub import hf_hub_download

model = loom.Model.from_file(hf_hub_download("TigreGotico/kab-DZ-miro-loom", "kab-DZ-miro-tts.gguf"))
text = "Azul fell-awen."

ipa = "".join(chr(int(c)) for c in model.call("phonemize", {"text": [ord(c) for c in text]}))
# 'æzul fəlː æwən'

audio = np.asarray(model.call("infer", {"text": [ord(c) for c in text], "seed": 7}), dtype=np.float32)
# 22,050 Hz mono samples
```

No Python phonemizer runs. No engine change was necessary. The file is 62.9 MB, and
its text front end takes 0.2 MB of that: 129 KB for the interpreter and 76 KB for the
Kabyle IR.

## Is it the same?

A port is only useful if it gives the same output. We measured:

| Check | Result |
| :--- | ---: |
| Lua interpreter on loom against Python o2i, conformance cases | 3,880 of 3,880 identical |
| Same, gold sentences in 188 lects | 6,369 of 6,369 identical |
| Kabyle file: IPA against Python o2i 7.133.1a3, Common Voice sentences | 2,000 of 2,000 identical |
| Kabyle file: audio against the phoonnx voice, same seed | 50 of 50 sample-identical |
| Kabyle file: ASR word error rate (50 sentences) | 0.360 (phoonnx ONNX voice: 0.372) |
| Kabyle file: real-time factor, laptop CPU | 0.039 |

The audio is identical to the phoonnx voice sample for sample, and a real-time factor
of 0.039 means about 25 times faster than real time.

The interpreter is also fast enough. For 5,000 pt-PT words on one laptop CPU core,
Python runs 7,535 words per second, plain LuaJIT 5,414, and loom 4,718, with the same
output on all 5,000 words.

## What you can build with it

- **A voice that is one file.** Ship one GGUF to any host that loom runs on. The text
  rules and the voice cannot drift apart, because they are in the same file.
- **A phonemizer as a file.** Export only the phonemizer for any o2i language:
  `python -m orthography2ipa.export_to_loom --langs ... --out X.gguf`. A pt-PT
  phonemizer GGUF is 301 KiB.
- **Pinned rules.** `export_to_loom --rev 7.30.0` compiles the language data of an
  older release with the current engine. A voice that was trained on old rules gets
  exactly those rules.

## What is not done

- **This is a proposal for loom, not a loom feature.** The text front end in the
  voice file is proposed in loom ADR-145, and that decision is Flávio's. The current
  loom design (ADR-012) keeps text rules in the engine, as one shared copy. The
  one-file approach is a second option. The merge is a script in the model repo, not
  an exporter option.
- **Only Kabyle is a full voice.** Other voices are not exported yet. A language that
  needs number or date expansion still needs that step before the file.
- **No measurement on a small board.** The numbers above are from a laptop and a
  server.
- **Most language specs are stubs.** o2i has 7,678 spec files. Eight are production
  quality, and 6,571 are stubs.
- **The rules still have defects.** On 7.133.1a3, en-GB "water" gives ˈwætə, not
  ˈwɔːtə. fr-FR "les amis" has no liaison yet. Each defect is an open issue on
  GitHub, and a fix to the data fixes it in Python and in every GGUF at once.

## Credits

The loom engine, loom-exporter and loom-py-rt are the work of Flávio Eler De Melo
and the loom-ai-org project. The IR, the interpreters and the Kabyle voice are
TigreGotico work.

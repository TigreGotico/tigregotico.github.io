---
title: "Porting With Machines, and the Licence Question We Could Not Answer"
description: "We rewrote several C, C++ and Java programs (espeak-ng's G2P, Cotovia, AhoTTS, HermiT) as pure Python, with an AI reading the original source and a human orchestrating. No human on our side read the originals. That raises two separate questions: can the output be owned at all, and is it a derivative of the input? We kept the upstream licences because that was cheaper than answering. We still think the question is open."
date: 2026-08-01
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
lang: en
---

We have rewritten a handful of old programs in Python. The G2P front-end of
[espeak-ng](https://github.com/espeak-ng/espeak-ng), the Galician and Spanish
transcription rules of [Cotovia](https://gtm.uvigo.es/en/transfer/software/cotovia/),
the Basque linguistic processing of [AhoTTS](https://github.com/aholab/AhoTTS),
the [EYE](https://github.com/eyereasoner/eye) N3 reasoner, and the OWL 2 DL
reasoner [HermiT](http://www.hermit-reasoner.com/). C, C++ and Java, most of them
older than a decade, all still the best thing available for what they do.

The motive was ordinary. A C program that phonemizes Galician is excellent until you
want it inside a Python speech stack on an ARM board. Then you need a compiler, a
toolchain, cross-compilation, a packaging story per platform, and a subprocess
boundary to marshal text across. A Java reasoner needs a JVM. Pure Python needs
`pip install`. It also reads: you can open the file that decides where the stress
goes and change it.

The ports were done semi-autonomously. An AI read the original source and wrote the
Python; a human directed the work and checked the output against the original
binary. On several of them nobody on our side ever read the original source. The
model read it. We read the diffs and the parity tests.

That leaves a question we had to decide about, and could not answer: **is the result
a derivative work, and who owns it?**

We are engineers. Nothing here is legal advice, and we are not qualified to give
any. This is a description of a decision we made and the reasoning behind it.

## Two questions that keep getting conflated

Reimplementing a program by reading its source is not new. People have been
rewriting C in Python since there was Python. What is new is the arrangement:
the reader is a machine, the implementer is the same machine, and the humans in
the loop never saw the original.

There are two questions here, and almost every discussion of this collapses them
into one. They are independent.

1. **Can the output be owned at all?** Copyright attaches to works with authors.
   If a machine produced the code, who is the author?
2. **Is the output a derivative of the input?** Whoever authored it, if anyone
   did, does the result infringe the original?

You can answer yes to one and no to the other in either combination. Keep them
apart.

Some vocabulary first. A **derivative work** is a work based on a pre-existing one,
such as a translation or a port, and the right to make one belongs to the original's
copyright holder. **Copyleft** licences (the GPL family) let you use and modify code
on the condition that what you distribute stays under the same terms. **Permissive**
licences (MIT, Apache-2.0, BSD) let you do almost anything, including shipping the
result inside proprietary software. The **LGPL** sits between the two. All of them
are built on copyright, so they only bite if there is a copyright to enforce.

## Question one: is there an author?

Copyright needs a human author. The US Copyright Office has held this consistently,
and in *Thaler v. Perlmutter* the D.C. Circuit agreed: the Copyright Act "requires
all eligible work to be authored in the first instance by a human being"
(No. 23-5233, D.C. Cir., 18 March 2025; the Supreme Court denied certiorari in March
2026). The European standard lands in a similar place: protection requires the
"author's own intellectual creation", which presupposes an author who creates.

Neither says AI-assisted work is unprotectable. Both say that what the machine
generated on its own is. The line runs through the work, not around it, and where it
falls depends on how much a human contributed. In our ports that contribution is
real but thin: choosing the target, structuring the package, judging the parity
failures. It is not obvious that this makes us the author of the transcription rules.

Which produces an awkward object. A licence is a grant of permission by a rights
holder, so if nobody holds rights in the output, the licence file at the root of the
repository is decoration. Note where that argument goes: it eats your own licence
first. Anyone arguing that machine-generated code is unowned is arguing that their
own release terms are unenforceable, before they get anywhere near upstream's.

## Question two: is it derived?

This one does not care who the author is. Infringement turns on access to the
original plus substantial similarity to its protected **expression**: the
particular way the thing was written, not what it does.

We had access. The model read the source. That half is not in dispute.

The similarity half is where the language change matters less than people expect.
Translating a novel produces a derivative work; that is the textbook example.
Changing the language defeats a claim of literal copying, but not a claim about
structure: the order of the transformations, the decomposition into functions, the
shape of the rule tables, the way the edge cases are carved up.

A tool does not launder anything, either. If you direct a copy and ship the result,
you made it. "The model wrote it" is no more a defence than "the compiler emitted
it".

## The strongest argument on the other side

There is a serious case that a cross-language reimplementation is fine, and it
deserves stating properly rather than waving at.

In *SAS Institute v World Programming* (CJEU, C-406/10, 2 May 2012), the Court held
that "neither the functionality of a computer program nor the programming language
and the format of data files used in a computer program in order to exploit certain
of its functions constitute a form of expression of that program". They are
therefore not protected by copyright. The Software Directive (2009/24/EC, Article
1(2)) says the same about the ideas and principles underlying a program, and the
Court held that a licensee may study a program's behaviour to determine the ideas
behind it, and reimplement them.

That is not a technicality. What a phonemizer *does*, turning this grapheme sequence
in this context into that phoneme, is not owned by anyone. The Galician stress rules
are facts about Galician. The OWL 2 direct semantics are a published W3C
specification. Under that reading a reimplementation reproducing behaviour rather
than expression is lawful, and a rewrite across languages sits much further from
infringement than a copy-paste.

The gap between that argument and our situation is the source. *SAS* is about
studying behaviour. Our model read the code.

## The precedent that already exists, and how far it reaches

The "machine output has no author, so no copyright attaches" argument is not a thought
experiment. It is load-bearing in production: model distillation and synthetic
training data both rest on it.

The clearest public statement of it is
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), a widely used open TTS model.
Its card says it was trained exclusively on permissive or non-copyrighted audio, and
lists among the permissible sources:

> Synthetic audio generated by closed TTS models from large providers

footnoted to the US Copyright Office's
[AI policy guidance](https://copyright.gov/ai/ai_policy_guidance.pdf). The reasoning
is the one above: the audio was machine-generated, so nothing subsists to infringe by
training on it. The model ships Apache-2.0. The card also excludes synthetic audio
from *open* TTS models and from custom voice clones, which suggests the authors worked
out where the argument stops.

That precedent solves the other half of the problem. Kokoro's argument is about the
**input**: what they consumed was itself machine-generated, so the claim is it carried
no copyright to begin with. Our situation is the mirror image. What we consumed,
espeak-ng's C and Cotovia's C++ and HermiT's Java, is human-written and copyrighted by
named people at named universities. What came *out* was machine-written. The argument
lands on our output, not our input. It does not travel upstream, and once again it
undermines our own licence while leaving upstream's rights untouched.

There is a further asymmetry. Kokoro's residual exposure is not really copyright, it
is **contract**: closed providers' terms forbid using their output to train competing
models, and a term you agreed to does not evaporate because the output was
uncopyrightable. Copyleft does not work that way. Nobody clicks "I agree" to the GPL.
It is a unilateral grant, and it binds you only if you need that permission, which is
to say only if what you made is a derivative work.

So it collapses back onto the question nobody has answered. If a cross-language,
machine-written reimplementation is not a derivative work, the GPL was never engaged.
If it is one, it applied from the first line. There is no third state.

## Clean rooms, and whether two models make one

The classic answer to this problem is the clean-room protocol. One team reads the
original and writes a functional specification describing what the program does. A
second team, which has never seen the original, implements only from that
specification, so its output is provably not copied from expression it never saw.
That is how the PC BIOS was reimplemented, and why the reimplementation survived.

The obvious modern move is to run one model to read and describe, and a different
model with a fresh context to implement. Structurally that is the same protocol.

It has the right shape. But a clean room is not a technical construct, it is an
**evidentiary** one: its entire value is being able to demonstrate the separation
afterwards, to somebody who assumes you cheated. So the two-model version means
something only if the discipline holds:

- The two sides genuinely never share context. Not "we told it to forget", but separate
  runs, separate transcripts.
- The specification carries behaviour and nothing else. No pseudocode that mirrors
  the original's control flow. No identifier names. No function ordering. Those are
  expression, and a specification full of them is the original in a costume.
- Both sides' records are kept, because a clean room you cannot evidence is a story.

If the reading side emits structure, the taint passes straight through and you have
a derivative work with extra steps and a larger token bill.

We did not do this. The implementing model read the source directly, which is why
the pycotovia README says, in public:

> Because the implementing AI **read the GPL source**, this is **not a clean-room
> reimplementation** and we make no such claim. It is a source-derived port.

We would rather have that written down than have to answer it later.

## What we did

We kept the upstream licences. Copyleft in, copyleft out; permissive in,
permissive out.

[espyak](https://github.com/TigreGotico/espyak) is GPL-3.0-or-later, matching
espeak-ng, and it is not even a hard case: the package bundles espeak-ng's own
data files verbatim (`dictsource`, `phsource`, `lang`), and no theory of
authorship touches files we copied unchanged.
[pycotovia](https://github.com/TigreGotico/pycotovia) is GPL-3.0, matching Cotovia
(GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) and
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa) are
GPL-3.0, matching AhoTTS. [pyeye](https://github.com/TigreGotico/pyeye) is MIT,
matching EYE.

We did not do that because we established it was required. We did it because the
asymmetry made the decision without needing the answer. We publish open source
anyway, so copyleft costs us almost nothing: the only real cost is a client wanting
the code inside something proprietary, and for these libraries that is rare. The
opposite error is not symmetric. A permissive licence on something that should have
been copyleft is discovered late, in public, by somebody else, after people have
built on terms you were not entitled to offer, and unwinding it means contacting
every downstream user.

That asymmetry is also why this kind of mismatch is worth watching for. A structural
port of an LGPL original cannot simply become Apache-2.0 by being rewritten in
another language, and nothing complains when it does. The build passes, the tests
pass, the licence header is just a file. HermiT is LGPL and our Python port carries
LGPL-3.0 to match. Going back over the whole set turned up two more, both
undramatic: a wrapper declaring Apache-2.0 whose upstream is MIT, and repositories
whose README named a licence with no corresponding file. You check, you fix what
needs fixing, and the interesting question stays open.

You do not need to resolve the law to make this decision. You take the branch where
being wrong is survivable.

## The same question, pointing the other way

Everything above is about code we produce. The same logic applies to code we receive.
Somebody opens a pull request, the patch was written by a model, and the question is
what they are granting us.

Most projects handle this with the
[Developer Certificate of Origin](https://developercertificate.org/): the
`Signed-off-by:` line certifying that you wrote the contribution, or that it came
from a compatible source and you have the right to submit it. One line per commit, no
lawyers. It is how the Linux kernel and QEMU establish where their code came from.

For a machine-written patch neither limb is straightforwardly true, and the fork
resolves the same way either way. If machine output carries no copyright, the
contributor holds no rights in it. If instead it derives from training data, the
rights belong to whoever wrote that data. Either way they cannot grant what they do
not hold. The signature is not dishonest, but it transfers something that was never
theirs to transfer.

The consequences differ sharply. On the first branch you need no grant at all, since
material nobody owns can be used by anyone. What quietly changes is the other
direction: copyleft is built on copyright and cannot attach to material carrying
none, so a GPL project taking in machine-written patches accumulates parts its own
licence may not reach. The enforceable core thins out with nobody noticing.

The second branch has teeth. If a model reproduces memorised training data verbatim,
which happens more with common idioms than with novel logic, you have accepted
somebody else's copyrighted code on an assurance from a contributor who had no way to
check. The DCO's value is that the signer was in a position to know, and here they
are not. That lands hardest on the projects with the most careful provenance.

Debian is working through this now. A
[general resolution on LLM usage](https://www.debian.org/vote/2026/vote_002) reached
its discussion period in July 2026 with five proposals, from forbidding LLM-assisted
contributions outright to permitting them under disclosure and accountability
conditions. Nothing is decided. An
[earlier attempt in 2024](https://lwn.net/Articles/972331/) also ended without a
resolution, and the reason is worth keeping: the objection was not that the concern
was baseless but that a rule nobody can enforce is not worth adopting. You cannot
look at a diff and tell.

We have not resolved how we will handle it, and we are poorly placed to be strict. We
ship ports written by a model. A project that publishes machine-written code and
refuses machine-written contributions holds two incompatible positions at once.

## The other axis the argument runs along

Debian's debate is about provenance and licensing. It is not the only axis, and the
second has nothing to do with copyright.

Codeberg, the FLOSS forge, adopted two member-approved motions in July 2026 and
[set out its reasoning](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
in terms that barely touch licences. The objections are about costs and effort:
energy and hardware pushed onto everyone, crawler traffic that pressures small
forges into defences that also obstruct ordinary users, single-use "vibe-coded"
projects published and never maintained, and the load on reviewers:

> Maintainers are under an increased work-load due to people submitting (often
> well-meaning) low-effort, LLM-generated contributions that require substantial
> amounts of time to review.

Their Terms of Use now discourage such projects, applied case by case rather than by
mass removal.

So two independent questions are in circulation, and a project can land anywhere on
the grid: whether machine-written code can be licensed at all, and whether the
ecosystem can absorb the volume. Debian is voting on the first and has not concluded.
Codeberg acted on the second. Neither settles the other.

## The part we are not going to pretend is settled

We may not have needed to do any of that.

Take the three arguments together. Functionality is not protected; the CJEU said so
directly. Purely machine-generated output may have no human author, so there may be
no new copyright to worry about and, awkwardly, none of ours either. And a two-model
protocol run with real discipline might be a genuine clean room, in which case the
port never touched protected expression at all.

If all three hold, some of these ports could have been permissively licensed with a
clear conscience. If none hold, our conservative choice was simply correct. We do
not know which, we did not test it, and we are not interested in being the case that
settles it.

The question does not go away by being ignored. This kind of porting is becoming
ordinary, and there is a great deal of unmaintained C worth moving somewhere it can
be maintained. Every one of those ports faces the same two questions, and most will
answer by not asking. So will every project that merges a patch it did not write,
which is to say all of them.

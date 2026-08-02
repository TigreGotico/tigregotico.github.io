---
title: "Porting With Machines, and the Licence Question We Could Not Answer"
description: "We rewrote several C, C++ and Java programs — espeak-ng's G2P, Cotovia, AhoTTS, HermiT — as pure Python, with an AI reading the original source and a human orchestrating. No human on our side read the originals. That raises two separate questions: can the output be owned at all, and is it a derivative of the input? We kept the upstream licences because that was cheaper than answering. We still think the question is open."
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
reasoner [HermiT](http://www.hermit-reasoner.com/). C, C++ and Java, most of
them older than a decade, all of them still the best thing available for what
they do.

The motive was ordinary. A C program that phonemizes Galician is excellent until
you want it inside a Python speech stack on an ARM board. Then you need a
compiler, a toolchain, cross-compilation, a packaging story per platform, and a
subprocess boundary you have to marshal text across. A Java reasoner needs a JVM.
Pure Python needs `pip install`. It also reads: you can open the file that
decides where the stress goes and change it, without knowing how the original
build system works.

The ports were done semi-autonomously. An AI read the original source and wrote
the Python; a human directed the work and checked the output against the
original binary. On several of them, nobody on our side ever read the original
source. The model read it. We read the diffs and the parity tests.

That leaves a question we had to make a decision about, and could not answer:
**is the result a derivative work, and who owns it?**

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
2. **Is the output a derivative of the input?** Whoever authored it — if anyone
   did — does the result infringe the original?

You can answer yes to one and no to the other in either combination. Keep them
apart.

Some vocabulary, since the rest of this depends on it. A **derivative work** is
a work based on a pre-existing one — a translation, an adaptation, a port. The
right to make one belongs to the copyright holder of the original. **Copyleft**
licences (the GPL family) let you use and modify the code on the condition that
what you distribute stays under the same terms. **Permissive** licences (MIT,
Apache-2.0, BSD) let you do essentially anything, including shipping the result
inside proprietary software. The **LGPL** sits between: copyleft applies to the
library itself, but linking it into a larger program does not force that program
open. All of them are built on copyright. They only bite if there is a copyright
to enforce.

## Question one: is there an author?

Copyright needs a human author. The US Copyright Office has held this
consistently, and in *Thaler v. Perlmutter* the D.C. Circuit agreed: the
Copyright Act "requires all eligible work to be authored in the first instance
by a human being" (No. 23-5233, D.C. Cir., 18 March 2025; the Supreme Court
denied certiorari in March 2026). The European standard is different in shape
and lands in a similar place — protection requires the "author's own
intellectual creation", which presupposes an author who creates.

Neither of those says that AI-assisted work is unprotectable. Both say that what
the machine generated on its own is. The line runs through the work, not around
it, and where exactly it falls depends on how much a human contributed. In our
ports, the human contribution is real but thin: choosing the target, structuring
the package, judging the parity failures. It is not obvious that this makes us
the author of the transcription rules.

Which produces an awkward object. A licence is a grant of permission by a rights
holder. If nobody holds rights in the output, the licence file at the root of the
repository is decoration. Note where that argument goes: it eats your own licence
first. Anyone arguing that machine-generated code is unowned is arguing that
their own release terms are unenforceable, before they get anywhere near
upstream's.

## Question two: is it derived?

This one does not care who the author is. Infringement turns on access to the
original plus substantial similarity to its protected **expression** — the
particular way the thing was written, not what it does.

We had access. The model read the source. That half is not in dispute.

The similarity half is where it gets interesting, and where the language change
matters less than people expect. Translating a novel into another language
produces a derivative work; that is the textbook example. Changing the language
defeats a claim of literal copying. It does not defeat a claim about structure —
the order of the transformations, the decomposition into functions, the shape of
the rule tables, the way the edge cases are carved up.

It is also worth saying plainly that a tool does not launder anything. If you
direct a copy and ship the result, you are the one who made it. "The model wrote
it" is not a defence any more than "the compiler emitted it" would be.

## The strongest argument on the other side

There is a serious case that a cross-language reimplementation is fine, and it
deserves to be stated properly rather than waved at.

In *SAS Institute v World Programming* (CJEU, C-406/10, 2 May 2012), the Court
held that "neither the functionality of a computer program nor the programming
language and the format of data files used in a computer program in order to
exploit certain of its functions constitute a form of expression of that
program". They are therefore not protected by copyright. The Software Directive
(2009/24/EC, Article 1(2)) says the same about the ideas and principles
underlying any element of a program. The Court also held that a licensee may
study and observe a program's behaviour to determine the ideas behind it, and
reimplement them.

That is not a technicality. It means that what a phonemizer *does* — this
grapheme sequence, in this context, becomes that phoneme — is not owned by
anyone. The Galician stress rules are facts about Galician. The OWL 2 direct
semantics are a published W3C specification. Under that reading, a reimplementation
that reproduces behaviour and not expression is lawful, and a rewrite across
languages sits much further from infringement than a copy-paste does.

The gap between that argument and our situation is the source. *SAS* is about
studying behaviour. Our model read the code.

## The precedent that already exists, and how far it reaches

The "machine output has no author, so no copyright attaches" argument is not a
thought experiment. It is load-bearing in production, industry-wide. Model
distillation and synthetic training data both rest on it.

The clearest public statement of it is
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), a widely used open TTS
model. Its card says it was trained exclusively on permissive or non-copyrighted
audio, and lists among the permissible sources:

> Synthetic audio generated by closed TTS models from large providers

with a footnote pointing at the US Copyright Office's
[AI policy guidance](https://copyright.gov/ai/ai_policy_guidance.pdf). The chain
of reasoning is the one above: the audio was generated by a machine, machine
output has no human author, so no copyright subsists in it, so there is nothing
to infringe by training on it. The model ships Apache-2.0. The card also draws a
boundary — it excludes synthetic audio from *open* TTS models and from custom
voice clones — which is a sign the authors worked out where the argument stops
instead of applying it to everything.

Here is the part that matters for porting. **That precedent solves the other half
of the problem.**

Kokoro's argument is about the **input**. What they consumed was itself
machine-generated, so the claim is that it carried no copyright in the first
place. Uncopyrightable in, therefore nothing to inherit.

Our situation is the mirror image. What we consumed — espeak-ng's C, Cotovia's
C++, HermiT's Java — is unambiguously human-written and copyrighted, by named
people, at named universities, decades ago. What came *out* was machine-written.
The "no copyright in AI output" argument lands on our output, not on our input.
It does not travel upstream. It is, again, the argument that undermines our own
licence while leaving upstream's rights entirely untouched.

There is a further asymmetry worth noting. Kokoro's residual exposure is not
really copyright at all — it is **contract**. Closed providers' terms of service
generally forbid using their output to train competing models, and a term you
agreed to does not evaporate because the output turned out to be uncopyrightable.
Copyleft does not work that way. Nobody clicks "I agree" to the GPL. It is a
unilateral grant of permission, and it binds you only if you need that permission
— which is to say, only if what you made is a derivative work.

So the whole thing collapses back onto the one question nobody has answered. If a
cross-language, machine-written reimplementation is not a derivative work, the
GPL was never engaged and nothing about it applied. If it is one, the GPL applied
from the first line. There is no third state, and no amount of arguing about AI
authorship moves that particular needle.

## Clean rooms, and whether two models make one

The classic answer to exactly this problem is the clean-room protocol, and it is
worth describing precisely because the shape of it matters.

One team reads the original and writes a functional specification: what the
program does, in behavioural terms. A second team, which has never seen the
original, implements only from that specification. The second team's output is
provably not copied from expression it never saw. That is how the PC BIOS was
reimplemented, and it is why the reimplementation survived.

The obvious modern move is to run one model to read and describe, and a
different model with a fresh context to implement. Structurally, that is the same
protocol. Is it a clean room?

It has the right shape. But a clean room is not a technical construct — it is an
**evidentiary** one. Its entire value is being able to demonstrate the separation
afterwards, to somebody who assumes you cheated. So the two-model version means
something only if the discipline holds all the way through:

- The two sides genuinely never share context. Not "we told it to forget" — separate
  runs, separate transcripts.
- The specification carries behaviour and nothing else. No pseudocode that mirrors
  the original's control flow. No identifier names. No function ordering. Those are
  expression, and a specification full of them is the original in a costume.
- Both sides' records are kept, because a clean room you cannot evidence is a story.

If the reading side emits structure, the taint passes straight through and you
have a derivative work with extra steps and a larger token bill.

We did not do this. The implementing model read the source directly. This is why
the pycotovia README says, in the repository, in public:

> Because the implementing AI **read the GPL source**, this is **not a clean-room
> reimplementation** and we make no such claim. It is a source-derived port.

We would rather have that sentence written down than have to answer it later.

## What we did

We kept the upstream licences.

[espyak](https://github.com/TigreGotico/espyak) is GPL-3.0-or-later, matching
espeak-ng. That one is not even a hard case: the package bundles espeak-ng's own
data files verbatim — `dictsource`, `phsource`, `lang` — and no theory of
authorship touches files we copied unchanged. Upstream's data is inside the
wheel, so upstream's licence comes with it.

[pycotovia](https://github.com/TigreGotico/pycotovia) is GPL-3.0, matching
Cotovia (GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) and
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa) are
GPL-3.0, matching AhoTTS, whose licence file states GPL-3.0+ for the linguistic
processing. [pyeye](https://github.com/TigreGotico/pyeye) is MIT, matching EYE.
Copyleft in, copyleft out; permissive in, permissive out.

We did not do that because we established it was required. We did it because the
asymmetry made the decision without needing the answer.

We publish open source anyway. Copyleft costs us almost nothing — the only real
cost is the case where a client wants the code inside something proprietary, and
for these specific libraries that case is rare. So being copyleft when we did not
strictly have to be costs approximately zero.

The other error is not symmetric. Shipping a permissive licence on something that
should have been copyleft is a problem discovered late, in public, by somebody
else, after other people have built on it under terms you were not entitled to
offer. Unwinding that means contacting every downstream user.

That asymmetry is also why the mismatch is worth watching for in general. A
structural port of an LGPL original cannot simply become Apache-2.0 by being
rewritten in another language — and that is exactly the kind of mismatch that is
easy to create and hard to notice, because nothing complains. The build passes.
The tests pass. The licence header is just a file. HermiT is LGPL, so the
licensing of our Python port of it is one of the cases we are reviewing —
which is the mundane, correct outcome: you check, and you fix what needs fixing.

Under an asymmetry that lopsided, you do not need to resolve the legal question
in order to make the decision. You just take the branch where being wrong is
survivable.

## The same question, pointing the other way

Everything above is about code we produce. The identical logic applies to code we
receive. Somebody opens a pull request against one of our repositories. The patch
was written by a model. What are they granting us?

Most projects handle this with the
[Developer Certificate of Origin](https://developercertificate.org/) — the DCO,
the `Signed-off-by:` line at the bottom of a commit message. It is a short
statement the contributor attests to when they sign: that they created the
contribution themselves, or that it came from a source under a compatible
licence and they have the right to submit it under the project's terms. It is
deliberately lightweight. No lawyers, no paperwork, one line per commit. It is
how the Linux kernel and QEMU, among many others, establish where their code
came from.

For a machine-written patch, neither limb is straightforwardly true. And the
fork resolves the same way whichever branch you take.

If machine-generated output carries no copyright, the contributor holds no rights
in it. There is nothing to license to you.

If instead it is treated as derived from its training data, the rights — whatever
they are — belong to whoever wrote that data. The contributor still holds
nothing, and still has nothing to license to you.

Either way, they cannot grant what they do not hold. The signature is not
dishonest. The contributor signed in good faith and did the work. It is simply
empty: a transfer of something that was never theirs to transfer.

The practical consequence is less alarming than that sounds, and the two branches
differ sharply.

On the first branch, you do not need a grant at all. Material nobody owns can be
used by anyone. Accepting the patch is fine and nothing bad happens. What quietly
changes is the other direction: copyleft is built on copyright, and it cannot
attach to material that carries none. A GPL project accumulating machine-written
patches accumulates parts its own licence may not reach. The licence still
governs the work as distributed. The enforceable core inside it thins out, slowly,
with nobody noticing.

The second branch has teeth. If a model reproduces memorised training data
verbatim — which does happen, more with common idioms and well-known
implementations than with novel logic — then you have accepted somebody else's
copyrighted code, on an assurance from a contributor who had no way to check. The
DCO's whole value is that the person signing it was in a position to know. Here
they are not.

Debian is working through this now. A
[general resolution on LLM usage](https://www.debian.org/vote/2026/vote_002) went
into its discussion period on 23 July 2026 with five proposals on the ballot.
They span the range: Proposal A would amend the Social Contract to forbid
LLM-assisted contributions to packages, documentation and web resources outright;
Proposal C asks contributors to avoid LLMs as far as practical, requires
human-only drafting for project communications, and lets individual maintainers
impose their own bans; Proposals B, D and E permit AI-assisted work under
conditions, built variously on licensing verification, contributor
accountability, disclosure, and restrictions on sending confidential material to
cloud services. As of writing it is under discussion and nothing is decided.

That is the second time round. An
[earlier attempt in 2024](https://lwn.net/Articles/972331/) ended without a
resolution, and the reasoning for stopping is worth keeping: the objection to
acting was not that the concern was baseless but that a rule nobody can enforce
is not worth adopting. You cannot look at a diff and tell.

This is not a fringe worry. It lands hardest on exactly the projects with the
most careful provenance, because a DCO-based project's entire model of where its
code came from rests on that one attestation.

We have not resolved how we will handle it, and we are in a poor position to be
strict. We ship ports written by a model. A project that publishes machine-written
code and refuses machine-written contributions is holding two incompatible
positions at once, and we would rather not. The honest options are the same ones
Debian is weighing — disclosure, contributor accountability, or a rule nobody can
verify — and we have not picked one.

## The part we are not going to pretend is settled

We may not have needed to do any of that.

Consider the three arguments together. Functionality is not protected — the CJEU
said so directly. Purely machine-generated output may have no human author, so
there may be no new copyright to worry about and, awkwardly, none of ours either.
And a two-model protocol run with real discipline might be a genuine clean room,
in which case the port never touched protected expression at all.

If all three hold, some of these ports could have been permissively licensed with
a clear conscience. If none of them hold, our conservative choice was simply
correct. We do not know which, and we did not test it. We are not interested in
being the case that settles it.

The question does not go away by being ignored. This kind of porting is becoming
ordinary — it is cheap now, and there is a great deal of unmaintained C worth
moving to somewhere it can be maintained. Every one of those ports will face the
same two questions, and most of them will answer by not asking. So will every
project that merges a patch it did not write, which is to say all of them. The
questions arrive whether you are writing the code or only accepting it.

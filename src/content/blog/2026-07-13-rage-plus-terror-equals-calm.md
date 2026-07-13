---
title: "Most emotion libraries think rage plus terror equals calm"
description: "Introducing emotion-algebra: an emotion model built on the parts of affective science that actually replicate. The axis that separates anger from fear is missing from almost every library — and a neural network trained on 1.2 billion tweets, which has never heard of appraisal theory, picks it out anyway."
date: 2026-07-13
author: "Casimiro Ferreira"
tags:
  - "Affective Computing"
  - "Emotion"
  - "Machine Learning"
  - "LILACS"
  - "Open Source"
  - "Science"
draft: false
---

Take the two most intense negative states a person can have. Blend them in equal
measure. What do you get?

Most emotion libraries answer: **calm**.

```
(rage + terror) / 2  ==  [0, 0, 0, 0]   ->  neutrality
```

That is not a rounding error. It follows necessarily from how they are built —
and it is the reason we built
[**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra), which is
out now under Apache-2.0.

## Where the calm comes from

Nearly every emotion library in circulation rests on **Plutchik's Wheel** (1980)
or **Cambria's Hourglass of Emotions** (2012), which is derived from it. The
Hourglass gives you four signed axes, and one of them — *Sensitivity* — runs from
anger at `+3` to fear at `−3`. Opposite ends of one axis.

So `rage = [+3, 0, 0, 0]`, `terror = [−3, 0, 0, 0]`, and their average is the zero
vector. Blend maximal rage with maximal terror and the model reports that you feel
nothing at all.

The absurdity is a symptom of a real mistake. **Anger and fear are not opposites.**
They are both unpleasant, both highly aroused, and what separates them is
something else entirely: *control*. Anger is what you feel when something is wrong
**and you can do something about it**. Fear is what you feel when you can't.

And the Hourglass half-knows this. Its own sentiment formula reads:

```
polarity = (P + |At| − |S| + Ap) / 3
```

Look at `−|S|`. The **absolute value**. Both poles of the Sensitivity axis
*reduce* polarity — anger and fear alike. That is a formal admission, inside the
model's own arithmetic, that the axis is not hedonically bipolar. **The
Hourglass's polarity formula contradicts the Hourglass's geometry.** Two of its
four axes need `abs()` to produce a sensible answer.

Once you notice, you can't stop noticing.

## What the evidence actually supports

Before writing a line of code, we audited the field. It is not a comfortable
picture.

| Model | Standing |
| --- | --- |
| **Plutchik's wheel** (the antipodal structure) | Smith & Schneider (2009) ran **over 2,000 statistical tests** and report it *"receives no empirical support"*. The opposite-pairs structure is borrowed from the colour wheel. |
| **Cambria's Hourglass** | Self-described as "a derivative of Plutchik's wheel", designed for sentiment-analysis engineering. No factor-analytic derivation from human data. |
| **Lövheim's cube** (a popular neurochemical model) | **Never empirically tested.** Published in *Medical Hypotheses*, which by explicit editorial policy did **not** practise external peer review — an Elsevier panel found it was publishing "baseless, speculative, non-testable" material and removed the editor in 2010. |

Meanwhile, the constructs that *do* replicate are the ones nobody implements:
Russell's circumplex, and the finding — from **four independent research
programmes**, one with causal mediation — that **control** is what separates anger
from fear.

So emotion-algebra is built on those instead. The core follows Fontaine, Scherer,
Roesch & Ellsworth (2007), who derived four dimensions from 144 componential
features across cultures: **valence, potency, arousal, unpredictability**.

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Not neutrality. **Distress** — unpleasant, activated, with the sense of control
cancelled out. Which is what it should be.

## The test that could have killed it

Here is the problem with validating an emotion model: almost every benchmark is a
**rating scale**. People scoring words on a questionnaire. And rating scales have
a nasty property — they can *encode* a theory rather than test it. If everyone who
writes emotion questionnaires learned from the same textbook, the questionnaires
will agree with the textbook.

We wanted evidence with none of that baggage.

**DeepMoji** (Felbo et al. 2017) was trained on **1.2 billion tweets** to predict
which emoji a message carried. That is all it does. It has never heard of
Plutchik, of Scherer, of appraisal theory, or of coping potential. It is a
representation of how people *actually express* emotion, learned at scale, with no
theory imposed on it.

**GoEmotions** (Demszky et al. 2020) is 43,410 Reddit comments with human emotion
labels — real text, not word lists.

Our entire model rests on one falsifiable claim: that anger and fear are separated
by **potency**, and not by valence or arousal. So:

> **Does a theory-free model of human expression encode the anger/fear distinction
> at all — and if so, along which axis?**

If the answer were "no", our third axis would be an artefact of the appraisal
literature, and we would have said so.

### It separates them

| | |
| --- | --- |
| anger vs fear, held-out accuracy | **0.773** |
| majority baseline | 0.598 |
| permutation control (labels shuffled) | **0.600** — the signal vanishes |

A model that knows only about emoji usage can tell anger from fear. Shuffle the
labels and the ability disappears entirely, so it is not an artefact of the
fitting procedure.

### And it uses the same axis we do

We took the direction DeepMoji uses to separate anger from fear, and asked which
of our four axes it resembles:

| core axis | correlation with DeepMoji's anger↔fear direction |
| --- | --- |
| valence | −0.105 |
| arousal | +0.035 |
| **potency** | **+0.306** |
| unpredictability | −0.172 |

**Three times any other axis**, and stable across seeds (0.295–0.339, always the
largest).

A neural network trained on a billion tweets — which has never been told that
anger involves a sense of control and fear involves its absence — separates them
along a direction that tracks exactly that. Not valence. Not arousal.

This experiment uses **no coordinates from our model at all**, so it cannot be
circular. It is the strongest evidence we have, and it is a test we could have
failed.

## It predicts human behaviour, too

Lerner & Keltner (2001) found something genuinely counter-intuitive: fearful
people judge risks **pessimistically**, angry people judge them
**optimistically** — and *angry people pattern with happy people*, despite anger
and happiness having opposite valence. The effect is mediated by **control and
certainty**, not by pleasantness.

Drive emotion-algebra's appraisal layer with the same manipulation — one
obstructing event, varying nothing but coping potential — and ask it to judge
risk:

| induced | valence | potency | perceived risk |
| --- | --- | --- | --- |
| anger | −0.75 | **+0.80** | **0.150** |
| fear | −0.75 | **−0.80** | **0.850** |
| happiness | +0.75 | +0.60 | 0.200 |

Anger's risk judgement lands beside **happiness** (0.150 vs 0.200), nowhere near
fear (0.850). And note that anger and fear are **identical in valence and
arousal** here — so a valence/arousal model predicts *no difference between them
at any parameter setting*. It cannot produce this result at all.

Ablate control and certainty — Lerner & Keltner's two named mediators — and the
effect drops to **exactly zero**. Fully mediated; nothing left unexplained.

## Things it can do that other libraries can't

**Bittersweet.** Happiness and sadness genuinely co-activate — the classic case is
graduation day (Larsen, McGraw & Cacioppo 2001). A single signed valence axis
cannot represent that, mathematically. So valence is carried as two channels:

```python
graduation = AffectState(positivity=0.8, negativity=0.6, arousal=0.7)
graduation.valence      # +0.2  -- "mildly happy", says a one-axis model
graduation.ambivalence  #  0.6  -- what the one-axis model destroys
```

**Knowing what someone will do.** Motivational direction tracks potency, not
pleasantness — which is why "negative = avoid" sentiment systems get anger
backwards. Anger is unpleasant *and* approach-motivated (Carver & Harmon-Jones
2009).

```python
dominant_tendency(prototype("anger"))    # 'antagonism'  -- move against it
dominant_tendency(prototype("fear"))     # 'avoidance'   -- move away
dominant_tendency(prototype("sadness"))  # 'withdrawal'  -- give up
```

**Resting properly.** "No emotion" is not a state anything is ever in — core
affect is always on. What organisms fall toward is a *set point*: mildly positive,
calm, mildly in control. That positivity offset is why a creature at rest
**explores** instead of freezing. Decay pulls toward rest rather than toward zero,
so recovery is a trajectory:

```
terror → fear → interest → acceptance
```

**Admitting what it doesn't know.** Every construct in the library carries a
machine-readable **evidence grade** and its citation:

```python
evidence.grade_of("circumplex")          # Grade.ESTABLISHED
evidence.grade_of("valence.bipolarity")  # Grade.CONTESTED   <- both readings shipped
evidence.grade_of("lovheim.cube")        # Grade.SPECULATIVE
evidence.grade_of("plutchik.antipodal")  # Grade.METAPHOR
```

Where the science is genuinely unresolved — *is valence even bipolar?* — it says
`CONTESTED` and implements **both readings** rather than quietly picking a winner.
We don't know of another library that does this.

## What it still can't do

**Arousal from text is unsolved.** Our word lexicon manages r = 0.13 on held-out
data; a DeepMoji probe manages 0.03. Emoji usage carries hedonic tone far more
than activation. Neither is good enough to be the default, so neither ships as
one, and the benchmark script says so out loud.

**One key finding is provisional.** *Appraised coping* ("can I act on this?")
correlates with *felt dominance* at only r = 0.46 — anger is **caused** by a
high-coping appraisal while being **experienced** as only moderately in control.
Two constructs, routinely conflated. We think that's important, and we've marked
it `PROVISIONAL` in the code, because the sample behind it is small.

**And it is still an algebra** — just a better-specified one. `(S, blend)` is a
*barycentric algebra*; by Stone's theorem its models are exactly the convex subsets
of vector spaces. Relaxation is a *contraction semigroup*, so by Banach the set
point is the **unique** attractor and every state provably converges to rest.

What is gone is negation. `-anger == fear` is the trick every emotion library
performs, and it is the least defensible thing any of them do. **Sadness is not
"minus joy"**: it has its own pull — withdraw, seek help — and that is not
"negative approach". You will find `-anger` in emotion-algebra only as a *lexical
fact about Plutchik's wheel*, graded `METAPHOR`, and never as a law of the model.

## Why bother

An emotion library that quietly asserts things the evidence contradicts is worse
than useless — it is *confidently* useless, and it launders folk psychology into
every system built on top of it. The Hourglass underpins a large slice of the
sentiment-analysis literature. Plutchik's wheel is in every deck. Lövheim's cube
appears in ML papers as though it were settled neuroscience.

None of that is a conspiracy. It is what happens when convenient models get
repeated without anyone re-reading the primary sources.

emotion-algebra is our attempt to stop doing that: to carry its own epistemics, to
say what each conversion destroys, and to be checkable by anyone who disagrees.

---

*[emotion-algebra](https://github.com/TigreGotico/emotion-algebra) is Apache-2.0
and on PyPI. The evidence table, the algebraic laws, and every validation script —
including the ones with unflattering numbers — are in the repo. If you think a
grade is wrong, the citation is right there to argue with.*

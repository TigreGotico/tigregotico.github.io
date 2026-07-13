---
title: "A billion tweets know something Plutchik's wheel doesn't"
description: "Our emotion library thought rage plus terror averaged out to calm. Fixing that meant asking which emotion theories actually replicate — and then checking the answer against a model trained on 1.2 billion tweets that has never heard of any of them. It picked the same axis we did."
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

Our library — like most emotion libraries — answered: **calm**.

```
(rage + terror) / 2  ==  [0, 0, 0, 0]   ->  neutrality
```

That isn't a rounding error. It's a theorem of the model, and it sent us down a
six-month-shaped rabbit hole that ended somewhere we didn't expect: a neural
network trained on 1.2 billion tweets, agreeing with an appraisal theory from
1985 that it has never heard of.

## The one-line proof

[emotion-algebra](https://github.com/TigreGotico/emotion-algebra) was built on
two things that almost every emotion library is built on: **Plutchik's Wheel**
(1980) and **Cambria's Hourglass of Emotions** (2012). The Hourglass gives you
four signed axes, and one of them — *Sensitivity* — runs from anger at `+3` to
fear at `−3`. Opposite ends of one axis.

So `rage = [+3, 0, 0, 0]`, `terror = [−3, 0, 0, 0]`, and their average is the
zero vector.

The absurdity is a symptom of a real mistake: **anger and fear are not
opposites.** They're both unpleasant, both highly aroused, and what separates
them is something else entirely — *control*. Anger is what you feel when
something is wrong **and you can do something about it**. Fear is what you feel
when you can't.

And here's the part that made it undeniable. The Hourglass has its own sentiment
formula:

```
polarity = (P + |At| − |S| + Ap) / 3
```

Look at `−|S|`. The **absolute value**. Both poles of Sensitivity *reduce*
polarity — anger and fear alike. That is a formal admission, inside the model's
own arithmetic, that the axis is not hedonically bipolar. **The Hourglass's
polarity formula contradicts the Hourglass's geometry.** Two of its four axes
need `abs()` to produce a sensible answer.

## We audited everything, and it got worse

| What we shipped | Verdict |
| --- | --- |
| **Plutchik's wheel** | Smith & Schneider (2009) ran **over 2,000 statistical tests** and report the emotion-wheel theory *"receives no empirical support"*. The opposite-pairs structure is borrowed from the colour wheel. |
| **Cambria's Hourglass** | Self-described as "a derivative of Plutchik's wheel", built for sentiment-analysis engineering. No factor-analytic derivation from human data. |
| **Lövheim's cube** (our neurochemistry) | **Never empirically tested.** Published in *Medical Hypotheses*, which by explicit editorial policy did **not** practise external peer review — an Elsevier panel found it was publishing "baseless, speculative, non-testable" material and removed the editor in 2010. |

Meanwhile the constructs that *do* replicate — Russell's circumplex, and the
finding that **control** separates anger from fear (four independent research
programmes, one with causal mediation) — were the ones our model didn't
implement.

We'd built the foundations out of the field's least-supported ideas and the
decorations out of its best ones.

## So we rebuilt it — and then tried to break it

The rebuild is the boring part. We moved to the axes that actually come out of
data (Fontaine, Scherer, Roesch & Ellsworth 2007: **valence, potency, arousal,
unpredictability**), made every construct carry a machine-readable evidence grade
and citation, and rewrote the neurochemistry to map neurotransmitters onto
*computational roles* (dopamine as reward-prediction error, noradrenaline as
unexpected uncertainty) rather than onto emotion **names** — which was Lövheim's
actual mistake, and the reason his model is untestable.

The interesting part is what happened when we tried to check it.

Every benchmark we reached for first was a **rating scale** — people scoring words
on a questionnaire. And rating scales have a nasty property: they can *encode* a
theory rather than test it. If everyone who builds emotion questionnaires learned
the same textbook, the questionnaires will agree with the textbook.

So we went looking for evidence with none of that baggage.

## The test: a model that has never heard of any of this

**DeepMoji** (Felbo et al. 2017) was trained on **1.2 billion tweets** to predict
which emoji a message carried. That's it. It has never heard of Plutchik, of
Scherer, of appraisal theory, or of coping potential. It is a representation of
how people *actually express* emotion, learned at scale, with no theory imposed.

**GoEmotions** (Demszky et al. 2020) is 43,410 Reddit comments with human emotion
labels — real text, not word lists.

Our whole redesign rests on one claim: that anger and fear are separated by
**potency**, not by valence or arousal. That claim is falsifiable. So:

> **Does a theory-free model of human expression encode the anger/fear
> distinction at all — and if so, along which axis?**

If the answer is "no", our third axis is an artefact of the appraisal literature
and we should say so publicly.

### It separates them

| | |
| --- | --- |
| anger vs fear, held-out accuracy | **0.773** |
| majority baseline | 0.598 |
| permutation control (labels shuffled) | **0.600** — signal gone |

A model that only knows about emoji usage can tell anger from fear. Shuffle the
labels and the ability vanishes completely, so it isn't an artefact of the
fitting procedure.

### And it uses *our axis* to do it

We took the direction DeepMoji uses to separate anger from fear, and asked which
of our four axes it looks like:

| core axis | correlation with DeepMoji's anger↔fear direction |
| --- | --- |
| valence | −0.105 |
| arousal | +0.035 |
| **potency** | **+0.306** |
| unpredictability | −0.172 |

**Three times any other axis.** Stable across seeds (0.295–0.339, always the
largest).

A neural network trained on a billion tweets — which has never been told that
anger involves a sense of control and fear involves its absence — separates them
along a direction that tracks **exactly that**. Not valence. Not arousal.

That's the strongest evidence we have, and it's the reason we're confident enough
to publish. It's also a test we could have failed, and would have reported if we
had. The whole experiment uses **no coordinates from our model at all**, so it
can't be circular.

## Then we reproduced the behavioural result

Lerner & Keltner (2001) found something genuinely counter-intuitive: fearful
people judge risks **pessimistically**, angry people judge them
**optimistically** — and *angry people pattern with happy people*, despite anger
and happiness having opposite valence. The effect is mediated by **control and
certainty**, not by pleasantness.

We drove our appraisal layer with the same manipulation — one obstructing event,
varying nothing but coping potential — and asked it to judge risk.

| induced | valence | potency | perceived risk |
| --- | --- | --- | --- |
| anger | −0.75 | **+0.80** | **0.150** |
| fear | −0.75 | **−0.80** | **0.850** |
| happiness | +0.75 | +0.60 | 0.200 |

Anger's risk judgement lands next to **happiness** (0.150 vs 0.200), nowhere near
fear (0.850). Anger and fear are **identical in valence and arousal** — so a
valence/arousal model predicts *no difference between them at any parameter
setting*. It cannot produce this result at all.

Ablate control and certainty — Lerner & Keltner's two named mediators — and the
effect drops to **exactly zero**. Fully mediated, nothing unexplained.

## The parts where the data said we were wrong

We're including this section because a post that only contains wins isn't a
report, it's an advertisement.

**Our hand-tuned numbers were badly wrong.** Having rebuilt everything on
appraisal theory, we benchmarked against human word norms (Warriner et al. 2013,
13,915 words). Humans rate `rage` at **−0.21** dominance. We had it at **+0.80**.

The thing we'd missed is obvious in hindsight: **being enraged is not being in
control.** Losing your temper is *losing control*. Human raters know this; our
tidy theory-driven numbers did not. We stopped guessing and took valence and
arousal straight from the human data.

**And we learned the two things aren't the same thing.** *Appraised coping* —
"can I act on this?" — correlates with *felt dominance* at only **r = 0.46**.
Anger is *caused* by a high-coping appraisal while being *experienced* as only
moderately in control. Two constructs, routinely conflated, including by us. (We
mark that finding `PROVISIONAL` in the code: n=25, and we'd want a bigger sample
before anyone leans on it.)

**The data even handed us a better rule than the one we designed.** We'd used
*arousal* to separate fleeing from giving up. But human norms put grief's arousal
squarely inside fear's range, so arousal can't do it. What actually separates
them is **uncertainty**: fear is an *uncertain* threat you can't handle, so you
run; grief is a *certain* loss you can't handle, so you stop. We didn't put that
in the model. We found it.

**And one thing is still broken.** Predicting *arousal* from text: our word
lexicon manages r=0.13, and the DeepMoji probe manages 0.03. Emoji usage carries
hedonic tone far more than activation. Neither approach is good enough to ship,
so we shipped neither, and the benchmark script says so out loud.

## Why any of this matters

An emotion library that quietly asserts things the evidence contradicts is worse
than useless — it's *confidently* useless, and it launders folk psychology into
every system built on top of it. The Hourglass underpins a large slice of the
sentiment-analysis literature. Plutchik's wheel is in every deck. Lövheim's cube
turns up in ML papers as though it were established neuroscience.

None of that is a conspiracy. It's what happens when convenient models get
repeated without anyone re-reading the primary sources. **We repeated them too,
for a year.**

So now the library carries its own epistemics. Every construct states how much
you should trust it, from `ESTABLISHED` down to `METAPHOR`. Every conversion
between models declares what it destroys. Where the science is genuinely
unresolved — *is valence even bipolar?* — it says `CONTESTED` and implements both
readings instead of quietly picking a winner.

```python
from emotion_algebra import evidence
evidence.grade_of("circumplex")          # Grade.ESTABLISHED
evidence.grade_of("plutchik.antipodal")  # Grade.METAPHOR
evidence.grade_of("lovheim.cube")        # Grade.SPECULATIVE
```

We also lost our best party trick. `-anger == fear` was the library's headline
feature and the least defensible thing in it. It survives as a *lexical fact
about Plutchik's wheel* — graded `METAPHOR` — and not as a law of the model.
Sadness is not "minus joy": it has its own pull, which is to withdraw and seek
help, and that is not "negative approach".

The honest version is less quotable. We think it's the more useful one.

---

*[emotion-algebra](https://github.com/TigreGotico/emotion-algebra) is Apache-2.0.
The evidence table, the algebraic laws, and every validation script — including
the ones that went against us — are in the repo. If you think a grade is wrong,
the citation is right there to argue with.*

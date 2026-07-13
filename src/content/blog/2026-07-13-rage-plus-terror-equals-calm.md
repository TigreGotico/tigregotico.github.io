---
title: "Your emotion library thinks rage plus terror equals calm"
description: "We audited our own emotion library against the affective science literature. The two theories it was built on don't replicate — and the proof is one line of their own arithmetic. Here's what broke, what we replaced it with, and the benchmark that told us we were still wrong."
date: 2026-07-13
author: "Casimiro Ferreira"
tags:
  - "Affective Computing"
  - "Emotion"
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

That is not a rounding error or an off-by-one. It is a theorem of the model, and
once we understood *why* it happens, we had to rebuild the foundation of
[emotion-algebra](https://github.com/TigreGotico/emotion-algebra).

## The one-line proof

emotion-algebra was built on two things that almost every emotion library is
built on: **Plutchik's Wheel** (1980) and **Cambria's Hourglass of Emotions**
(2012). The Hourglass gives you four signed axes, and one of them — *Sensitivity*
— runs from anger at `+3` to fear at `−3`. Opposite ends of one axis.

So `rage = [+3, 0, 0, 0]` and `terror = [−3, 0, 0, 0]`, and their average is the
zero vector. Blend maximal rage with maximal terror and the model says you feel
nothing at all.

The absurdity is a symptom. **Anger and fear are not opposites.** They are both
unpleasant, both highly aroused, and they are separated by something else
entirely: *control*. Four independent research programmes converge on this —
Smith & Ellsworth (1985), Roseman (1996), Scherer's Component Process Model, and
Lerner & Keltner (2001), the last of which shows control **causally mediates**
the difference. Anger is what you feel when something is wrong *and you can do
something about it*. Fear is what you feel when you can't.

They are neighbours, not antipodes.

And here is the part that convinced us. The Hourglass has its own sentiment
formula:

```
polarity = (P + |At| − |S| + Ap) / 3
```

Look at `−|S|`. The **absolute value**. Both poles of the Sensitivity axis reduce
polarity — anger and fear alike. That is a formal admission, inside the model's
own arithmetic, that the axis is *not* hedonically bipolar. The Hourglass's
polarity formula contradicts the Hourglass's geometry. Two of its four axes need
`abs()` to produce a sensible answer.

Once you see it, you can't unsee it.

## We audited everything, and it got worse

If the foundation was rotten, what else was? We ran the whole library against the
literature. The results were not comfortable.

| What we shipped | Verdict |
| --- | --- |
| **Plutchik's wheel** (the antipodal structure) | Smith & Schneider (2009) ran **over 2,000 statistical tests** and report the emotion-wheel theory *"receives no empirical support"*. The opposite-pairs structure is borrowed from the colour wheel. |
| **Cambria's Hourglass** | Self-described as "a derivative of Plutchik's wheel", built for sentiment-analysis engineering. No factor-analytic derivation from human data exists. |
| **Lövheim's cube** (our neurochemistry) | **Never empirically tested.** Published in *Medical Hypotheses*, which by explicit editorial policy did **not** practise external peer review — an Elsevier panel found it was publishing "baseless, speculative, non-testable" material and removed the editor in 2010. |

Meanwhile the things that *do* replicate — Russell's circumplex, the appraisal
finding above, and the two meta-analyses (Lindquist 2012; Siegel 2018) showing
discrete emotions have **no consistent neural or autonomic signature** — were the
things our model didn't implement.

We had built our foundations out of the least-supported constructs in the field
and our decorations out of the best ones.

## What we did about it

We didn't pick a different theory. Theories disagree, and pretending otherwise is
how you end up with `rage + terror = calm` in the first place. Instead:

**Every construct now carries an evidence grade and its citation, in code.**

```python
from emotion_algebra import evidence
evidence.grade_of("circumplex")          # Grade.ESTABLISHED
evidence.grade_of("plutchik.antipodal")  # Grade.METAPHOR
evidence.grade_of("lovheim.cube")        # Grade.SPECULATIVE
```

Grades run `ESTABLISHED → SUPPORTED → CONTESTED → SPECULATIVE → METAPHOR`. Where
the science is genuinely unresolved — is valence even bipolar? — we mark it
`CONTESTED` and **implement both readings** rather than quietly picking a winner.
The library tells you how much to trust each of its own parts. We don't know of
another that does.

**The core is the model that actually replicates.** Fontaine, Scherer, Roesch &
Ellsworth (2007) — *"The world of emotions is not two-dimensional"* — derived four
dimensions from 144 componential features across cultures: **valence, potency,
arousal, unpredictability**. Anger and fear now sit where the evidence puts them:

| | valence | potency | arousal | |
| --- | --- | --- | --- | --- |
| anger | − | **+** | high | you can act → *move against* |
| fear | − | **−** | high | you can't → *move away* |
| sadness | − | − | **low** | it's over → *withdraw* |

Their midpoint is no longer *neutrality*. It's **distress** — negative, aroused,
with the sense of control cancelled out. Which is exactly what it should be.

**Bittersweet became representable.** Larsen, McGraw & Cacioppo (2001) showed
happiness and sadness genuinely *co-activate* — on graduation day, people report
both at once. A single signed valence axis cannot express that, mathematically.
So we split valence into two channels, and `min(positivity, negativity)` gives
you ambivalence directly. A signed model reports graduation day as "mildly
happy"; ours reports the thing people actually feel.

**Neutrality stopped being zero.** Core affect is always on — you are never
without valence and arousal, any more than you are without a body temperature. So
the coordinate origin is a mathematical fiction that nothing occupies. What
organisms actually fall toward is a *set point*: mildly positive, low arousal.
That's Cacioppo & Berntson's **positivity offset**, and it's why a creature at
rest explores instead of freezing. Decay now pulls toward *rest*, not toward
zero, and you get recovery trajectories that read like recovery:

```
terror → fear → interest → acceptance
```

## The neurochemistry, done properly

We couldn't just delete Lövheim's cube — the agent stack downstream consumes a
neurochemical readout. So we asked what his actual mistake was.

It wasn't "neurochemistry". It was mapping three neurotransmitters onto eight
**emotion names** — a claim nobody knows how to test. Map them onto
**computational roles** instead and you're standing on some of the most
replicated work in systems neuroscience: dopamine as reward-prediction error
(Schultz 1997), noradrenaline as arousal and *unexpected* uncertainty
(Aston-Jones & Cohen; Yu & Dayan), acetylcholine as *expected* uncertainty,
serotonin as patience and time-horizon (Doya 2002).

And those roles land **directly on the core's axes** — because both are
describing the same functional dimensions. A mapping to emotion *names* could
never have shown that. Same threat, different coping chemistry:

```python
NeuroState(noradrenaline=.95, cortisol=.95, dopamine=.15)     # potency −0.77 → fear
NeuroState(noradrenaline=.90, dopamine=.85, testosterone=.9)  # potency +0.86 → approach
```

Lövheim's three monoamines are a subset of ours, so his cube stays reachable as a
coordinate drop. Nothing downstream broke. It just stopped being load-bearing.

## Is it still an algebra?

Yes — and a better-specified one. The old claim was "vector space with negation",
and that claim was *false*; it's what produced the bug. The real structure:

- **`(S, blend)` is a barycentric algebra** — a convex space. By Stone's theorem
  its models are exactly the convex subsets of vector spaces, so we lose no
  rigour; we just say precisely *which* subset. A bonus falls out: closure is
  free, so blending never needs clamping.
- **`{relax_t}` is a contraction semigroup**, and by the Banach fixed-point
  theorem the set point is its **unique** attractor — every state converges to
  rest, exponentially, from anywhere. That's a theorem, not a design preference.

What's gone is `-anger == fear`. It was the library's headline feature and the
least defensible thing in it. It survives as a *lexical fact about Plutchik's
wheel* — graded `METAPHOR` — and not as a law of the core. Sadness is not "minus
joy": it has its own action tendency (withdraw, seek help), which is not
"negative approach".

## Then the data told us we were still wrong

Here's the part we're least comfortable with, and the reason we're writing this
post rather than a press release.

Having rebuilt everything on the appraisal literature, we benchmarked it against
**Warriner, Kuperman & Brysbaert (2013)** — human valence/arousal/dominance
ratings for 13,915 words. Our hand-calibrated potency values were **badly wrong**.
Humans rate `rage` at −0.21 dominance. We had it at **+0.80**.

The thing we'd missed is obvious in hindsight: **being enraged is not being in
control.** Losing your temper is *losing control*. Human raters know this. Our
tidy theory-driven numbers did not.

So we stopped guessing and took valence and arousal straight from the human
norms. And we learned something real about the third axis: **appraised coping is
not felt dominance.** They correlate at only *r* = 0.46, and the residuals are
systematic. Anger is *caused* by a high-coping appraisal — "I can do something
about this" — while being *experienced* as only moderately in control. Two
different constructs, routinely conflated. The ordering that matters (anger above
fear) holds in both. The magnitudes do not transfer.

The data even handed us a better rule than the one we'd designed. We had used
*arousal* to separate fleeing from giving up — fear is aroused, sadness isn't.
But human norms put grief's arousal at 0.49, squarely inside fear's range. What
actually separates them is **uncertainty**: fear is an *uncertain* threat you
can't handle, so you run; grief is a *certain* loss you can't handle, so you
stop. That's Lerner & Keltner's certainty dimension, and we didn't put it there —
we found it.

Held out on a corpus we never calibrated against (EmoBank, sentence-level), the
model scores a modest valence *r* = 0.33. That number is weak, and we're
publishing it anyway, because the bottleneck is our word lexicon — it maps
*miserable* to **anger** — and not the core. Fixing that is the next job.

## Why we're telling you this

We could have shipped the new model and said nothing. The critique makes our own
past work look bad, and "we benchmarked ourselves and were wrong twice" is not a
natural marketing line.

But an emotion library that quietly asserts things the evidence contradicts is
worse than useless — it's *confidently* useless, and it launders folk psychology
into every system built on top of it. The Hourglass underpins a large slice of
the sentiment-analysis literature. Plutchik's wheel is in every deck. Lövheim's
cube shows up in ML papers as if it were established neuroscience.

None of those are conspiracies. They're just what happens when convenient models
get repeated without anyone re-reading the primary sources. We repeated them too,
for a year.

So now the library carries its own epistemics. Every construct says how much you
should trust it, every conversion says what it destroys, and when we don't know,
it says `CONTESTED` and gives you both.

That's a lower-status thing to publish than a benchmark win. We think it's the
more useful one.

---

*[emotion-algebra](https://github.com/TigreGotico/emotion-algebra) is Apache-2.0.
The evidence table, the laws, and the validation scripts are all in the repo — if
you think a grade is wrong, the citation is right there to argue with.*

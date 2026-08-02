---
title: "Your sentiment model can't tell a complaint from a goodbye"
description: "Two angry-looking support messages. One customer is about to escalate; the other is about to leave without a word. Almost no emotion model can tell them apart — because they're all missing the same axis. Introducing emotion-algebra."
date: 2026-07-13
updated: 2026-08-01
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

Two messages arrive in your support queue.

> "This is the third time your app has lost my work. Fix it."

> "I don't know if I'm doing this right and I'm scared I've broken something."

Run them through any sentiment model you like. Both come back the same:
**negative, high arousal**. Angry-looking. Upset.

So you treat them the same way — and you have just made a mistake, because these
two people need opposite things.

The first one is *furious*, and furious people are **engaged**. They believe they
can force a fix, and they will keep pushing until they get one. Send them a warm
apology and a promise to look into it, and you will infuriate them further.

The second one is *frightened*. They don't think they can fix anything. They are
one bad reply away from closing the tab and never coming back — quietly, without
ever telling you why. Send them a ticket number and a five-day remediation
window, and you will lose them.

One is a complaint. The other is a goodbye. And almost nothing in the emotion-AI
toolbox can tell you which is which.

We spent a while working out why. The answer turned out to be more interesting
than we expected, and it ends with a neural network trained on a billion tweets
agreeing with a psychology paper from 1985 that it has never read.

## The missing dimension

Here is the thing about anger and fear: **they are almost identical, measured the
usual way.**

Both feel bad. Both are highly activated — your heart rate goes up either way.
Those two qualities, "how good does it feel" and "how worked up are you", are the
two dimensions almost every emotion model is built on. They're usually called
*valence* and *arousal*.

Anger and fear sit on top of each other in that space. No model built from those
two numbers can separate them, no matter how sophisticated it is, because the
information simply isn't there.

What actually separates them is a third thing: **do you feel able to do something
about it?**

Anger is what you feel when something is wrong *and you can act*. Fear is what you
feel when something is wrong *and you can't*. That sense of control — psychologists
call it *coping potential* or *potency* — is the whole difference. It is also what
tells you whether someone will fight or flee, escalate or vanish.

It is not a fringe idea. **Four independent research programmes** landed on it
separately across two decades, and one of them (Lerner & Keltner, 2001)
demonstrated it *causally*: angry people make optimistic, risk-tolerant judgements
while frightened people make pessimistic, risk-averse ones — and the effect runs
through control and certainty, not through how bad they feel.

Their most striking finding is worth sitting with. **Angry people's judgements
look like happy people's judgements.** Not like frightened people's. Anger and
happiness have opposite valence, and it doesn't matter, because valence isn't what's
doing the work.

So why doesn't this axis show up in the tools?

## Why the axis went missing

Most emotion tooling traces back to a small number of theoretical models. The two
most influential are **Plutchik's Wheel of Emotions** (1980) and, built on top of
it, **Cambria's Hourglass of Emotions** (2012), which is the model behind SenticNet.

Plutchik's wheel is a beautiful object. It's shaped like a colour wheel, and it
carries the colour wheel's central idea across: emotions come in **opposite pairs**.
Joy opposes sadness. Trust opposes disgust. And anger opposes fear.

That last one is the problem, and once you see it you cannot unsee it.

If anger and fear are opposite ends of one axis, then they cancel out. Take the
most intense rage a person can feel, mix it with the most intense terror, and ask
the model what you get:

```
(rage + terror) / 2  ==  neutrality
```

**Calm.** Blend the two most violent negative states a human being is capable of,
and the model reports that you feel nothing at all.

That is not a bug in an implementation. It is a direct consequence of the geometry
— and it means the model has thrown away the exact quantity we needed. By making
anger and fear *opposites*, it guarantees they can never be *told apart*.

The wheel half-knows this, incidentally. The Hourglass has a formula for scoring
sentiment, and in that formula the anger–fear axis is wrapped in an absolute
value: **both ends count as unpleasant**. Which is true! Anger and fear are both
unpleasant. But it quietly contradicts the geometry that put them at opposite
poles in the first place. The model's own arithmetic disagrees with its own
diagram.

## What the evidence actually says

At this point we stopped writing code and went to read the literature, and it was
not a comfortable few days.

Plutchik's opposite-pairs structure has been tested. In 2009, Smith & Schneider ran
it through more than two thousand statistical tests and concluded that the
emotion-wheel theory "receives no empirical support." The opposite pairs are an
elegant metaphor borrowed from colour theory. They are not a finding about people.

Meanwhile the things that *do* replicate — Russell's valence–arousal circumplex,
and the control dimension that separates anger from fear — are exactly the pieces
that rarely make it into working software.

There's a second-order problem here, and it's the one that actually bothered us.
Every one of these models is *usable*. They're vivid, they're teachable, they fit
on a slide. So they get repeated — and once a model has been repeated enough,
checking where it came from starts to feel like pedantry rather than diligence.
That's how a metaphor quietly becomes a foundation.

## Building it on what survives

So we built [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra),
and put the missing axis at the centre of it.

The core has five numbers: how good it feels, how bad it feels (yes, separately —
we'll come back to that), how in-control you feel, how activated you are, and how
unexpected it all is. Those come from Fontaine and colleagues (2007), who derived
them from 144 measured features across cultures rather than from an appealing
diagram.

Now the blend behaves:

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Not "calm". **Distress** — deeply unpleasant, highly activated, with the sense of
control cancelled out. Which is exactly what a mix of rage and terror should feel
like.

And the support queue works:

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'disgust'
afraid.valence, afraid.potency   # -0.47, -0.42   -> 'apprehension'
```

Look at those numbers. **The valence is nearly identical** — both messages are about
equally unpleasant, which is why a conventional sentiment model sees one thing.
The *potency* is opposite. One person feels able to act; the other doesn't.

That's your complaint, and that's your goodbye.

## The test that could have killed it

Here's what worried us. Everything above rests on the psychology literature, and
that literature is built almost entirely on **questionnaires** — people rating words
on a 1-to-9 scale. Questionnaires have an unpleasant property: they can quietly
*encode* a theory rather than test it. If everyone who writes emotion
questionnaires was taught the same textbook, the questionnaires will agree with the
textbook, and everyone will feel very validated.

We wanted a witness with no theoretical training whatsoever.

**DeepMoji** is a neural network that was trained on **1.2 billion tweets** to guess
which emoji a message ended with. That is genuinely all it does. It has never heard
of Plutchik, or of appraisal theory, or of coping potential. It has no opinion about
emotion at all — it just has an extremely well-informed sense of how people
*actually write* when they feel things.

So we asked it the only question that mattered:

> Can you tell anger from fear? And if so — what are you using to do it?

**It can.** Given real human comments labelled by real humans, it separates anger
from fear well above chance. (Shuffle the labels and the ability vanishes
completely, so it isn't an artefact of our method.)

Then we looked at *how*. We took the direction DeepMoji uses to tell the two apart,
and measured how much it lines up with each of our five axes.

It lines up with **potency** — three times more strongly than with anything else.
Not valence. Not arousal.

A model trained on a billion tweets, which has never been told that anger involves
a sense of control and fear involves its absence, reaches for exactly that
distinction when you make it choose. It found the axis on its own.

That is the single most convincing thing we have, and we want to be clear that it
could have gone the other way. If DeepMoji had separated anger and fear using
valence, or hadn't separated them at all, our third axis would have been an artefact
of the psychology literature and we would have had to say so.

## Bittersweet, and other things a single number can't hold

One more consequence, because it's a nice one.

We carry "how good it feels" and "how bad it feels" as **two separate numbers**,
rather than one score running from negative to positive. That sounds like a
technicality. It isn't.

People genuinely feel good and bad at the same time. The canonical study uses
graduation day: students report real happiness and real sadness *simultaneously*,
not a lukewarm average of the two. A single valence score is mathematically
incapable of representing that. It has to report "mildly happy", which is not what
anybody there is feeling.

Two channels can hold it. Which means the model can represent the reluctant
victory, the fond goodbye, the customer who is relieved *and* still furious. Those
are the interesting emotions, and they're the ones a single number flattens.

## Emotions for the other side

Everything so far is about reading a human. The same machinery runs backwards, to
give a character an emotional life of its own.

An emotion, here, is a *displacement* — you got pushed away from where you normally
sit, and over time you drift back. The place you drift back to is not zero. There
is no such thing as "no emotion"; even at rest you are somewhere, and that
somewhere is mildly pleasant, calm, and mildly in control. (That slight positive
lean is why a creature at rest goes and *explores* something instead of sitting
inert. It's a real, measured effect.)

So a guard who has just seen something terrifying doesn't flip back to neutral when
a timer expires. He comes down through it:

```
terror → fear → apprehension → pensiveness → acceptance
```

Fear, then wariness, then a kind of quiet brooding, and eventually he's fine. We
didn't script that sequence; it falls out of the geometry.

And two guards can differ because they settle toward *different* resting places.
Give one a slightly lower baseline sense of control and a habit of taking bad news
twice as hard, and he becomes recognisably anxious — startles more, recovers
slower, broods longer. That's a character, and it's four numbers rather than a
behaviour tree.

Then the useful part: what does he *do*? That, too, comes off the control axis. The
angry guard charges you. The frightened guard runs. "Negative emotion" cannot
choose between those, and it never could.

## The part where we tell you what's wrong with it

Every model in the library carries a **grade** and a citation — from `ESTABLISHED`
(replicated, cross-cultural, meta-analytic) down to `METAPHOR` (a lovely diagram
that didn't survive testing).

Plutchik's wheel is in there, graded `METAPHOR`, and it still works exactly as
Plutchik specified — `-anger` still gives you `fear`, because that is what his model
says. His arithmetic is faithfully implemented, *and* his model is not right about
people. Both things are true, and we'd rather tell you both than pick one.

We're equally blunt about our own gaps:

**Reading arousal from text is unsolved.** We can get valence, we can get potency —
we cannot reliably tell how *worked up* someone is from their words. Our best number
is bad. We ship it labelled as bad rather than quietly hoping you don't check.

**One of our own findings is provisional.** The "sense of control" that *causes*
anger and the "sense of control" people *report while angry* turn out not to be the
same thing — you feel less in command mid-rage than the theory would predict.
Losing your temper is, after all, *losing control*. We think that's important. We
also think our evidence for it is thin, and we've marked it accordingly.

## Why we bothered

An emotion library that quietly asserts things the evidence contradicts is worse
than useless. It's *confidently* useless — and everything built on top of it
inherits the mistake, silently, forever.

We'd rather ship something that tells you how much to trust each of its own parts.

```bash
pip install emotion-algebra
```

The [documentation](https://github.com/TigreGotico/emotion-algebra) has a
five-minute quickstart, a guide to giving an agent an emotional life, and the full
evidence table with every citation in it. If you think one of our grades is wrong,
the source is right there to argue with — and we would genuinely like to hear about
it.

Meanwhile: somewhere in your support queue, there's someone quietly composing a
goodbye. It would be good to know which one they are.

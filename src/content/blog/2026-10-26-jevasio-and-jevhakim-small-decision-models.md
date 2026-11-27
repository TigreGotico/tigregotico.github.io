---
title: "Jevásio and Jevhakim: Ask a Small Model a Question, Get a Probability"
description: "Most questions a voice assistant or a support desk asks are multiple choice. Jevásio (European Portuguese) and Jevhakim (Arabic) answer them in one forward pass, with a calibrated probability per option and no text to parse. Why we trained them, how, and what they are good for."
date: 2026-10-26
authors: ["Casimiro Ferreira", "Claude"]
tags:
  - "Jevásio"
  - "Jevhakim"
  - "NLP"
  - "Portuguese"
  - "Arabic"
draft: false
---

A customer writes to a shop in Lisbon:

> Fui cobrado duas vezes pela encomenda 1182. Podem devolver uma das cobranças?

("I was charged twice for order 1182. Can you refund one of the charges?")

Before a person reads this message, software makes some small decisions about it.
Which team gets it: billing, shipping or returns? Does it need an answer today? Is
the customer angry? A voice assistant makes the same kind of decision many times a
day. The user says "acorda-me às sete" ("wake me at seven"). Which of the fifty
installed intents is that: an alarm, a timer or a reminder?

None of these questions is open. Each one has a fixed set of answers. It is a
multiple-choice test, but the usual tool for it is a chat model that writes text.

## The problem with asking a chat model

Give the shop message to a chat LLM with the prompt "Answer billing, shipping or
returns" and you get some text back. Usually the text is "billing". Sometimes it is
"Billing.", or "This looks like a billing issue", or a polite paragraph. You then
write a parser to find the answer in the text. You also want to know how sure the
model is, so that a person can check the doubtful cases. A chat model does not
tell you that. A confidence number that the model writes in its text is not a
measurement.

You also pay for the generated words. Each token of the answer is one more pass
through the model, and on a small device without a GPU that cost is high.

## Decision models

[Kev](https://github.com/jaredpalmer/kev), by Jared Palmer, takes a different
approach. A Kev model reads a **state** (a text or a JSON object) and a set of
**typed questions** about it:

- `choice`: pick one of several options;
- `score`: an ordered level, for example how urgent;
- `noul`: yes or no.

For each question, the model returns one probability for each option. It generates
no text. A small pointer head scores each option against the question in **one
forward pass** of the model. The probabilities are calibrated: when the model says
0.9, it is right about nine times in ten.

Kev-0.8B is good in English. In Portuguese and Arabic it is not. On the intents of a
Portuguese voice assistant, it picks the correct intent for 51 % of the requests.
On the Arabic requests of the MASSIVE dataset, it picks the correct intent for
43.5 %. We needed the same tool in the two languages we work in most, so we trained
two models: **Jevásio** for European Portuguese and **Jevhakim** for Arabic.

## How we trained them

The two models start from the same backbone, `Qwen/Qwen3.5-0.8B-Base`. The backbone
stays frozen. A LoRA adapter (11.3 million trainable parameters for Jevásio) and
Kev's pointer head learn the task. Training a small adapter on a frozen model has
an advantage: the training of the 0.8B model takes hours on one consumer GPU, not
days on a cluster.

The real work was the data. A decision model learns from questions with known
answers, and nobody publishes a dataset of typed questions in European Portuguese.
But there are many labelled datasets that we can turn into questions:

- An intent dataset becomes a `choice` question: "Which of these requests is the
  user making?", with one option per intent.
- A sentiment dataset becomes a `score` question.
- A news archive with sections becomes "Which section is this article from?"
- A parliament record becomes "How did this party vote?"
- A dataset of Portuguese varieties becomes "Is this text from Portugal or Brazil?"

Jevásio-0.8B-V2 reads 267,950 Portuguese requests made in this way, plus 12,576
English records. The English records keep the model from forgetting what Kev
already knew. 63 of the sources carry their own labels. A teacher model,
AMALIA-9B, labelled the rest.

For Jevhakim we set a stricter rule: **no model writes a label**. The 442,627
training requests come from 58 public Arabic sources with labels written by people
or by the source design. The sources cover Modern Standard Arabic and the
dialects: dialect identification, sarcasm, offensive language and hate speech,
fact checking, propaganda, sentiment, entailment, translation pairs and intent
routing.

Some sources share rows. Several Arabic Twitter datasets contain the same tweets
under different labels. If a tweet is in the training data of one source and in
the held-out data of another, the test score is false. The build found 9,800
such rows and removed them from the training split.

## Does it work?

On a held-out Portuguese test set of 37,972 requests, Jevásio-0.8B-V2 is correct
for 77.5 % of the questions. The first version was correct for 66.0 %. The
calibration error (ECE) is 0.016, which means that its probabilities are honest.

For Jevhakim, the Arabic test set has 141,217 questions. It includes 22 sources that
the model never saw in training.

| | Kev-0.8B | Jevhakim-0.8B |
| :--- | ---: | ---: |
| Accuracy | 0.503 | 0.661 |
| Share of questions answered at confidence ≥ 0.9 | 0.050 | 0.366 |
| Accuracy on those questions | 0.926 | 0.940 |

The last two rows are the important ones for real use. Jevhakim is sure (0.9 or
higher) about one question in three, and when it is sure it is right 94 % of the
time. Kev is sure about one question in twenty. Thus you can send the sure answers
straight through and send only the rest to a person.

<picture>
  <source srcset="/blog/jevasio/jevhakim-per-source-dark.svg" media="(prefers-color-scheme: dark)">
  <img src="/blog/jevasio/jevhakim-per-source-light.svg" alt="Dot plot of accuracy per Arabic test source for Kev-0.8B and Jevhakim-0.8B. Jevhakim is higher on every trained source, for example arafacts 0.097 to 0.763, and slightly lower on the unseen belebele_ar and arabic_mmlu." width="800" loading="lazy">
</picture>

Some tasks changed a lot. Some sources check whether an Arabic claim is true:
Kev scored 0.097 on arafacts and Jevhakim scores 0.763. Detection of unsafe
prompts (guardrail) went from 0.392 to 0.894. Translation pairs in Egyptian Arabic
went from 0.614 to 0.980. On two sources that it never saw in training, belebele_ar and
arabic_mmlu (reading comprehension and exam questions), Jevhakim is slightly below
Kev.

## What you can do with them

### Sort a support inbox

Here is the shop message, with two questions. The code uses the Kev client and a
local Kev server that runs Jevásio:

```python
from typesafe_sdk import Choice, Noul, TypeSafeClient

client = TypeSafeClient(api_key="local", base_url="http://127.0.0.1:8008", model="kev-latest")
response = client.system_one(
    state={"request": "Fui cobrado duas vezes pela encomenda 1182. Podem devolver uma das cobranças?"},
    questions={
        "team": Choice(instructions="Que equipa deve tratar deste pedido?",
                       criteria={"billing": "Cobranças e reembolsos",
                                 "shipping": "Entregas",
                                 "returns": "Trocas"}),
        "urgent": Noul(instructions="Este pedido precisa de resposta hoje?"),
    },
)
print(response.choices["team"].choice, response.nouls["urgent"].noul)
```

Write the keys in English and the values in Portuguese, as in the training data.
The [model card](https://huggingface.co/TigreGotico/jevasio-0.8b-v2) shows how to
start the server.

### Moderate and check Arabic text

The Jevhakim training sources include offensive language, cyberbullying, hate
speech, propaganda and check-worthy claims, in MSA and in the dialects. One model
answers all of these questions. You do not train and deploy one classifier per
task. The training set is public as
[jevhakim-decisions](https://huggingface.co/datasets/TigreGotico/jevhakim-decisions),
so you can see exactly which tasks it knows.

## Try it

Each model has a demo Space:
[Jevásio](https://huggingface.co/spaces/Jarbas/jevasio) and
[Jevhakim](https://huggingface.co/spaces/Jarbas/jevhakim). We sent real requests
with four options (weather, timer, music, alarm):

| Request | Answer | Probability |
| :--- | :--- | ---: |
| Vai chover amanhã em Lisboa? | weather | 0.983 |
| Põe um temporizador de dez minutos | timer | 0.989 |
| Acorda-me às sete da manhã | alarm | 0.994 |
| كيف الطقس في الرياض اليوم؟ | weather | 1.000 |
| شغل لي أغنية لفيروز | music | 1.000 |
| صحيني الساعة سبعة الصبح | alarm | 0.982 |

A warm request takes 243 to 323 ms on the Space's GPU. A cold start takes some
seconds.

## Where they fail

The yes or no questions are the weak point. For "quero trocar" ("I want to
exchange it"), Jevásio gives 0.514 to "Does the customer ask for a refund?". That
is a coin toss, not an answer. Jevhakim gives 0.318 to "Is the customer angry?" for
a text that is plainly angry.

Jevásio gains almost nothing on kinds of task that it did not train on (0.477 to
0.479). Jevhakim is overconfident on new kinds of task (ECE 0.09 to 0.21), so check
its probabilities before you trust them on a new task. We have no accuracy figure
for each Arabic dialect.

The licence is also a limit. The training data is share-alike and non-commercial,
so both models are CC BY-NC-SA 4.0. For commercial use, Kev-0.8B (Apache-2.0) is
the path.

## Get them

- Models: [jevasio-0.8b-v2](https://huggingface.co/TigreGotico/jevasio-0.8b-v2),
  [jevasio-4b-v2](https://huggingface.co/TigreGotico/jevasio-4b-v2),
  [jevhakim-0.8b](https://huggingface.co/TigreGotico/jevhakim-0.8b) and
  [jevhakim-4b](https://huggingface.co/TigreGotico/jevhakim-4b).
- Datasets: [jevasio-decisions-v2](https://huggingface.co/datasets/TigreGotico/jevasio-decisions-v2)
  and [jevhakim-decisions](https://huggingface.co/datasets/TigreGotico/jevhakim-decisions).
- Every figure above is for the 0.8B models.

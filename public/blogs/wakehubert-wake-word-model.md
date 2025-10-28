---
title: "WakeHuBert — Train a Wake Word Model Without Any Real Recordings"
date: "2024-10-28"
author: "Tech Team"
excerpt: "A modern, privacy-friendly, open-source alternative for wake-word detection using self-supervised speech embeddings and synthetic data generation."
tags: ["machine learning", "speech recognition", "open source", "privacy", "ai"]
featured: false
---

# 🗣️ WakeHuBert — Train a Wake Word Model Without Any Real Recordings

### A modern, privacy-friendly, open-source alternative for wake-word detection

---

Training a wake-word model traditionally meant recording hundreds (or thousands) of examples of your chosen phrase — "Hey Computer," "Jarvis," or whatever you wanted your assistant to respond to.
Projects like **Mycroft Precise** made this possible with MFCC features and a small GRU network, but the process was **tedious**, **data-hungry**, and **hard to generalize** across different voices or microphones.

**WakeHuBert** changes that.

It uses **self-supervised speech embeddings** from **HuBERT** and a **synthetic data generation pipeline** capable of simulating new voices, environments, and speaking styles — meaning **no human recordings are required** to train a reliable wake-word detector.

---

## 🧩 Inspired by openWakeWord — but going further

The excellent **openWakeWord** project proved that wake-word models can be trained entirely from **synthetic text-to-speech (TTS)** data.
It's free, open-source, and even powers **Home Assistant's voice control system**.

openWakeWord's architecture is built around three modular components:

1. **Preprocessing** — a fixed ONNX implementation of Torch's melspectrogram to ensure consistent feature extraction across devices.
2. **Feature extraction backbone** — a small convolutional model based on Google's Speech Embedding network, originally released via TensorFlow Hub under Apache-2.0. This backbone turns spectrograms into reusable speech embeddings.
3. **Classifier head** — typically a shallow MLP or RNN that learns to recognize specific wake phrases.

This design already enables good performance — especially considering it trains purely on synthetic speech.

But openWakeWord's **TTS-only data** can sound robotic and lacks real acoustic variability. The result is a model that works, but sometimes struggles with background noise, accents, and specific voices.

That's where WakeHuBert takes the next step.

---

## 🔊 WakeHuBert's Approach: Better Embeddings + Better Synthetic Data

WakeHuBert swaps the handcrafted convolutional backbone for **DistilHuBERT**, a lightweight self-supervised model trained on thousands of hours of natural speech.
Instead of melspectrograms, it works directly on raw waveforms — HuBERT already knows how to extract high-level phonetic and temporal features.

### Architecture overview

```
Audio → HuBERT Encoder (frozen) → GRU → Linear → Sigmoid
```

The framework also includes CNN and FNN variants, but the **GRU-based head** performs best for wake phrases, capturing short temporal patterns like "hey computer" or "ok mirror" with minimal training.

This simplicity means you can train an effective wake-word model in just a few epochs, without any pre-recorded data or crowd-sourced samples.

---

## 🧠 Smarter Synthetic Data

Where openWakeWord relies solely on TTS, WakeHuBert uses **voice cloning and dynamic audio augmentation** to create much more realistic examples.

The dataset pipeline applies a series of probabilistic transformations:

* 🎙️ **Voice conversion** — re-voices a wake sample using a `ChatterboxOnnx` model to simulate a new speaker.
* 🌆 **Noise mixing** — adds background and microphone noise from local folders at random SNRs.
* 🏠 **Room reverb** — convolves with randomly selected Room Impulse Responses (RIRs).
* 🎵 **Pitch & speed perturbation** — shifts tone and tempo slightly for diversity.

Every sample is unique — each epoch presents a new combination of voices, noise, and acoustic conditions.

This approach produces wake phrases that sound natural and diverse, dramatically reducing overfitting and making training fast and stable.

---

## ⚙️ The Training Framework

Training is handled by a single class in `trainer.py`, designed to be simple but powerful.

Key features include:

* **Binary Cross-Entropy (BCEWithLogitsLoss)** for wake/non-wake detection
* Optional **Triplet Loss** regularization for embedding separation
* **Hard negative mining** — reinserts false positives into the next epoch
* **Automatic checkpointing** and **MLflow integration** for experiment tracking
* Detailed metrics and logging built in

Thanks to the frozen HuBERT encoder, training typically converges within a few epochs — much faster than MFCC-based approaches that require long, data-heavy sessions.

---

## 🧩 Export and Deployment

Once trained, models can be exported to **ONNX**.

The exported model runs efficiently on **onnxruntime**, supports dynamic input lengths, and performs inference in real time on standard CPUs — perfect for edge devices and offline assistants.

---

## 🗨️ Key Advantages

**WakeHuBert** offers several compelling benefits over traditional approaches:

1. **No Data Collection** — Train without recording hundreds of samples
2. **Privacy-First** — Everything runs locally, no cloud dependencies
3. **Fast Training** — Converges in just a few epochs
4. **Better Generalization** — Synthetic diversity handles real-world variability
5. **Lightweight** — Runs efficiently on edge devices and CPUs
6. **Open Source** — Fully transparent and customizable

---

## 📊 Performance Metrics

The framework includes comprehensive evaluation tools:

* Wake word detection accuracy
* False positive rates across different noise conditions
* Latency benchmarks
* Memory footprint analysis

By combining strong pre-trained embeddings with realistic synthetic augmentation, WakeHuBert demonstrates that **wake-word models can be accurate, lightweight, and privacy-friendly — without any recorded speech.**

---

## 🚀 Getting Started

The framework is designed to be developer-friendly:

1. Define your wake phrase
2. Configure data augmentation settings
3. Train on synthetic data
4. Export to ONNX format
5. Deploy on your device

No microphone recording, no crowdsourced datasets — just code and configuration.

---

## In Summary

WakeHuBert is a **developer-friendly, open-source framework** for wake-word detection that removes data collection from the equation.
It combines HuBERT's powerful self-supervised embeddings with a fully synthetic data pipeline — enabling anyone to train and deploy reliable wake-word models that run locally, efficiently, and privately.

> *Train your own wake-word model — no dataset, no microphone, just code.*

By combining strong pre-trained embeddings with realistic synthetic augmentation, WakeHuBert shows that **wake-word models can be accurate, lightweight, and privacy-friendly — without any recorded speech.**

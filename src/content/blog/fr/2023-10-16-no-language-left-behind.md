---
title: "Aucune langue laissée pour compte"
description: "Éliminer les barrières linguistiques dans OpenVoiceOS grâce à la détection de langue, aux plugins de traduction et aux capacités de traduction bidirectionnelle."
date: 2023-10-16
updated: 2026-08-01
lang: fr
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "multilingual"
  - "language-detection"
  - "translation"
  - "accessibility"
draft: false
---

> Cet article a été initialement publié sur mon blog personnel (aujourd'hui disparu)

OpenVoiceOS (OVOS) est une plateforme d'assistant vocal open source, portée par la communauté. Cet article présente les plugins de détection de langue, de traduction et de traduction bidirectionnelle que j'ai développés pour permettre à OVOS de fonctionner dans des langues bien au-delà de ce que les skills installées prennent nativement en charge.


## Détection de langue à partir de l'audio

OVOS identifie la langue parlée dans l'audio avant que celui-ci n'atteigne l'étape de transcription ASR, ce qui permet au plugin ASR de transcrire avec précision plutôt que de deviner. J'ai développé plusieurs plugins pour cela :

- [ovos-audio-transformer-plugin-speechbrain-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechbrain-langdetect)
- [ovos-audio-transformer-plugin-speechflow-langdetect](https://github.com/OpenVoiceOS/ovos-audio-transformer-plugin-speechflow-langdetect)
- [ovos-stt-plugin-fasterwhisper](https://github.com/OpenVoiceOS/ovos-stt-plugin-fasterwhisper)

La détection de langue est limitée aux langues indiquées dans votre configuration OVOS — les classifications en dehors de cet ensemble sont rejetées, afin que vous ne basculiez pas accidentellement vers une langue que personne dans votre foyer ne parle.

```json
{
  "lang": "en-us",
  "secondary_langs": ["pt-pt", "fr-fr"]
}
```

### Configuration

La taille du modèle de classification de langue de FasterWhisper est configurable :

```json
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-fasterwhisper": {
            "model": "small"
        }
    }
}
```

## Traduction de langue de texte

[No Language Left Behind (NLLB)](https://ai.meta.com/research/no-language-left-behind/) est le modèle open source de Meta pour une traduction directe de haute qualité entre 200 langues — y compris des langues à faibles ressources comme l'asturien, le luganda et l'ourdou. C'est ce nom qui a inspiré cet article.

Le [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb) exécute NLLB localement au sein d'OVOS. Les skills sont lentes à acquérir une prise en charge native complète des langues, mais avec ce plugin, les utilisateurs n'ont plus besoin d'attendre — OVOS traduit à la volée les énoncés entrants et les réponses sortantes, de sorte que n'importe quelle skill fonctionne dans n'importe laquelle de ces 200 langues.

Pour du matériel moins puissant, le [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin) délègue la traduction à un serveur distant. Des serveurs publics sont répertoriés d'origine ; l'auto-hébergement est fortement recommandé pour des raisons de confidentialité. **Utiliser un serveur public signifie confier tous vos énoncés à son opérateur.**

Plugins de traduction à retenir :
- [ovos-translate-plugin-nllb](https://github.com/OpenVoiceOS/ovos-translate-plugin-nllb)
- [ovos-translate-server-plugin](https://github.com/OpenVoiceOS/ovos-translate-server-plugin)

### Configuration

```json
"language": {
    "detection_module": "ovos-lang-detect-ngram-lm",
    "translation_module": "ovos-translate-plugin-nllb",
    "ovos-translate-plugin-nllb": {
        "model": "nllb-200_600M_int8"
    }
}
```

## Le plugin de traduction bidirectionnelle d'OVOS

Le [plugin de traduction bidirectionnelle d'OVOS](https://github.com/OpenVoiceOS/ovos-bidirectional-translation-plugin/tree/dev) relie la détection et la traduction avec deux étapes de pipeline : un **Utterance Transformer** (traduit le texte entrant vers la langue configurée d'OVOS) et un **Dialog Transformer** (traduit la réponse dans la langue d'origine de l'utilisateur).

Le mode optionnel `verify_lang` recoupe la langue détectée du texte avec la langue de la session — utile sur les plateformes de chat où une seule instance OVOS sert des utilisateurs multilingues. Il requiert un [module de détection de langue](https://openvoiceos.github.io/ovos-technical-manual/lang_support/) configuré dans `language.detection_module` ainsi qu'un plugin de traduction (`ovos-translate-plugin-nllb` pour le local ou `ovos-translate-server-plugin` pour le distant).

### Configuration

```json
"utterance_transformers": {
    "ovos-utterance-translation-plugin": {
        "bidirectional": true,
        "verify_lang": false,
        "ignore_invalid_langs": true,
        "translate_secondary_langs": true
    }
},
"dialog_transformers": {
    "ovos-dialog-translation-plugin": {}
}
```

## Comment le tout fonctionne ensemble

Chaque composant est utile de façon indépendante, mais ils se composent proprement :

1. **Détection de langue de l'audio** — indique au plugin ASR quelle langue transcrire.
2. **Traduction de l'énoncé** — convertit les énoncés non natifs vers la langue configurée de l'assistant avant la correspondance des skills.
3. **Traduction du dialogue** — traduit la réponse de l'assistant dans la langue de l'utilisateur avant le TTS.

Résultat : OVOS peut traiter n'importe laquelle des 200 langues de NLLB de bout en bout, sans que les skills elles-mêmes aient besoin de traductions.

Les contributions et les traductions de skills sont les bienvenues sur [OpenVoiceOS sur GitHub](https://github.com/OpenVoiceOS).

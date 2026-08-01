---
title: "Apresentamos o Primeiro Phonemizer para Barranquenho"
description: "O g2p_barranquenho é o primeiro conversor aberto de grafema-para-fonema para barranquenho, a língua de contacto ibero-românica de Barrancos, Portugal — regras derivadas da convenção ortográfica recém-publicada pelo município, auditáveis face às fontes incluídas no repositório."
date: 2025-12-12
updated: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Phonemization"
  - "Barranquenho"
  - "Minority Languages"
  - "NLP"
draft: false
---

O [g2p_barranquenho](https://github.com/TigreGotico/g2p_barranquenho) é o primeiro conversor aberto de grafema-para-fonema para [barranquenho](https://en.wikipedia.org/wiki/Barranquenho), uma língua de contacto ibero-românica falada em Barrancos, Portugal — um município na fronteira espanhola onde o português e o espanhol estremenho/andaluz coexistem há séculos.

### O que torna o barranquenho fonologicamente interessante

O barranquenho não é um dialeto do português nem do espanhol; é um sistema genuinamente distinto. A Câmara Municipal de Barrancos publicou recentemente três documentos fundacionais — um dicionário, uma convenção ortográfica e uma gramática básica — que forneceram as regras de que precisávamos. O anúncio: ["Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha!"](https://cm-barrancos.pt/21976/un-enormi-passu-para-u-barranquenhu-i-para-a-cultura-barranquenha).

A partir dessa convenção ortográfica derivámos o conjunto de regras — mas em vez de construirmos manualmente uma passagem específica sobre o texto, ela vive como uma spec de língua, `ext-PT-x-barrancos`, no motor partilhado **[orthography2ipa](https://github.com/TigreGotico/orthography2ipa)**. A tabela de grafemas, as regras de alofonia, o modelo de acento tónico e o sandhi entre palavras dessa spec descrevem todas as realizações do barranquenho: os grafemas de várias letras colapsam da forma documentada pela convenção (`tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/), os ditongos nasais surgem antes de `m`/`n`, `v` mapeia sempre para /b/, e `h` surge como um /h/ pronunciado — ao contrário de qualquer das línguas-mãe.

O próprio `g2p_barranquenho` é um wrapper fino do lado do chamador em torno de `orthography2ipa.G2P`, orientado por essa spec: encarrega-se da normalização de texto (uniformização de maiúsculas/minúsculas, tokenização nas formas que a spec espera), da expansão de números e de uma superfície estável `phonemize`/`transcribe`, mas não das regras fonológicas — melhorar uma regra significa editar a spec a montante, pelo que todos os consumidores a jusante partilham a correção.

Na prática:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ˈũ eˈnɔɾmi ˈpas̺u ˈpaɾɐ ˈu bɐrɐ̃ˈkɛɲu ˈi ˈpaɾɐ ɐ kuˈltuɾɐ bɐrɐ̃ˈkɛɲɐ`

Os PDFs de origem (convenção, dicionário, gramática) estão incluídos na raiz do repositório para que as regras sejam auditáveis face à sua fonte.

### O que vem a seguir

Um conversor G2P é o pré-requisito mínimo para trabalho de TTS e ASR. Sem ele, um modelo treinado em texto não tem fundamentação fonética com princípio. Com ele, o caminho para um modelo de voz barranquenho segue o mesmo pipeline híbrido que usámos para o asturiano e o aragonês — o obstáculo são os dados de fala, não as ferramentas.

**Se tiver gravações de barranquenho falado ou acesso a falantes dispostos a contribuir sob uma licença aberta, entre em contacto.** Gravações de falantes nativos, mesmo umas poucas horas, tornariam viável um modelo de TTS.

→ [g2p_barranquenho no GitHub](https://github.com/TigreGotico/g2p_barranquenho)

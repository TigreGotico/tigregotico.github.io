---
title: "Apresentamos o Primeiro Phonemizer para Barranquenho"
description: "O g2p_barranquenho é o primeiro conversor aberto de grafema-para-fonema para barranquenho, a língua de contacto ibero-românica de Barrancos, Portugal — regras derivadas da convenção ortográfica recém-publicada pelo município, auditáveis face às fontes incluídas no repositório."
date: 2025-12-12
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

A partir dessa convenção ortográfica derivámos o conjunto de regras. O phonemizer faz duas passagens sobre a entrada em minúsculas:

1. **Passagem de dígrafos** — colapsa grafemas de várias letras: `tch` → /tʃ/, `ch` → /ʃ/, `nh` → /ɲ/, `lh` → /ʎ/, e `qu`/`gu` antes de vogais anteriores → /k//g/.
2. **Passagem de grafemas** — mapeia os restantes caracteres para IPA com regras sensíveis ao contexto: ditongos nasais antes de `m`/`n` (por exemplo, `an` → /ɐ͂/), `e` em final de palavra → /ɨ/, `v` sempre → /b/, `s` sonorizado para /z/ exceto em início de palavra, `r` vs `rr` (vibrante simples vs múltipla), e `h` como /h/ pronunciado — ao contrário de qualquer das línguas-mãe.

O grafema `x` tem a lógica mais complexa, recorrendo às heurísticas contextuais do português onde a convenção barranquenha é omissa.

Na prática:

> "Un Enormi Passu para u Barranquenhu i para a Cultura Barranquenha" → `ũ ẽjoɾmj pasu paɾɐ u bɐrɐ͂keɲu j paɾɐ ɐ kultuɾɐ bɐrɐ͂keɲɐ`

A biblioteca é uma única função, `phonemize(word: str) -> list[str]`, sem dependências em tempo de execução — Python puro. Os PDFs de origem (convenção, dicionário, gramática) estão incluídos na raiz do repositório para que as regras sejam auditáveis face à sua fonte.

### O que vem a seguir

Um conversor G2P é o pré-requisito mínimo para trabalho de TTS e ASR. Sem ele, um modelo treinado em texto não tem fundamentação fonética com princípio. Com ele, o caminho para um modelo de voz barranquenho segue o mesmo pipeline híbrido que usámos para o asturiano e o aragonês — o obstáculo são os dados de fala, não as ferramentas.

**Se tiver gravações de barranquenho falado ou acesso a falantes dispostos a contribuir sob uma licença aberta, entre em contacto.** Gravações de falantes nativos, mesmo umas poucas horas, tornariam viável um modelo de TTS.

→ [g2p_barranquenho no GitHub](https://github.com/TigreGotico/g2p_barranquenho)

---
title: "Duas Vozes, Todas as Línguas: Miro & Dii"
description: "A TigreGótico está a associar-se ao OpenVoiceOS para dar ao assistente duas identidades de voz consistentes, Miro e Dii, que soam da mesma forma em todas as línguas, construídas com a nossa tecnologia de clonagem de voz e o motor phoonnx. Dois modelos de TTS para cada língua que alguém peça, línguas ameaçadas incluídas."
date: 2026-06-15
lang: pt
author: "Casimiro Ferreira"
tags:
  - "phoonnx"
  - "TTS"
  - "OVOS"
  - "voice cloning"
  - "G2P"
  - "language inclusion"
draft: false
---

> **Ouça-as agora:** a [Demo de Vozes](../../demo) corre o Miro e a Dii ao vivo no seu
> navegador. Escolha uma língua, escreva uma frase e ouça. Sem instalação, sem servidor.

As pessoas recordam a voz de um assistente mais do que o seu nome. Por isso, a pergunta central da nossa parceria com o [OpenVoiceOS](https://www.openvoiceos.org/) é prática: com quem deve o assistente parecer-se, em todas as línguas?

A resposta é **Miro** (masculino) e **Dii** (feminino), duas identidades de voz que se mantêm ao longo de todas as línguas que o OpenVoiceOS suporta. Um utilizador que configura o assistente em Lisboa e mais tarde muda para alemão ouve o mesmo falante familiar em ambas.

## Uma identidade, muitas línguas

A forma habitual de obter uma voz multilingue é treinar um único modelo em muitas línguas de uma só vez. Funciona, mas tende a borrar o resultado: os sotaques transbordam de umas línguas para as outras e a pronúncia fica aproximada.

Nós construímos antes um modelo por língua, cada um treinado apenas nessa língua. Para manter todos esses modelos a soar como a mesma pessoa, clonamos cada modelo monolingue do Miro a partir da mesma identidade de origem, e o mesmo para a Dii. Assim, um ouvinte obtém pronúncia de qualidade nativa em cada língua, e continua a reconhecer a mesma voz ao passar de uma para a outra.

Estes modelos são treinados e servidos com o [**phoonnx**](https://github.com/TigreGotico/phoonnx), a nossa framework aberta de TTS: construída sobre VITS (uma arquitetura neuronal de texto-para-fala), exportada para ONNX, e apenas em CPU na inferência. Correm totalmente offline, sem nuvem, sem chave de API e sem dados a saírem do seu hardware. Dentro do OpenVoiceOS, o plugin `ovos-tts-plugin-phoonnx` trata de as obter e carregar. Para a história completa do hardware e da arquitetura, veja [TTS Que Corre numa Batata](/pt/blog/2026-05-10-tts-that-runs-on-a-potato).

## A investigação de G2P que o torna possível

Falar bem uma língua exige mais do que uma voz. Exige saber como a escrita deve soar. Esse é o trabalho da conversão grafema-para-fonema (G2P): transformar texto escrito na sequência de fonemas que o modelo pronuncia. Cada nova língua que abraçamos precisa primeiro da sua própria investigação de G2P, e essa investigação é a maior parte do verdadeiro trabalho.

O phoonnx consegue conduzir uma gama de fonemizadores: eSpeak, Gruut, Epitran, o [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) baseado em modelos, e ferramentas específicas de cada língua onde os motores gerais ficam aquém. A nossa [investigação de ortografia-para-IPA](/pt/blog/2026-01-15-grapheme-to-ipa-for-350-languages) e os [fonemizadores lusófonos](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes) que construímos para a família portuguesa alimentam o mesmo objetivo: IPA preciso para línguas que os grandes fornecedores de TTS nunca se deram ao trabalho de modelar com cuidado. Quando uma língua não tem um bom fonemizador pronto a usar, essa lacuna é o projeto. Fazemos primeiro a investigação de grafia-para-som, e depois a voz vem a seguir.

## Dois modelos para cada língua pedida

A oferta que é o coração da parceria: para cada língua que alguém peça, construímos dois modelos de TTS, Miro e Dii. Isto é um compromisso permanente, não um roteiro. Peça uma língua, e o par chega até ela.

Queremos dizer todas as línguas, não apenas as que têm mais falantes. As línguas ameaçadas e minoritárias, as que o TTS mainstream ignora porque o mercado é pequeno, são exatamente o que queremos alcançar: comunidades que nunca tiveram uma voz sintética própria.

À data desta publicação, a [coleção de modelos de TTS phoonnx](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) no Hugging Face lista 13 línguas com pelo menos uma voz lançada. Oito dessas, basco, árabe, português europeu, asturiano, aragonês, frísio, occitano e espanhol colombiano, já têm tanto o Miro como a Dii disponíveis.

## Aberto e auto-alojado

As vozes são gratuitas e de código aberto. Correm offline e auto-alojadas, para que nada do que diz saia do seu hardware. Toda a stack, o motor, os fonemizadores, a investigação de G2P e as vozes treinadas, é aberta para uma comunidade pegar e manter.

Se a sua língua ainda não estiver na lista, peça-a.

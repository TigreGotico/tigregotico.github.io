---
title: "Duas Vozes, Todas as Línguas: Miro & Dii"
description: "A TigreGótico está a associar-se ao OpenVoiceOS para dar ao assistente duas identidades de voz consistentes — Miro e Dii — que soam da mesma forma em todas as línguas, construídas com a nossa tecnologia de clonagem de voz e o motor phoonnx. Dois modelos de TTS para cada língua que alguém peça, línguas ameaçadas incluídas."
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
> navegador — escolha uma língua, escreva uma frase e ouça. Sem instalação, sem servidor.

As pessoas recordam a voz de um assistente mais do que o seu nome. Por isso, a pergunta central da nossa parceria com o [OpenVoiceOS](https://www.openvoiceos.org/) é prática: com quem deve o assistente parecer-se, em todas as línguas?

A resposta é **Miro** (masculino) e **Dii** (feminino) — duas identidades de voz que se mantêm ao longo de todas as línguas que o OpenVoiceOS suporta. Um utilizador que configura o assistente em Lisboa e mais tarde muda para alemão deve ouvir o mesmo falante familiar. Uma voz de marca, todas as línguas, propriedade da comunidade.

## Uma identidade, muitas línguas

A forma habitual de obter uma voz multilingue é treinar um único modelo em muitas línguas de uma só vez. Funciona, mas tende a borrar o resultado: os sotaques transbordam de umas línguas para as outras, a pronúncia fica aproximada e a voz perde a nitidez de um falante nativo.

Nós escolhemos o caminho mais difícil. Para cada língua construímos um modelo **monolingue** — um modelo, uma língua, treinado para fazer bem essa língua. O truque que os une é a **clonagem de voz**: cada modelo monolingue do Miro é clonado a partir da mesma identidade de origem, e o mesmo para a Dii. O resultado é uma família de modelos por língua que falam cada um como um nativo, mas partilham todos o mesmo timbre, o mesmo carácter, a mesma Miro-idade ou Dii-idade. Obtém pronúncia de qualidade nativa *e* uma única identidade reconhecível, em vez de trocar uma pela outra.

Estes modelos são treinados e servidos com o [**phoonnx**](https://github.com/TigreGotico/phoonnx), a nossa framework aberta de TTS — baseada em VITS, exportada para ONNX, apenas em CPU. As vozes correm totalmente offline; sem nuvem, sem chave de API, sem dados a saírem do seu hardware. Dentro do OpenVoiceOS, o plugin `ovos-tts-plugin-phoonnx` trata de as obter e carregar. Para a história completa do hardware e da arquitetura, veja [TTS Que Corre numa Batata](/pt/blog/2026-05-10-tts-that-runs-on-a-potato).

## A investigação de G2P que o torna possível

Falar bem uma língua não tem só a ver com a voz — tem a ver com saber como a escrita *deve* soar. Esse é o trabalho da conversão **grafema-para-fonema (G2P)**: transformar texto escrito na sequência de fonemas que o modelo de facto pronuncia. Cada nova língua que abraçamos vem com a sua própria investigação de G2P, e é nessa investigação que vive grande parte do verdadeiro trabalho.

O phoonnx é deliberadamente flexível aqui. Consegue conduzir toda uma gama de fonemizadores — eSpeak, Gruut, Epitran, o [ByT5 G2P](https://huggingface.co/collections/OpenVoiceOS/g2p-models-6886a8d612825c3fe65befa0) baseado em modelos, e ferramentas específicas de cada língua onde os motores gerais ficam aquém. Isto liga-se diretamente à nossa stack de fonética mais ampla: a nossa **[investigação de ortografia-para-IPA](/pt/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** e os **[fonemizadores lusófonos](/pt/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** que construímos para a família portuguesa alimentam o mesmo objetivo — IPA preciso para línguas que os grandes fornecedores de TTS nunca se deram ao trabalho de modelar com cuidado. Quando uma língua não tem um bom fonemizador pronto a usar, essa lacuna *é* o projeto. Fazemos primeiro a investigação de grafia-para-som, e depois a voz vem a seguir.


## Dois modelos para cada língua pedida

Eis a oferta concreta, e é o coração da parceria: **para cada língua que alguém peça, construiremos dois modelos de TTS — Miro e Dii.** Não um roteiro de talvez-um-dia; um compromisso permanente. Peça uma língua, e o par universal chega até ela.

E queremos dizer *todas* as línguas, não apenas as confortáveis e comercialmente óbvias. As vozes que faltam ao mundo raramente são as que têm cem milhões de falantes — são as **línguas ameaçadas e minoritárias** que o TTS mainstream ignora discretamente porque o mercado é demasiado pequeno para valer a pena. São exatamente essas as línguas que queremos alcançar: comunidades que nunca tiveram uma voz sintética de alta qualidade a que chamar sua, e que não têm razão nenhuma para esperar que um fornecedor de Silicon Valley alguma vez a proporcione.

Isto não é uma promessa para mais tarde. À data desta publicação, a [**coleção de modelos de TTS phoonnx**](https://huggingface.co/collections/TigreGotico/phoonnx-tts-models) no Hugging Face lista 13 línguas com pelo menos uma voz lançada, e 8 dessas — basco, árabe, português europeu, **asturiano**, **aragonês**, **frísio**, occitano e espanhol colombiano — já têm tanto o Miro como a Dii disponíveis.

## Aberto e auto-alojado

As vozes são **gratuitas e de código aberto**, correm **offline e auto-alojadas** para que nada do que diz saia do seu hardware, e toda a stack — o motor, os fonemizadores, a investigação de G2P, as vozes treinadas — é aberta para uma comunidade pegar e manter.

Se a sua língua ainda não estiver na lista, isso não é uma porta fechada — é um pedido à espera de ser feito.

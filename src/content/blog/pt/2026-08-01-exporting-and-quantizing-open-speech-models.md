---
title: "Exportar e Quantizar Modelos de Fala Abertos Para Que Realmente Funcionem"
description: "Um modelo de fala treinado numa página de investigação do GitHub não é um assistente de voz. Convertemos checkpoints abertos de ASR e TTS para ONNX, CoreML e GGUF, quantizamo-los e validamos o resultado. Depois publicamos os resultados sob o OpenVoiceOS para que cada língua que cobrem chegue a um assistente real e offline."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "CoreML"
  - "GGUF"
  - "ASR"
  - "OVOS"
  - "OpenVoiceOS"
  - "Quantization"
  - "Open Source"
draft: false
---

Um modelo de reconhecimento de fala publicado como checkpoint de investigação é normalmente uma pasta de pesos PyTorch, um script de treino e uma nota a dizer em que GPU foi treinado. Isso chega para reproduzir uma pontuação de benchmark. Não chega para o colocar num Raspberry Pi, num telemóvel ou num portátil sem ligação à internet. Ir de um ponto ao outro é trabalho de conversão. É a maior parte daquilo que determina se um modelo de fala aberto alguma vez chega a um dispositivo real.

Fazemos esse trabalho de conversão profissionalmente. Pegamos em modelos abertos de ASR (reconhecimento automático de fala, ou seja, fala-para-texto) e de TTS (texto-para-fala) e transformamo-los em ficheiros que correm offline, em CPUs comuns ou em aceleradores no dispositivo, sem necessidade de nenhuma stack de treino Python em tempo de execução. A maioria dos resultados é publicada sob a [organização OpenVoiceOS](https://huggingface.co/OpenVoiceOS) no Hugging Face, e não na nossa própria, e essa escolha é deliberada. Mais sobre isso abaixo.

## Porque é que um checkpoint não é um deployment

Um checkpoint PyTorch ou NeMo (a caixa de ferramentas de treino de modelos da NVIDIA) espera um ambiente Python específico: as versões certas de bibliotecas, normalmente uma GPU, e a própria framework de treino só para correr a inferência. Essa stack é grande e muda constantemente. Não é algo que se queira incluir dentro de um assistente de voz que tem de arrancar numa placa pequena.

A exportação de modelos resolve isto convertendo a rede treinada num formato pensado exclusivamente para inferência, sem código de treino, sem autograd (o mecanismo que uma framework usa para calcular gradientes durante o treino), e sem dependência de uma framework específica. Visamos três desses formatos, cada um para uma forma de deployment diferente:

- **[ONNX](https://onnxruntime.ai/)** (Open Neural Network Exchange) é um formato de grafo portável que uma vasta gama de runtimes consegue executar, em CPU ou GPU, em Linux, Windows, macOS ou placas embebidas. É o nosso alvo por defeito porque corre em qualquer lado onde o `onnxruntime` corra, que é praticamente em todo o lado.
- **CoreML** é o formato de inferência no dispositivo da Apple. Um pacote CoreML corre no Neural Engine ou na GPU de um Mac ou iPhone em vez da CPU. Isso importa para reconhecimento de fala em tempo real em hardware Apple.
- **[GGUF](https://github.com/ggml-org/llama.cpp)** é o formato usado pelo `llama.cpp` e pelo seu ecossistema, construído para modelos quantizados ao estilo LLM que precisam de correr com um footprint de memória reduzido. Usamo-lo para os modelos de fala mais recentes, baseados em transformers, que são arquitetonicamente mais próximos de um modelo de linguagem do que de um modelo acústico clássico.

Escolher o alvo certo não é cosmético. Um modelo de ASR baseado em conformer (a arquitetura por trás da maioria dos reconhecedores de fala modernos, combinando convolução e self-attention) converte-se de forma limpa para ONNX ou CoreML. Um modelo de fala baseado em Qwen3 é, no fundo, um modelo de linguagem, pelo que se encaixa naturalmente na pipeline GGUF/`llama.cpp` em vez disso.

## O que a quantização custa, e o que compra

Quantizar significa guardar os pesos de um modelo com menos bits por número: 16 bits, 8 bits ou 4 bits em vez dos floats de 32 bits com que treinou. Números mais pequenos resultam num ficheiro mais pequeno e, em hardware adequado, numa inferência mais rápida, porque há menos dados para mover e aritmética mais barata a fazer.

Podemos apresentar um número exato para essa troca num modelo real. O `nvidia/parakeet-tdt-0.6b-v3` é um modelo de ASR de 0,6 mil milhões de parâmetros. O seu componente CoreML mel-encoder tem 1132,5 MB em precisão total. Paletizado (o termo da Apple para este passo de quantização) para 4 bits, fica com 284,2 MB, uma redução de 3,99x, replicada quase exatamente pelos seus três subcomponentes (encoder, decoder, rede de decisão conjunta). No pacote inteiro, a exportação CoreML não quantizada ronda 1,14 GB, e a versão de 4 bits ronda 293 MB. É essa a diferença entre um modelo que cabe confortavelmente num telemóvel e um que mal cabe.

O custo é a precisão. Menos bits por peso significa menos precisão, e a partir de um certo ponto isso manifesta-se em mais erros de reconhecimento. A forma padrão de medir isso para ASR é a WER (taxa de erro por palavra: a percentagem de palavras que o modelo erra em comparação com uma transcrição correta). É por isso que publicamos vários níveis de quantização do mesmo modelo lado a lado, `4 bits`, `6 bits`, `8 bits` (`int8`) e `fp16`, em vez de escolher um e esperar que sirva para todos os dispositivos. Um telemóvel e um computador de secretária podem dar-se ao luxo de pontos diferentes nessa curva.

## O problema da validação

Uma conversão que silenciosamente produz um resultado pior é mais perigosa do que nenhuma conversão, porque nada nela parece avariado. Carrega, corre, e apenas reconhece fala um pouco pior, ou muito pior numa língua que o utilizador não fala pessoalmente e não consegue verificar de ouvido. A única forma de apanhar isso é comparar o resultado do modelo exportado com a implementação de referência original em áudio real, para cada língua e cada nível de quantização, antes de o publicar.

Isso é o mínimo indispensável para qualquer conversão que publicamos: passar o mesmo áudio pelo modelo de origem e pelo modelo convertido, e confirmar que concordam. Não é um passo glamoroso, mas saltá-lo é como uma "língua suportada" deixa silenciosamente de funcionar.

## Porque é que os modelos vivem sob o OpenVoiceOS, e não sob nós

A exportação de modelos é uma capacidade da empresa. Dê-nos um checkpoint e um dispositivo-alvo, e pomo-lo a correr offline, validado, no nível de quantização que se ajusta ao seu hardware. Mas os modelos convertidos que produzimos a partir de checkpoints abertos e não encomendados vão para o [OpenVoiceOS](https://huggingface.co/OpenVoiceOS), a plataforma aberta de assistente de voz para a qual estes modelos são construídos para correr, não para o nosso próprio namespace.

A razão é direta. É no OpenVoiceOS que os modelos são usados. Um modelo convertido sentado numa conta de empresa é um artefacto simpático. O mesmo modelo, publicado onde o [`ovos-stt-plugin-onnx-asr`](https://github.com/OpenVoiceOS/ovos-stt-plugin-onnx-asr), o [`ovos-stt-plugin-coreml`](https://github.com/TigreGotico/ovos-stt-plugin-coreml) ou o [`ovos-stt-plugin-rover`](https://github.com/TigreGotico/ovos-stt-plugin-rover) o conseguem encontrar pelo nome, é uma língua que um assistente real passa agora a falar ou compreender. Publicar sob a organização da própria plataforma transforma uma conversão em funcionalidade suportada em vez de curiosidade de investigação. É como garantimos que fazer este trabalho uma vez beneficia todas as instalações OpenVoiceOS, não apenas o cliente que o pediu.

Para ficar claro quanto à atribuição: não treinamos estes modelos acústicos de raiz, e não reivindicamos tê-lo feito. A investigação subjacente pertence às equipas que a treinaram: os modelos Parakeet e Conformer da NVIDIA, os modelos IndicConformer do AI4Bharat para línguas indianas, modelos universitários e de institutos públicos como o Proxecto Nós da Galiza ou os modelos Conformer do centro HiTZ basco, e esforços independentes de conversão de modelos para línguas africanas e minoritárias. O que acrescentamos é a conversão, a quantização, a verificação de correção face ao original, e a ligação ao plugin que permite a um assistente carregar o resultado pelo nome.

A escala desse trabalho de conversão, contada diretamente a partir do que está publicado, reparte-se assim. Mais de noventa variantes do ASR Parakeet (em tamanhos, línguas e níveis de quantização) são exportadas para ONNX e CoreML. Há mais de trinta modelos Conformer da NVIDIA, vinte e dois modelos IndicConformer do AI4Bharat cobrindo línguas indianas de poucos recursos, e vinte e dois modelos wav2vec2 para línguas incluindo sueco, islandês, feroês, finlandês e ambas as formas escritas do norueguês. Nove modelos Conformer cobrem basco e galego, e modelos Whisper e wav2vec2 convertidos independentemente cobrem línguas africanas e crioulas como shona, zulu, xhosa, malgaxe, crioulo haitiano e cabila. Contando apenas conversões de ASR confirmadas por código de língua distinto, isso são pelo menos 74 línguas diferentes com um reconhecedor de fala offline e quantizado disponível hoje. Essa contagem não inclui o catálogo separado de vozes de TTS exportadas para línguas como basco, aragonês, asturiano, galego, occitano e árabe.

## Se a sua língua ou o seu dispositivo não têm nada offline hoje

A maioria das línguas nunca chega a ter uma opção comercial de fala offline, porque o mercado só para essa língua não justifica um fornecedor construir uma. O padrão acima não depende da dimensão do mercado: pegar num checkpoint aberto existente, convertê-lo para um formato que corre no hardware que realmente se tem, quantizá-lo para caber, verificá-lo face ao original e ligá-lo a um plugin. Depende de haver um checkpoint aberto de onde partir, o que é cada vez mais o caso normal.

Se tem um modelo de fala que só corre numa GPU de treino, ou um dispositivo que atualmente não tem suporte de fala offline na sua língua, [entre em contacto](/pt/contact). Ou veja como é este trabalho de ponta a ponta na [nossa página de serviços](/pt/services).

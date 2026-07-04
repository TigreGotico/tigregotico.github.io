---
title: "Apresentamos os Nossos Scrapers de Bases de Dados de Música"
description: "Uma visita guiada à família de clientes Python tipados que mantemos para fontes de música — Bandcamp, SoundCloud, SomaFM, TuneIn, iHeartRadio, e as grandes enciclopédias musicais — todos a emitir metadados de media consistentes e tipados por trás de uma interface limpa e a andar sobre o mesmo transporte anti-bot resiliente."
date: 2026-04-20
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Scrapers"
  - "Media Metadata"
  - "Music"
  - "Python"
  - "FOSS"
draft: false
---

## Uma interface para toda a web musical

A web da música é gloriosamente fragmentada. O Bandcamp vende-te um FLAC e uma
licença Creative Commons; o SoundCloud transmite um remix que mais ninguém aloja;
a SomaFM mantém um conjunto adorado de canais de rádio suportados pelos ouvintes;
e um canto silencioso da internet mantém enciclopédias meticulosamente curadas de
rock progressivo, jazz, clássica e metal. Cada site tem a sua própria marcação, as
suas próprias manias, a sua própria ideia do que sequer é uma "faixa".

Mantemos uma família de clientes Python pequenos, focados e de código aberto que
domam essa confusão. Todos eles fazem, em espírito, a mesma coisa: alcançam uma
fonte de música e devolvem-te **modelos de metadados de media tipados** — objetos
validados em vez de dicionários frágeis — para que o resto do teu código nunca
tenha de se importar de que site vieram os dados. Instala um, instala os nove;
falam o mesmo vocabulário.

Eis a visita guiada.

## Streaming e rádio

**[py_bandcamp](https://github.com/TigreGotico/py_bandcamp)** faz scraping do
Bandcamp: procura faixas, álbuns, artistas e editoras; navega por etiqueta de
género; obtém recomendações e artistas relacionados a partir de uma semente; e
extrai um URL de MP3 transmissível. As procuras devolvem objetos `Release`
tipados que transportam título, capa, géneros, créditos e — crucialmente para os
mentalizados no FOSS — um campo de licença ao estilo SPDX com uma verificação
`is_open()` para que possas distinguir um lançamento Creative Commons de um com
todos os direitos reservados. Uma conversão de álbum de fidelidade total preenche
a tracklist ordenada a pedido.

**[nuvem_de_som](https://github.com/TigreGotico/nuvem_de_som)** é o nosso cliente
de SoundCloud, e é o canivete suíço do lote. Três backends independentes — um
backend de API rico em metadados, um scraper de HTML sem dependências, e um
backend yt-dlp — assentam por trás de um orquestrador que recua graciosamente de
um para o seguinte. Procura faixas e pessoas, resolve URLs de stream diretos
(progressivo ou HLS), descarrega faixas e playlists inteiras, e até traz uma
aplicação de terminal, `nds`, para procurar e reproduzir a partir da linha de
comandos. Os lançamentos vêm de volta com codec, taxa de bits, géneros, país,
licença SPDX e tracklists completas dos sets.

**[radiosoma](https://github.com/TigreGotico/radiosoma)** envolve a API pública de
canais da SomaFM. A SomaFM é a extremidade amigável e de API aberta do espetro, e
o cliente modela-a de forma limpa: cada canal é uma obra, e **cada codificação de
stream** — AAC a 130 kbps, MP3 a 256 kbps, HE-AAC a 64 e 32 kbps — torna-se o seu
próprio `Release` desse canal, para que um consumidor possa escolher o melhor
ajuste e desduplicar por identidade. O feed de faixas recentes surge como um
horário arrumado do que tem estado a tocar.

**[tunein](https://github.com/TigreGotico/tunein)** é um cliente TuneIn não
oficial para as estações de rádio linear e IPTV do mundo. Um caminho rápido
devolve apenas o payload da procura; uma chamada de enriquecimento opcional
preenche género, língua, país, indicativo e slogan. Como o TuneIn devolve
múltiplos URLs de stream por estação — diferentes taxas de bits, espelhos e
protocolos — cada um torna-se o seu próprio `Release`, deixando de novo o
consumidor escolher no momento da reprodução. Uma pequena CLI dá-te saída em
tabela ou JSON.

**[pyheartradio](https://github.com/TigreGotico/pyheartradio)** fala com a API
pública do iHeartRadio — sem chave, sem conta. Procura estações, podcasts,
artistas, faixas e playlists; obtém episódios de podcast com URLs de stream de
áudio diretos; e conta com obtenções de detalhes em paralelo para que as pesquisas
de estação e artista corram concorrentemente. Cada modelo oferece os auxiliares
`to_external_ids()` e `to_signals()` para encaixar diretamente numa pipeline de
metadados tipada.

## Enciclopédias e arquivos de música

A segunda metade da família visa os grandes catálogos comunitários — os sites
onde os humanos passaram anos a avaliar discografias e a discutir subgéneros.

**[pyprogarchives](https://github.com/TigreGotico/pyprogarchives)** (Prog
Archives), **[pyjazzmusicarchives](https://github.com/TigreGotico/pyjazzmusicarchives)**
(Jazz Music Archives), e
**[pyclassicalarchives](https://github.com/TigreGotico/pyclassicalarchives)**
(Classical Archives) partilham uma forma quase idêntica: navegar o índice A–Z,
procurar por nome, e obter uma página completa de artista ou compositor com
biografia, país e uma discografia avaliada pelos membros. Os Prog e Jazz Archives
fazem scraping de HTML; os Classical Archives envolvem uma API JSON pública e
expõem os álbuns de um compositor *e* uma árvore de obras achatada
recursivamente. Cada modelo transporta o id canónico estável do site via
`to_external_ids_dict()`, que é exatamente aquilo de que precisas para cruzar um
catálogo com outro.

**[pymetal](https://github.com/TigreGotico/pymetal)** é o nosso cliente para a
Encyclopaedia Metallum, os Metal Archives — e o mais ambicioso do conjunto. A
maioria dos scrapers achata uma faixa para `(id, title, band, album)`. O pymetal
recusa-se a perder aquilo que os Metal Archives mantêm separado: uma faixa pode
creditar **várias bandas** (splits, colaborações), a **formação de uma banda é
fatiada ao longo do tempo**, e uma faixa pode **aparecer em muitos lançamentos**
(compilações, reedições, singles). Modela cada um como uma entidade de primeira
classe indexada pelo id do arquivo, para que os re-scrapes sejam idempotentes. A
superfície de endpoints é ampla — procura avançada de banda/álbum/canção, páginas
completas de lançamento com atribuição por banda nos splits, formações
particionadas por estado com intervalos de datas de função, críticas,
recomendações, ligações externas e letras — tudo como modelos Pydantic v2 que
fazem round-trip através de JSON.

Para além da música, **[tutubo](https://github.com/TigreGotico/tutubo)** faz
scraping do YouTube e do YouTube Music, e
**[pymal](https://github.com/TigreGotico/pymal)** cobre o MyAnimeList —
estendendo os mesmos padrões de metadados tipados a categorias de media mais
amplas. Todos emitem o mesmo vocabulário para que um único consumidor a jusante
lide com tudo de forma uniforme.

## Construídos para sobreviver à web moderna

Um scraper que se parte na primeira vez que um site levanta uma parede de bots não
vale nada. Por toda a família a camada HTTP é **plugável**, e onde os sites são
ativamente defendidos contra bots os clientes recorrem por defeito a um transporte
que se faz passar por um navegador — o `curl_cffi` a coincidir com as impressões
digitais TLS/JA3 reais do Chrome — para superar desafios que rejeitam o `requests`
comum. As enciclopédias por trás da Cloudflare podem adicionalmente encaminhar
através de uma instância FlareSolverr para dados em direto, ou ler a partir do
Wayback Machine do Internet Archive quando só precisas de *alguma coisa*. A camada
de parsing é deliberadamente independente da forma como o HTML chega, por isso o
mesmo código funciona seja qual for o transporte que escolheres.

## Um catálogo de música multi-fonte

O verdadeiro retorno é o que acontece quando deixas de pensar nisto como nove
ferramentas separadas. Como todos emitem o mesmo vocabulário de metadados tipado e
todos expõem ids externos canónicos, podes espalhar um único artista por
Bandcamp, SoundCloud, os diretórios de rádio e as enciclopédias, e depois dobrar
os resultados num catálogo coerente — desduplicado por identidade, ciente das
licenças, e pronto a alimentar um motor de recomendação, um servidor de media, ou
um dataset de investigação.

Cada um destes clientes é software livre, auto-alojável, e corre no teu próprio
hardware sem chaves de API para implorar. Escolhe a fonte que te interessa, faz
`pip install`, e começa a construir.

Todos os scrapers andam sobre as nossas
**[camadas de transporte anti-bot](/pt/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)**.
Os clientes de streaming e rádio emitem o esquema
**[mediavocab](https://github.com/TigreGotico/mediavocab)** diretamente, e cada
cliente expõe ids externos canónicos, para que os metadados de música se integrem
com o **[media-archivist](https://github.com/TigreGotico/media-archivist)**, o
nosso indexador multi-fonte e servidor de metadados desduplicador.

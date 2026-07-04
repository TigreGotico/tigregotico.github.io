---
title: "Se Toda a Gente Lança uma App, Nós Lançamos Voz: Transformar Websites em Aplicações de Voz"
description: "Todos os sites que importam acabaram embrulhados numa app móvel. Propomos o movimento inverso para a era da voz e da linha de comandos: uma API limpa mais uma skill de voz por site, para que a web se torne navegável de ouvido e por teclado. Um site de cada vez, tudo somado dá um navegador de voz."
date: 2026-07-04
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Voice"
  - "Accessibility"
  - "OpenVoiceOS"
  - "Web Automation"
  - "CLI"
  - "FOSS"
draft: false
---

A dada altura nos últimos quinze anos, a web decidiu discretamente que todos os
sites importantes precisam também de uma app móvel. Não porque o HTML tenha
deixado de funcionar — mas porque uma app é uma *superfície controlada*: um
conjunto curado de ações, sem chrome que não escolhemos, uma interface
construída para uma única forma de interagir.

Achamos que o mesmo movimento está à espera de ser feito para um conjunto
diferente de utilizadores e um conjunto diferente de interfaces. Se toda a gente
transforma o seu site numa app Android, **nós conseguimos transformar sites em
aplicações de voz** — e em aplicações de linha de comandos, e em fluxos nativos
para leitores de ecrã. A mesma ideia, na direção oposta: embrulhar um site numa
superfície construída para a forma como *tu* queres interagir com ele, só que a
superfície é a tua voz e o teu terminal em vez de um ecrã tátil.

## A web mal se consegue usar de ouvido

Para um utilizador com visão e um rato, um site moderno é aceitável. Para alguém
que navega por voz, ou através de um leitor de ecrã, ou a partir de um terminal,
a maior parte da web é um ambiente hostil: paredes de scroll infinito, banners
de cookies, pop-ups, menus que exigem um ponteiro, conteúdo enterrado sob três
camadas de tralha interativa. A informação está lá dentro. Tirá-la de lá, sem
usar as mãos, é uma miséria.

A resposta habitual é "os sites deviam ser mais acessíveis", e deviam. Mas não
vamos consertar a web inteira pedindo com jeitinho. O que *podemos* fazer é pegar
nos sites que importam e construir uma interface falada e limpa para cada um — à
maneira das lojas de apps para o toque, mas para voz e linha de comandos, e de
forma aberta.

## Duas camadas: uma API limpa, depois uma skill de voz

Cada uma destas aplicações de voz são duas peças empilhadas, e nós já
construímos ambas.

**Camada um — um cliente tipado que transforma um site numa API.** Isto é
exatamente o nosso [trabalho de scraping e engenharia inversa de APIs](/pt/blog/2026-04-20-music-database-scrapers):
alcançar um site que não tem qualquer interface pública utilizável e devolver
objetos estruturados e tipados em vez de HTML frágil — verbos, não scraping:

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

O trabalho de reconhecimento e as ferramentas de
[transporte anti-bot](/pt/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)
por baixo mantêm esse acesso a funcionar à medida que o site muda. Esse cliente
já é útil por si só: para um utilizador de terminal a API *é* a versão acessível
do website — o nosso cliente de SoundCloud até traz o `nds`, uma aplicação de
linha de comandos para procurar e reproduzir música sem um navegador à vista. Uma
vez que um site é uma API, deixa de ser um artefacto visual e passa a ser algo
que uma máquina — ou uma pipeline de voz — consegue conduzir.

**Camada dois — um plugin OVOS que fala essa API.** Por cima do cliente assenta
um plugin [OpenVoiceOS](https://openvoiceos.org) que mapeia intenções faladas
para chamadas de API e narra os resultados com as nossas
[vozes TTS offline](/pt/blog/2026-06-15-two-voices-every-language-miro-and-dii).
Não é, deliberadamente, uma skill à medida por site — esse caminho leva a
dezenas de skills avulsas que ninguém consegue manter. Para tudo o que tem forma
de media é um plugin fornecedor
[OCP](https://openvoiceos.github.io/ovos-technical-manual/): um pequeno adaptador
que expõe a superfície de procurar-e-reproduzir de um site a toda a framework
Open Common Play, para que "procurar", "reproduzir", "seguinte" e "retomar" já
funcionem da mesma forma que funcionam para qualquer outra fonte. O site encaixa
numa interface de voz uniforme em vez de inventar a sua própria.

O resultado: "Reproduz o canal Groove Salad da SomaFM." "Procura no Bandcamp
ambient Creative-Commons." O website, transformado em algo que consegues usar
sem olhar para ele — e sem uma nova gramática para aprender em cada site.

## Na era dos LLM, uma API tipada é uma UI de linguagem natural à espera de acontecer

Há uma segunda razão pela qual esta forma importa mais agora do que importaria há
cinco anos. Um cliente limpo e tipado é exatamente aquilo de que um modelo de
linguagem grande precisa para se tornar um *front-end de linguagem natural* para
um website.

Dá a um LLM um conjunto documentado de funções — `search_albums`,
`get_recommendations`, `stream_url` — e ele traduzirá alegremente "encontra-me
algo como os Naxatras mas mais pesado" nas chamadas certas, encadeá-las-á, e
falará o resultado de volta. A API estruturada é a parte difícil; a interface
conversacional por cima é cada vez mais algo que o modelo simplesmente
*fornece*, desde que as ferramentas que lhe são entregues sejam bem tipadas e
honestas quanto ao que devolvem. HTML confuso não dá a um LLM nada a que se
agarrar. Um cliente tipado dá-lhe uma superfície de controlo.

Por isso, os nossos clientes de website trazem um **`SKILL.md`** — uma descrição
em linguagem simples do que a API faz, dos seus verbos, dos seus tipos de retorno
e exemplos de chamadas, escrita para um agente ler. Aponta um assistente movido a
LLM para ele e o cliente torna-se uma ferramenta que o modelo pode usar
imediatamente: sem código de cola, sem integração à medida, apenas "eis o que
este site consegue fazer, por palavras." Um documento transforma um scraper em
algo que um modelo de linguagem consegue operar em teu nome.

São os mesmos dados estruturados a servir três front-ends ao mesmo tempo: uma
**CLI** para utilizadores de terminal, um **plugin OCP/voz** para uso sem mãos, e
uma **ferramenta LLM** para controlo por linguagem natural. Constrói a API uma
vez; usa-a de três maneiras.

## Porque é que isto importa mais para quem não consegue ver o ecrã

Para utilizadores cegos e com baixa visão isto não é uma funcionalidade de
conveniência — é a diferença entre o acesso e a exclusão. Um leitor de ecrã só
consegue ler aquilo que uma página expõe de forma limpa, e a maioria das páginas
não o faz. Uma aplicação de voz dedicada salta a página por completo: vai aos
dados estruturados e fala *isso*, num fluxo concebido para se ouvir desde a
primeira linha de código.

É o mesmo princípio por trás dos nossos
[jogos audio-first](/pt/games) — construídos para os ouvidos, não para os olhos,
com jogadores cegos como público principal em vez de uma reflexão tardia. As
aplicações de voz para websites estendem esse princípio dos jogos ao resto da web.

## Um site de cada vez — mas a direção é um navegador de voz

Eis a parte honesta: não há um atalho universal. Não se consegue habilitar "a
web" para voz de uma só vez, porque cada site é o seu próprio emaranhado. Tem de
ser feito **por site** — um cliente, uma skill, um conjunto de intenções
cuidadosamente mapeado de cada vez. Isso parece uma limitação, e a curto prazo é.

Mas repara para onde aponta a acumulação. Cada site que embrulhamos é mais um
canto da web que passa a ser alcançável por voz e por linha de comandos. Junta
uma quantidade suficiente deles — um vocabulário de metadados comum, uma camada
de voz partilhada, um conjunto consistente de intenções "procurar / abrir / ler /
reproduzir / seguinte" — e já não estás a olhar para uma pilha de skills
separadas. Estás a olhar para os começos de um **navegador de voz**: uma forma de
percorrer a web falando, onde os sites individuais são apenas destinos que já
sabem como responder.

A aposta da era móvel foi que um site que vale a pena usar vale uma app. A nossa é
que um site que vale a pena usar vale uma *voz*. Estamos a construí-los um de cada
vez, de forma aberta, e cada um deles torna a web um pouco mais navegável para as
pessoas que a web visual deixou para trás.

Queres um site específico transformado numa aplicação de voz ou de linha de
comandos — para acessibilidade, para o teu produto, ou só porque devia existir?
[Vamos conversar.](/pt/services)

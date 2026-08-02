---
title: "Portar com Máquinas, e a Questão de Licenciamento que Não Conseguimos Responder"
description: "Reescrevemos vários programas em C, C++ e Java (o G2P do espeak-ng, o Cotovía, o AhoTTS, o HermiT) como Python puro, com uma IA a ler o código-fonte original e um humano a orquestrar. Ninguém do nosso lado leu os originais. Isso levanta duas questões separadas: o resultado pode sequer ser propriedade de alguém, e é derivado do que lhe deu origem? Mantivemos as licenças a montante porque isso saiu mais barato do que responder. Continuamos a achar que a questão está em aberto."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
---

Reescrevemos um punhado de programas antigos em Python. O front-end de G2P do
[espeak-ng](https://github.com/espeak-ng/espeak-ng), as regras de transcrição
galega e espanhola do [Cotovía](https://gtm.uvigo.es/en/transfer/software/cotovia/),
o processamento linguístico basco do [AhoTTS](https://github.com/aholab/AhoTTS),
o raciocinador N3 [EYE](https://github.com/eyereasoner/eye), e o raciocinador
OWL 2 DL [HermiT](http://www.hermit-reasoner.com/). C, C++ e Java, a maioria
com mais de uma década.

O motivo foi vulgar. Um programa em C que fonemiza galego é excelente até se
querer tê-lo dentro de uma stack de fala em Python numa placa ARM: um
compilador, uma toolchain, cross-compilation, uma fronteira de subprocesso
através da qual é preciso fazer marshalling do texto. Um raciocinador em
Java precisa de uma JVM; Python puro precisa de `pip install`, e dá para
abrir o ficheiro que decide onde vai o acento tónico e alterá-lo.

As portagens foram feitas semi-autonomamente: uma IA leu o código-fonte
original e escreveu o Python, um humano dirigiu o trabalho e verificou o
resultado face ao binário original. Em várias delas ninguém do nosso lado
alguma vez leu o código-fonte original; o modelo leu-o, e nós lemos os
diffs e os testes de paridade.

Isso deixa uma questão que não conseguimos responder: **o resultado é uma
obra derivada, e de quem é?**

Somos engenheiros. Nada aqui é aconselhamento jurídico, e não estamos
qualificados para o dar: isto é a descrição de uma decisão que tomámos e do
raciocínio por trás dela.

## Duas questões que continuam a ser confundidas

Reimplementar um programa a partir da leitura do seu código-fonte não é
novo. O que é novo é o arranjo: quem lê é uma máquina, quem implementa é a
mesma máquina, e os humanos no processo nunca viram o original.

Há duas questões independentes aqui, quase sempre colapsadas numa só,
embora se possa responder sim a uma e não à outra.

1. **O resultado pode sequer ser propriedade de alguém?** O direito de
   autor liga-se a obras com autores. Se uma máquina produziu o código,
   quem é o autor?
2. **O resultado é derivado do que lhe deu origem?** Quem quer que o tenha
   autorado, se é que alguém o fez, o resultado infringe o original?

Uma **obra derivada** é uma obra baseada numa pré-existente, como uma
tradução ou uma portagem. As licenças **copyleft** (a família GPL) permitem
usar e modificar o código com a condição de que o que se distribui
mantenha os mesmos termos. As licenças **permissivas** (MIT, Apache-2.0,
BSD) permitem enviar o resultado dentro de software proprietário. A
**LGPL** fica entre as duas.

## Primeira questão: há um autor?

O direito de autor precisa de um autor humano. O US Copyright Office tem
mantido isto de forma consistente, e em *Thaler v. Perlmutter* o Tribunal
de Recurso do Circuito de D.C. concordou: o Copyright Act "exige que toda
a obra elegível seja, em primeira instância, autorada por um ser humano"
(N.º 23-5233, D.C. Cir., 18 de março de 2025; o Supremo Tribunal negou o
certiorari em março de 2026). O padrão europeu chega a um lugar
semelhante: a proteção exige a "criação intelectual própria do autor", o
que pressupõe um autor que cria.

Nenhuma dessas posições diz que o trabalho assistido por IA é
desprotegível, só que o que a máquina gera por si só não é, e onde a linha
cai depende de quanto um humano contribuiu: nas nossas portagens, real mas
ténue, escolher o alvo, estruturar o pacote, julgar as falhas de paridade.
Não é óbvio que isso nos torne autores das regras de transcrição.

Isso produz um objeto estranho: uma licença é uma concessão de permissão
por um titular de direitos, por isso, se ninguém detém direitos sobre o
resultado, o ficheiro de licença na raiz do repositório é decoração, e o
argumento come a própria cauda. Quem argumenta que código gerado por
máquina não tem dono está a argumentar que os seus próprios termos de
distribuição não são aplicáveis, muito antes de sequer chegar aos direitos
a montante.

## Segunda questão: é derivado?

Esta não se importa com quem é o autor. A infração depende de acesso ao
original mais semelhança substancial com a sua **expressão** protegida, a
forma particular como a coisa foi escrita, não o que faz, e tivemos
acesso: o modelo leu o código-fonte, e essa metade não está em disputa.

A metade da semelhança é onde a mudança de língua de programação importa
menos do que se espera. Traduzir um romance produz uma obra derivada;
mudar a linguagem derrota uma alegação de cópia literal, mas não uma
alegação sobre estrutura, a ordem das transformações, a decomposição em
funções, a forma das tabelas de regras.

Uma ferramenta também não lava nada: se se dirige uma cópia e se envia o
resultado, quem a fez foi quem dirigiu, e "foi o modelo que escreveu" não
é mais defesa do que "foi o compilador que emitiu".

## O argumento mais forte do outro lado

Há um caso sério a favor de que uma reimplementação entre linguagens é
legítima. Em *SAS Institute v World Programming* (TJUE, C-406/10, 2 de
maio de 2012), o Tribunal decidiu que "nem a funcionalidade de um programa
de computador nem a linguagem de programação e o formato dos ficheiros de
dados usados num programa de computador para explorar certas das suas
funções constituem uma forma de expressão desse programa". A Diretiva do
Software (2009/24/CE, artigo 1.º, n.º 2) diz o mesmo sobre as ideias e
princípios subjacentes a um programa, e o Tribunal decidiu que um
licenciado pode estudar o comportamento de um programa para determinar as
ideias por trás dele, e reimplementá-las.

Isso significa que aquilo que um phonemizer *faz*, transformar esta
sequência de grafemas naquele fonema, não é propriedade de ninguém: as
regras de acentuação galegas são factos sobre o galego, e a semântica
direta do OWL 2 é uma especificação publicada do W3C. Uma reimplementação
que reproduz comportamento em vez de expressão é lícita, e uma reescrita
entre linguagens fica muito mais longe da infração do que uma cópia-e-cola.

O fosso entre esse argumento e a nossa situação é a fonte: o caso *SAS* é
sobre estudar comportamento, e o nosso modelo leu o código.

## O precedente que já existe, e até onde chega

O argumento "o resultado de uma máquina não tem autor, logo não há
direitos de autor" não é uma experiência de pensamento: a destilação de
modelos e os dados de treino sintéticos assentam nele, em toda a
indústria. A declaração pública mais clara é a do
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), um modelo aberto
de TTS amplamente usado, cuja model card diz que foi treinado
exclusivamente com áudio permissivo ou não protegido por direitos de
autor, listando entre as fontes permissíveis:

> Synthetic audio generated by closed TTS models from large providers

com uma nota de rodapé a apontar para as
[orientações de política sobre IA](https://copyright.gov/ai/ai_policy_guidance.pdf)
do US Copyright Office: o resultado de uma máquina não tem autor humano,
logo nada subsiste a infringir ao treinar com ele. O modelo é distribuído
sob Apache-2.0, e a model card também exclui áudio sintético de modelos de
TTS *abertos* e de clones de voz personalizados, sinal de que os autores
perceberam onde o argumento para de funcionar.

Esse precedente resolve a outra metade do problema. O argumento do Kokoro
é sobre a **entrada**: o que consumiram era, em si mesmo, gerado por
máquina, pelo que a alegação é que não transportava direitos de autor à
partida. A nossa situação é a imagem espelhada: o que consumimos, o C do
espeak-ng, o C++ do Cotovía e o Java do HermiT, é escrito por humanos e
protegido por direitos de autor, por pessoas nomeadas, em universidades
nomeadas, e o que *saiu* foi escrito por máquina, pelo que o argumento cai
sobre o nosso resultado, não sobre a nossa entrada, e não viaja a montante.

Há uma assimetria adicional: a exposição residual do Kokoro, a existir, é
contratual e não de direitos de autor, e essa obrigação sobrevive mesmo
onde o direito de autor não sobrevive. O copyleft não funciona assim;
ninguém clica "aceito" na GPL, e ela só vincula se o que se fez for uma
obra derivada.

Por isso a coisa toda colapsa de volta para a questão que ninguém
respondeu. Se uma reimplementação entre linguagens, escrita por máquina,
não é uma obra derivada, a GPL nunca foi acionada. Se é uma, aplicou-se
desde a primeira linha. Não há um terceiro estado.

## Salas limpas, e se dois modelos fazem uma

A resposta clássica a este problema é o protocolo de sala limpa (clean
room): uma equipa lê o original e escreve uma especificação funcional do
que o programa faz, e uma segunda equipa, que nunca viu o original,
implementa apenas a partir dessa especificação. Foi assim que a BIOS do PC
foi reimplementada, e é por isso que a reimplementação sobreviveu.

O passo moderno óbvio é correr um modelo para ler e descrever, e um modelo
diferente com um contexto novo para implementar, estruturalmente o mesmo
protocolo. Tem a forma certa, mas uma sala limpa não é uma construção
técnica, é uma construção **probatória**, cujo valor todo está em
conseguir demonstrar a separação a alguém que assume que se fez batota. A
versão com dois modelos só significa alguma coisa se a disciplina se
mantiver:

- Os dois lados nunca partilham genuinamente contexto. Não "dissemos-lhe
  para esquecer", mas execuções separadas, transcrições separadas.
- A especificação transporta comportamento e nada mais. Sem pseudocódigo
  que espelhe o fluxo de controlo do original. Sem nomes de identificadores.
  Sem a ordem das funções. Isso é expressão, e uma especificação cheia
  disso é o original disfarçado.
- Os registos de ambos os lados são guardados, porque uma sala limpa que
  não se consegue provar é apenas uma história.

Se o lado que lê emite estrutura, a contaminação passa direta, e obtém-se
uma obra derivada com passos extra e uma fatura de tokens maior.

Não fizemos isto: o modelo que implementou leu o código-fonte diretamente,
razão pela qual o README do pycotovia diz, publicamente:

> Because the implementing AI **read the GPL source**, this is **not a
> clean-room reimplementation** and we make no such claim. It is a
> source-derived port.

Preferimos ter essa frase escrita do que ter de a responder mais tarde.

## O que fizemos

Mantivemos as licenças a montante: copyleft à entrada, copyleft à saída;
permissivo à entrada, permissivo à saída. O
[espyak](https://github.com/TigreGotico/espyak) é GPL-3.0-or-later,
correspondendo ao espeak-ng; nem sequer é um caso difícil, já que integra
os próprios ficheiros de dados do espeak-ng ipsis verbis (`dictsource`,
`phsource`, `lang`), e nenhuma teoria de autoria toca em ficheiros
copiados sem alterações. O [pycotovia](https://github.com/TigreGotico/pycotovia)
é GPL-3.0, correspondendo ao Cotovía (GPL-3.0+). O
[ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) e o
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
são GPL-3.0, correspondendo ao AhoTTS. O
[pyeye](https://github.com/TigreGotico/pyeye) é MIT, correspondendo ao EYE.

Não o fizemos porque tivéssemos estabelecido que era exigido, mas porque a
assimetria tomava a decisão sem precisar da resposta: o copyleft não nos
custa quase nada aqui, enquanto uma licença permissiva em algo que devia
ter sido copyleft é o erro pior, descoberto tarde e em público, depois de
outros terem construído sob termos que não se tinha o direito de oferecer.

Essa assimetria vale a pena vigiar em geral: nada se queixa quando uma
portagem estrutural de um original LGPL se torna discretamente Apache-2.0
na tradução. O HermiT é LGPL e a nossa portagem em Python carrega
LGPL-3.0 a condizer. O resto do conjunto revelou mais dois casos, ambos
sem drama: um wrapper a declarar Apache-2.0 cujo original a montante é
MIT, e repositórios cujo README nomeava uma licença sem ficheiro
correspondente. Verifica-se, corrige-se o que precisar de correção, e a
questão interessante fica em aberto.

Não é preciso resolver a questão jurídica para tomar esta decisão; basta
escolher o ramo em que estar errado é sobrevivível.

## A mesma questão, apontada para o outro lado

A mesma lógica aplica-se ao código que recebemos: alguém abre um pull
request escrito por um modelo, e a questão é o que essa pessoa nos está a
conceder.

A maioria dos projetos trata disto com o
[Developer Certificate of Origin](https://developercertificate.org/): a
linha `Signed-off-by:` a certificar que se escreveu a contribuição, ou que
veio de uma fonte compatível que se tem o direito de submeter. É assim que
o kernel Linux e o QEMU estabelecem de onde vem o seu código.

Para um patch escrito por máquina, nenhum dos dois ramos é claramente
verdadeiro: se o resultado gerado por máquina não transporta direitos de
autor, o contribuidor não detém direitos sobre ele; se, em alternativa, se
trata como derivado dos dados de treino, os direitos pertencem a quem
escreveu esses dados. De qualquer forma não podem conceder o que não
detêm, e a assinatura, embora não desonesta, transfere algo que nunca foi
seu para transferir.

As consequências divergem bastante. No primeiro ramo, material de que
ninguém é dono pode ser usado por qualquer pessoa, mas o copyleft não se
pode aplicar a material que não transporta direitos de autor, por isso um
projeto GPL que acumula patches escritos por máquina acumula
discretamente partes que a sua própria licença pode não alcançar. O
segundo tem dentes: se um modelo reproduz dados de treino memorizados
palavra por palavra, mais comum com idiomas do que com lógica original,
aceitou-se código com direitos de autor de outra pessoa sob a garantia de
um contribuidor que não tinha forma de verificar, e isso atinge com mais
força os projetos com a proveniência mais cuidada.

O Debian está a trabalhar nisto. Uma
[resolução geral sobre o uso de LLM](https://www.debian.org/vote/2026/vote_002)
entrou no seu período de discussão em julho de 2026, cobrindo desde
proibir por completo as contribuições assistidas por LLM até permiti-las
sob divulgação e responsabilização, e nada está decidido. Uma
[tentativa anterior em 2024](https://lwn.net/Articles/972331/) também
terminou sem resolução: a objeção não foi que a preocupação fosse
infundada, mas que uma regra que ninguém consegue fazer cumprir não vale a
pena adotar.

Estamos numa posição fraca para ser rigorosos: distribuímos portagens
escritas por um modelo, e um projeto que publica código escrito por
máquina e recusa contribuições escritas por máquina está a segurar duas
posições incompatíveis ao mesmo tempo.

O licenciamento não é o único eixo ao longo do qual este argumento corre,
ainda que seja o eixo desta publicação. O Codeberg adotou duas moções
aprovadas pelos membros em julho de 2026 e
[expôs o seu raciocínio](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
quase sem tocar nas licenças: o consumo de energia e hardware, o tráfego
de crawlers, os projetos de utilização única nunca mantidos, e a carga que
os patches de baixo esforço impõem a quem revê. Isso é separado da
questão de saber se o código pode ser licenciado. O Debian está a votar
na primeira e não concluiu; o Codeberg agiu sobre a segunda.

## A parte que não vamos fingir que está resolvida

Talvez não tivéssemos precisado de fazer nada disto.

Considerem-se os três argumentos em conjunto. A funcionalidade não é
protegida; o TJUE disse-o diretamente. O resultado puramente gerado por
máquina pode não ter autor humano, pelo que pode não haver novos direitos
de autor com que nos preocuparmos e, incomodamente, nenhum deles nosso. E
um protocolo com dois modelos, executado com disciplina real, pode ser
uma sala limpa genuína, caso em que a portagem nunca tocou em expressão
protegida.

Se as três se verificarem, algumas destas portagens poderiam ter sido
licenciadas permissivamente com a consciência tranquila. Se nenhuma se
verificar, a nossa escolha conservadora foi simplesmente correta. Não
sabemos qual é o caso, não o testámos, e não temos interesse em ser o
caso que resolve isto.

A questão não desaparece por ser ignorada. Este tipo de portagem está a
tornar-se comum, e há uma grande quantidade de C não mantido que vale a
pena mudar para algum lugar onde possa ser mantido. Cada uma dessas
portagens vai enfrentar as mesmas duas questões, e a maioria vai responder
não as colocando. O mesmo se aplica a todo o projeto que integra um patch
que não escreveu, ou seja, a todos eles.

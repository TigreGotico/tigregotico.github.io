---
title: "Portar com Máquinas, e a Questão de Licenciamento que Não Conseguimos Responder"
description: "Reescrevemos vários programas em C, C++ e Java — o G2P do espeak-ng, o Cotovía, o AhoTTS, o HermiT — como Python puro, com uma IA a ler o código-fonte original e um humano a orquestrar. Ninguém do nosso lado leu os originais. Isso levanta duas questões separadas: o resultado pode sequer ser propriedade de alguém, e é derivado do que lhe deu origem? Mantivemos as licenças a montante porque isso saiu mais barato do que responder. Continuamos a achar que a questão está em aberto."
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
com mais de uma década, todos ainda a melhor coisa disponível para o que fazem.

O motivo foi vulgar. Um programa em C que fonemiza galego é excelente até se
querer tê-lo dentro de uma stack de fala em Python numa placa ARM. Depois é
preciso um compilador, uma toolchain, cross-compilation, uma história de
empacotamento por plataforma, e uma fronteira de subprocesso através da qual
é preciso fazer marshalling do texto. Um raciocinador em Java precisa de uma
JVM. Python puro precisa de `pip install`. E também se lê: é possível abrir
o ficheiro que decide onde vai o acento tónico e alterá-lo, sem saber como
funciona o sistema de build original.

As portagens foram feitas semi-autonomamente. Uma IA leu o código-fonte
original e escreveu o Python; um humano dirigiu o trabalho e verificou o
resultado face ao binário original. Em várias delas, ninguém do nosso lado
alguma vez leu o código-fonte original. O modelo leu-o. Nós lemos os diffs
e os testes de paridade.

Isso deixa uma questão sobre a qual tivemos de tomar uma decisão, e não
conseguimos responder: **o resultado é uma obra derivada, e de quem é?**

Somos engenheiros. Nada aqui é aconselhamento jurídico, e não estamos
qualificados para o dar. Isto é a descrição de uma decisão que tomámos e do
raciocínio por trás dela.

## Duas questões que continuam a ser confundidas

Reimplementar um programa a partir da leitura do seu código-fonte não é
novo. As pessoas reescrevem C em Python desde que existe Python. O que é
novo é o arranjo: quem lê é uma máquina, quem implementa é a mesma máquina,
e os humanos no processo nunca viram o original.

Há duas questões aqui, e quase toda a discussão sobre isto colapsa-as numa
só. São independentes.

1. **O resultado pode sequer ser propriedade de alguém?** O direito de
   autor liga-se a obras com autores. Se uma máquina produziu o código,
   quem é o autor?
2. **O resultado é derivado do que lhe deu origem?** Quem quer que o tenha
   autorado — se é que alguém o fez — o resultado infringe o original?

Pode responder-se sim a uma e não à outra, em qualquer combinação.
Mantenha-as separadas.

Algum vocabulário, já que o resto disto depende dele. Uma **obra derivada**
(derivative work) é uma obra baseada numa pré-existente — uma tradução, uma
adaptação, uma portagem. O direito de a fazer pertence ao titular dos
direitos de autor do original. As licenças **copyleft** (a família GPL)
permitem usar e modificar o código com a condição de que o que se distribui
mantenha os mesmos termos. As licenças **permissivas** (permissive licence)
(MIT, Apache-2.0, BSD) permitem fazer praticamente tudo, incluindo enviar o
resultado dentro de software proprietário. A **LGPL** fica no meio: o
copyleft aplica-se à própria biblioteca, mas ligá-la a um programa maior
não obriga esse programa a ser aberto. Todas assentam em direitos de autor.
Só mordem se houver um direito de autor a fazer valer.

## Primeira questão: há um autor?

O direito de autor precisa de um autor humano. O US Copyright Office tem
mantido isto de forma consistente, e em *Thaler v. Perlmutter* o Tribunal
de Recurso do Circuito de D.C. concordou: o Copyright Act "exige que toda
a obra elegível seja, em primeira instância, autorada por um ser humano"
(N.º 23-5233, D.C. Cir., 18 de março de 2025; o Supremo Tribunal negou o
certiorari em março de 2026). O padrão europeu tem forma diferente e
chega a um lugar semelhante — a proteção exige a "criação intelectual
própria do autor" (author's own intellectual creation), o que pressupõe
um autor que cria.

Nenhuma dessas posições diz que o trabalho assistido por IA é
desprotegível. Ambas dizem que o que a máquina gerou por si só é. A linha
passa através da obra, não à volta dela, e onde exatamente cai depende de
quanto um humano contribuiu. Nas nossas portagens, a contribuição humana é
real mas ténue: escolher o alvo, estruturar o pacote, julgar as falhas de
paridade. Não é óbvio que isso nos torne autores das regras de transcrição.

O que produz um objeto estranho. Uma licença é uma concessão de permissão
por um titular de direitos. Se ninguém detém direitos sobre o resultado, o
ficheiro de licença na raiz do repositório é decoração. Note-se para onde
vai esse argumento: come primeiro a própria licença de quem o defende.
Quem argumenta que código gerado por máquina não tem dono está a argumentar
que os seus próprios termos de distribuição não são aplicáveis, muito antes
de sequer chegar aos direitos a montante.

## Segunda questão: é derivado?

Esta não se importa com quem é o autor. A infração depende de acesso ao
original mais semelhança substancial com a sua **expressão** protegida — a
forma particular como a coisa foi escrita, não o que faz.

Tivemos acesso. O modelo leu o código-fonte. Essa metade não está em
disputa.

A metade da semelhança é onde fica interessante, e onde a mudança de
língua de programação importa menos do que se espera. Traduzir um romance
para outra língua produz uma obra derivada; esse é o exemplo de livro de
texto. Mudar a linguagem derrota uma alegação de cópia literal. Não
derrota uma alegação sobre estrutura — a ordem das transformações, a
decomposição em funções, a forma das tabelas de regras, o modo como os
casos limite são recortados.

Também vale a pena dizer claramente que uma ferramenta não lava nada. Se
se dirige uma cópia e se envia o resultado, quem a fez foi quem dirigiu.
"Foi o modelo que escreveu" não é defesa, tal como "foi o compilador que
emitiu" também não seria.

## O argumento mais forte do outro lado

Há um caso sério a favor de que uma reimplementação entre linguagens é
legítima, e merece ser exposto com rigor em vez de apenas acenado.

Em *SAS Institute v World Programming* (TJUE, C-406/10, 2 de maio de 2012),
o Tribunal decidiu que "nem a funcionalidade de um programa de computador
nem a linguagem de programação e o formato dos ficheiros de dados usados
num programa de computador para explorar certas das suas funções
constituem uma forma de expressão desse programa". Não estão, por isso,
protegidos por direitos de autor. A Diretiva do Software (2009/24/CE,
artigo 1.º, n.º 2) diz o mesmo sobre as ideias e princípios subjacentes a
qualquer elemento de um programa. O Tribunal também decidiu que um
licenciado pode estudar e observar o comportamento de um programa para
determinar as ideias por trás dele, e reimplementá-las.

Isso não é um pormenor técnico. Significa que aquilo que um phonemizer
*faz* — esta sequência de grafemas, neste contexto, torna-se aquele fonema
— não é propriedade de ninguém. As regras de acentuação galegas são factos
sobre o galego. A semântica direta do OWL 2 é uma especificação publicada
do W3C. Sob essa leitura, uma reimplementação que reproduz comportamento e
não expressão é lícita, e uma reescrita entre linguagens fica muito mais
longe da infração do que uma cópia-e-cola.

O fosso entre esse argumento e a nossa situação é a fonte. O caso *SAS* é
sobre estudar comportamento. O nosso modelo leu o código.

## O precedente que já existe, e até onde chega

O argumento "o resultado de uma máquina não tem autor, logo não há direitos
de autor" não é uma experiência de pensamento. É estrutural em produção, em
toda a indústria. A destilação de modelos e os dados de treino sintéticos
assentam ambos nele.

A declaração pública mais clara disto é o
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), um modelo aberto
de TTS amplamente usado. A sua model card diz que foi treinado
exclusivamente com áudio permissivo ou não protegido por direitos de autor,
e lista entre as fontes permissíveis:

> Synthetic audio generated by closed TTS models from large providers

com uma nota de rodapé a apontar para as
[orientações de política sobre IA](https://copyright.gov/ai/ai_policy_guidance.pdf)
do US Copyright Office. A cadeia de raciocínio é a de acima: o áudio foi
gerado por uma máquina, o resultado de uma máquina não tem autor humano,
logo não subsiste direito de autor sobre ele, logo não há nada a infringir
ao treinar com ele. O modelo é distribuído sob Apache-2.0. A model card
também traça uma fronteira — exclui áudio sintético de modelos de TTS
*abertos* e de clones de voz personalizados — o que é sinal de que os
autores perceberam onde o argumento para de funcionar, em vez de o
aplicarem a tudo.

Eis a parte que importa para as portagens. **Esse precedente resolve a
outra metade do problema.**

O argumento do Kokoro é sobre a **entrada**. O que consumiram era, em si
mesmo, gerado por máquina, pelo que a alegação é que não transportava
direitos de autor à partida. Não protegido por direitos de autor à
entrada, logo nada a herdar.

A nossa situação é a imagem espelhada. O que consumimos — o C do espeak-ng,
o C++ do Cotovía, o Java do HermiT — é inequivocamente escrito por humanos
e protegido por direitos de autor, por pessoas nomeadas, em universidades
nomeadas, há décadas. O que *saiu* foi escrito por máquina. O argumento
"sem direitos de autor no resultado de IA" cai sobre o nosso resultado, não
sobre a nossa entrada. Não viaja a montante. É, de novo, o argumento que
mina a nossa própria licença enquanto deixa os direitos a montante
totalmente intactos.

Há uma assimetria adicional que vale a pena notar. A exposição residual do
Kokoro não é sequer, na verdade, direitos de autor — é **contrato**. Os
termos de serviço dos fornecedores fechados geralmente proíbem usar o
resultado destes para treinar modelos concorrentes, e um termo a que se
aderiu não desaparece só porque o resultado se revelou não protegido por
direitos de autor. O copyleft não funciona assim. Ninguém clica "aceito"
na GPL. É uma concessão unilateral de permissão, e só vincula se precisar
dessa permissão — ou seja, só se o que se fez for uma obra derivada.

Por isso a coisa toda colapsa de volta para a única questão que ninguém
respondeu. Se uma reimplementação entre linguagens, escrita por máquina,
não é uma obra derivada, a GPL nunca foi acionada e nada dela se aplicou.
Se é uma, a GPL aplicou-se desde a primeira linha. Não há um terceiro
estado, e nenhuma quantidade de argumentação sobre autoria de IA move essa
agulha em particular.

## Salas limpas, e se dois modelos fazem uma

A resposta clássica a exatamente este problema é o protocolo de sala
limpa (clean room), e vale a pena descrevê-lo com precisão porque a sua
forma importa.

Uma equipa lê o original e escreve uma especificação funcional: o que o
programa faz, em termos comportamentais. Uma segunda equipa, que nunca viu
o original, implementa apenas a partir dessa especificação. O resultado da
segunda equipa é comprovadamente não copiado de expressão que nunca viu. Foi
assim que a BIOS do PC foi reimplementada, e é por isso que a
reimplementação sobreviveu.

O passo moderno óbvio é correr um modelo para ler e descrever, e um modelo
diferente com um contexto novo para implementar. Estruturalmente, é o
mesmo protocolo. É uma sala limpa?

Tem a forma certa. Mas uma sala limpa não é uma construção técnica — é uma
construção **probatória**. Todo o seu valor está em conseguir demonstrar a
separação depois, a alguém que assume que se fez batota. Por isso a versão
com dois modelos só significa alguma coisa se a disciplina se mantiver do
princípio ao fim:

- Os dois lados nunca partilham genuinamente contexto. Não "dissemos-lhe
  para esquecer" — execuções separadas, transcrições separadas.
- A especificação transporta comportamento e nada mais. Sem pseudocódigo
  que espelhe o fluxo de controlo do original. Sem nomes de identificadores.
  Sem a ordem das funções. Isso é expressão, e uma especificação cheia
  disso é o original disfarçado.
- Os registos de ambos os lados são guardados, porque uma sala limpa que
  não se consegue provar é apenas uma história.

Se o lado que lê emite estrutura, a contaminação passa direta e obtém-se
uma obra derivada com passos extra e uma fatura de tokens maior.

Não fizemos isto. O modelo que implementou leu o código-fonte diretamente.
É por isso que o README do pycotovia diz, no repositório, publicamente:

> Because the implementing AI **read the GPL source**, this is **not a
> clean-room reimplementation** and we make no such claim. It is a
> source-derived port.

Preferimos ter essa frase escrita do que ter de a responder mais tarde.

## O que fizemos

Mantivemos as licenças a montante.

O [espyak](https://github.com/TigreGotico/espyak) é GPL-3.0-or-later,
correspondendo ao espeak-ng. Esse nem sequer é um caso difícil: o pacote
integra os próprios ficheiros de dados do espeak-ng ipsis verbis —
`dictsource`, `phsource`, `lang` — e nenhuma teoria de autoria toca em
ficheiros que copiámos sem alterações. Os dados a montante estão dentro do
wheel, por isso a licença a montante vem com eles.

O [pycotovia](https://github.com/TigreGotico/pycotovia) é GPL-3.0,
correspondendo ao Cotovía (GPL-3.0+). O
[ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) e o
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
são GPL-3.0, correspondendo ao AhoTTS, cujo ficheiro de licença declara
GPL-3.0+ para o processamento linguístico. O
[pyeye](https://github.com/TigreGotico/pyeye) é MIT, correspondendo ao
EYE. Copyleft à entrada, copyleft à saída; permissivo à entrada,
permissivo à saída.

Não o fizemos porque tivéssemos estabelecido que era exigido. Fizemo-lo
porque a assimetria tomava a decisão sem precisar da resposta.

Publicamos como código aberto de qualquer forma. O copyleft não nos custa
quase nada — o único custo real é o caso em que um cliente quer o código
dentro de algo proprietário, e para estas bibliotecas específicas esse
caso é raro. Por isso ser copyleft quando não era estritamente necessário
custa aproximadamente zero.

O outro erro não é simétrico. Distribuir uma licença permissiva em algo
que devia ter sido copyleft é um problema descoberto tarde, em público,
por outra pessoa, depois de outros terem construído em cima disso sob
termos que não se tinha o direito de oferecer. Desfazer isso significa
contactar todos os utilizadores a jusante.

Essa assimetria é também a razão por que vale a pena vigiar a
incompatibilidade em geral. Uma portagem estrutural de um original LGPL
não pode simplesmente tornar-se Apache-2.0 por ter sido reescrita noutra
linguagem — e esse é exatamente o tipo de incompatibilidade fácil de criar
e difícil de notar, porque nada se queixa. O build passa. Os testes
passam. O cabeçalho de licença é apenas um ficheiro. O HermiT é LGPL, por
isso o licenciamento da nossa portagem em Python dele é um dos casos que
estamos a rever — o que é o resultado banal e correto: verifica-se, e
corrige-se o que precisar de correção.

Sob uma assimetria tão desnivelada, não é preciso resolver a questão
jurídica para tomar a decisão. Basta escolher o ramo em que estar errado é
sobrevivível.

## A mesma questão, apontada para o outro lado

Tudo o que vai acima é sobre código que produzimos. A mesma lógica
aplica-se ao código que recebemos. Alguém abre um pull request contra um
dos nossos repositórios. O patch foi escrito por um modelo. O que é que
essa pessoa nos está a conceder?

A maioria dos projetos trata disto com o
[Developer Certificate of Origin](https://developercertificate.org/) — o
DCO, a linha `Signed-off-by:` no fundo de uma mensagem de commit. É uma
declaração curta a que o contribuidor atesta ao assinar: que criou a
contribuição por si próprio, ou que veio de uma fonte sob uma licença
compatível e tem o direito de a submeter sob os termos do projeto. É
deliberadamente leve. Sem advogados, sem papelada, uma linha por commit. É
assim que o kernel Linux e o QEMU, entre muitos outros, estabelecem de
onde vem o seu código.

Para um patch escrito por máquina, nenhum dos dois ramos é claramente
verdadeiro. E a bifurcação resolve-se da mesma forma seja qual for o ramo
escolhido.

Se o resultado gerado por máquina não transporta direitos de autor, o
contribuidor não detém direitos sobre ele. Não há nada a licenciar-nos.

Se, em alternativa, se trata como derivado dos dados de treino, os
direitos — sejam eles quais forem — pertencem a quem escreveu esses
dados. O contribuidor continua sem nada, e continua sem nada a
licenciar-nos.

De qualquer forma, não podem conceder o que não detêm. A assinatura não é
desonesta. O contribuidor assinou de boa-fé e fez o trabalho. É
simplesmente vazia: uma transferência de algo que nunca foi seu para
transferir.

A consequência prática é menos alarmante do que isto soa, e os dois ramos
divergem bastante.

No primeiro ramo, não é preciso concessão nenhuma. Material de que
ninguém é dono pode ser usado por qualquer pessoa. Aceitar o patch é
inofensivo e nada de mau acontece. O que muda discretamente é na outra
direção: o copyleft assenta em direitos de autor, e não se pode aplicar a
material que não os transporta. Um projeto GPL a acumular patches escritos
por máquina acumula partes que a sua própria licença pode não alcançar. A
licença continua a reger a obra como distribuída. O núcleo aplicável lá
dentro afina-se, lentamente, sem que ninguém repare.

O segundo ramo tem dentes. Se um modelo reproduz dados de treino
memorizados palavra por palavra — o que acontece, mais com idiomas comuns
e implementações bem conhecidas do que com lógica original — então
aceitou-se código com direitos de autor de outra pessoa, sob a garantia de
um contribuidor que não tinha forma de verificar. Todo o valor do DCO está
em quem assina estar em posição de saber. Aqui não está.

O Debian está a trabalhar nisto agora. Uma
[resolução geral sobre o uso de LLM](https://www.debian.org/vote/2026/vote_002)
entrou no seu período de discussão a 23 de julho de 2026 com cinco
propostas em votação. Abrangem todo o espetro: a Proposta A alteraria o
Contrato Social para proibir contribuições assistidas por LLM em pacotes,
documentação e recursos web, sem exceções; a Proposta C pede aos
contribuidores que evitem LLMs tanto quanto praticável, exige redação só
por humanos para comunicações do projeto, e permite que mantenedores
individuais imponham as suas próprias proibições; as Propostas B, D e E
permitem trabalho assistido por IA sob condições, assentes variavelmente
em verificação de licenciamento, responsabilização do contribuidor,
divulgação, e restrições ao envio de material confidencial para serviços
na nuvem. À data de escrita, está em discussão e nada está decidido.

Esta é a segunda vez. Uma
[tentativa anterior em 2024](https://lwn.net/Articles/972331/) terminou
sem resolução, e o raciocínio para parar vale a pena guardar: a objeção a
agir não foi que a preocupação fosse infundada, mas que uma regra que
ninguém consegue fazer cumprir não vale a pena adotar. Não se consegue
olhar para um diff e saber.

Isto não é uma preocupação marginal. Atinge com mais força exatamente os
projetos com a proveniência mais cuidada, porque todo o modelo de um
projeto baseado em DCO sobre a origem do seu código assenta nessa única
declaração.

Não resolvemos como vamos lidar com isto, e estamos numa posição fraca
para ser rigorosos. Distribuímos portagens escritas por um modelo. Um
projeto que publica código escrito por máquina e recusa contribuições
escritas por máquina está a segurar duas posições incompatíveis ao mesmo
tempo, e preferíamos não o fazer. As opções honestas são as mesmas que o
Debian está a pesar — divulgação, responsabilização do contribuidor, ou
uma regra que ninguém consegue verificar — e não escolhemos nenhuma.

## O outro eixo ao longo do qual o argumento corre

O debate do Debian é sobre proveniência e licenciamento. Não é o único
eixo, e o segundo nada tem a ver com direitos de autor.

O Codeberg, a forja FLOSS, adotou duas moções aprovadas pelos membros em
julho de 2026 e
[expôs o seu raciocínio](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
em termos que mal tocam nas licenças. As objeções são sobre custos e
esforço: consumo de energia e hardware empurrado para todos; tráfego de
crawlers que pressiona pequenas forjas a defesas que também estorvam
utilizadores normais; projetos "vibe-coded" de utilização única,
publicados e nunca mantidos; e a carga sobre quem revê:

> Maintainers are under an increased work-load due to people submitting
> (often well-meaning) low-effort, LLM-generated contributions that
> require substantial amounts of time to review.

Os seus Termos de Utilização agora desencorajam tais projetos, aplicados
caso a caso por moderadores em vez de remoção em massa.

Há, portanto, duas questões independentes em circulação, e um projeto
pode cair em qualquer ponto da grelha: se código escrito por máquina pode
sequer ser licenciado, e se o ecossistema consegue absorver o volume. O
Debian está a votar na primeira e não concluiu. O Codeberg agiu sobre a
segunda. Nenhum dos resultados resolve o outro, e as respostas que um
projeto dá a cada uma estão largamente descorrelacionadas.

## A parte que não vamos fingir que está resolvida

Talvez não tivéssemos precisado de fazer nada disto.

Considere-se os três argumentos em conjunto. A funcionalidade não é
protegida — o TJUE disse-o diretamente. O resultado puramente gerado por
máquina pode não ter autor humano, pelo que pode não haver novos direitos
de autor com que nos preocuparmos e, incomodamente, nenhum deles nosso. E
um protocolo com dois modelos, executado com disciplina real, pode ser
uma sala limpa genuína, caso em que a portagem nunca tocou em expressão
protegida.

Se as três se verificarem, algumas destas portagens poderiam ter sido
licenciadas permissivamente com a consciência tranquila. Se nenhuma se
verificar, a nossa escolha conservadora foi simplesmente correta. Não
sabemos qual é o caso, e não o testámos. Não temos interesse em ser o
caso que resolve isto.

A questão não desaparece por ser ignorada. Este tipo de portagem está a
tornar-se comum — é barata agora, e há uma grande quantidade de C não
mantido que vale a pena mudar para algum lugar onde possa ser mantido.
Cada uma dessas portagens vai enfrentar as mesmas duas questões, e a
maioria vai responder não as colocando. O mesmo se aplica a todo o
projeto que integra um patch que não escreveu, ou seja, a todos eles. As
questões chegam quer se esteja a escrever o código quer apenas a
aceitá-lo.

---
title: "O teu modelo de sentimento não distingue uma queixa de uma despedida"
description: "Duas mensagens de apoio ao cliente com ar zangado. Um cliente está prestes a escalar; o outro está prestes a ir-se embora sem dizer nada. Quase nenhum modelo de emoções os consegue distinguir — porque falta-lhes a todos o mesmo eixo. Apresentamos a emotion-algebra."
date: 2026-07-13
updated: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "Affective Computing"
  - "Emotion"
  - "Machine Learning"
  - "LILACS"
  - "Open Source"
  - "Science"
draft: false
---

Chegam duas mensagens à tua fila de apoio ao cliente.

> "É a terceira vez que a vossa app me perde o trabalho. Resolvam isso."

> "Não sei se estou a fazer isto bem e tenho medo de ter estragado alguma coisa."

Passa-as pelo modelo de sentimento que quiseres. Ambas voltam iguais:
**negativo, ativação alta**. Com ar de zanga. Perturbadas.

Por isso tratas as duas da mesma maneira — e acabaste de cometer um erro, porque
estas duas pessoas precisam de coisas opostas.

A primeira está *furiosa*, e as pessoas furiosas estão **envolvidas**. Acreditam
que conseguem forçar uma solução, e vão continuar a insistir até a obterem.
Manda-lhes um pedido de desculpas caloroso e a promessa de que vais ver o caso, e
só as vais enfurecer ainda mais.

A segunda está *assustada*. Não acha que consiga resolver o que quer que seja.
Está a uma má resposta de distância de fechar o separador e nunca mais voltar — em
silêncio, sem nunca te dizer porquê. Manda-lhe um número de ticket e uma janela de
resolução de cinco dias, e perdeste-a.

Uma é uma queixa. A outra é uma despedida. E quase nada na caixa de ferramentas da
IA emocional te consegue dizer qual é qual.

Passámos algum tempo a perceber porquê. A resposta acabou por ser mais interessante
do que esperávamos, e termina com uma rede neuronal treinada em mil milhões de
tweets a concordar com um artigo de psicologia de 1985 que nunca leu.

## A dimensão que falta

Eis a questão com a zanga e o medo: **são quase idênticos, medidos da forma
habitual.**

Ambos sabem mal. Ambos são altamente ativados — o teu ritmo cardíaco sobe de
qualquer maneira. Essas duas qualidades, "quão bem sabe" e quão "acelerado estás",
são as duas dimensões sobre as quais quase todos os modelos de emoções são
construídos. Costumam chamar-se *valência* e *ativação*.

A zanga e o medo ficam um em cima do outro nesse espaço. Nenhum modelo construído a
partir desses dois números os consegue separar, por mais sofisticado que seja,
porque a informação simplesmente não lá está.

O que realmente os separa é uma terceira coisa: **sentes que consegues fazer alguma
coisa quanto a isso?**

A zanga é o que sentes quando algo está errado *e consegues agir*. O medo é o que
sentes quando algo está errado *e não consegues*. Esse sentido de controlo — os
psicólogos chamam-lhe *potencial de resposta* ou *potência* — é toda a diferença. É
também o que te diz se alguém vai lutar ou fugir, escalar ou desaparecer.

Não é uma ideia marginal. **Quatro programas de investigação independentes**
chegaram a ela separadamente ao longo de duas décadas, e um deles (Lerner & Keltner,
2001) demonstrou-a *causalmente*: as pessoas zangadas fazem juízos otimistas e
tolerantes ao risco enquanto as pessoas assustadas fazem juízos pessimistas e avessos
ao risco — e o efeito passa pelo controlo e pela certeza, não por quão mal se sentem.

Vale a pena parar na descoberta mais impressionante que fizeram. **Os juízos das
pessoas zangadas parecem-se com os juízos das pessoas felizes.** Não com os das
pessoas assustadas. A zanga e a felicidade têm valência oposta, e isso não importa,
porque não é a valência que está a fazer o trabalho.

Então porque é que este eixo não aparece nas ferramentas?

## Porque é que o eixo desapareceu

A maior parte das ferramentas de emoções remonta a um pequeno número de modelos
teóricos. Os dois mais influentes são a **Roda das Emoções de Plutchik** (1980) e,
construída em cima dela, a **Ampulheta das Emoções de Cambria** (2012), que é o
modelo por trás da SenticNet.

A roda de Plutchik é um objeto bonito. Tem a forma de um círculo cromático, e
transporta consigo a ideia central do círculo cromático: as emoções vêm em **pares
opostos**. A alegria opõe-se à tristeza. A confiança opõe-se ao nojo. E a zanga
opõe-se ao medo.

Este último é o problema, e depois de o veres já não o consegues desver.

Se a zanga e o medo são extremos opostos de um mesmo eixo, então anulam-se. Pega na
raiva mais intensa que uma pessoa consegue sentir, mistura-a com o terror mais
intenso, e pergunta ao modelo o que obténs:

```
(rage + terror) / 2  ==  neutrality
```

**Calma.** Mistura os dois estados negativos mais violentos de que um ser humano é
capaz, e o modelo reporta que não sentes absolutamente nada.

Isso não é um bug numa implementação. É uma consequência direta da geometria — e
significa que o modelo deitou fora exatamente a quantidade de que precisávamos. Ao
tornar a zanga e o medo *opostos*, garante que nunca podem ser *distinguidos*.

Já agora, a roda meio que sabe disto. A Ampulheta tem uma fórmula para pontuar
sentimento, e nessa fórmula o eixo zanga–medo está envolto num valor absoluto:
**ambos os extremos contam como desagradáveis**. O que é verdade! A zanga e o medo
são ambos desagradáveis. Mas contradiz discretamente a geometria que os colocou em
polos opostos logo à partida. A própria aritmética do modelo discorda do seu próprio
diagrama.

## O que a evidência diz de facto

A esta altura parámos de escrever código e fomos ler a literatura, e não foram uns
dias confortáveis.

A estrutura de pares opostos de Plutchik já foi testada. Em 2009, Smith & Schneider
submeteram-na a mais de dois mil testes estatísticos e concluíram que a teoria da
roda das emoções "não recebe qualquer apoio empírico." Os pares opostos são uma
metáfora emprestada da teoria da cor. Não são uma descoberta sobre pessoas.

Entretanto, as coisas que *de facto* se replicam, o circumplexo valência–ativação de
Russell e a dimensão de controlo que separa a zanga do medo, são as
peças que raramente chegam a software a funcionar.

Há aqui um problema de segunda ordem, e é o que realmente nos incomodou. Cada um
destes modelos é *utilizável*. São vívidos, são ensináveis, cabem num slide. Por isso
são repetidos — e assim que um modelo é repetido o suficiente, verificar de onde veio
começa a parecer pedantismo em vez de diligência. É assim que uma metáfora se torna
discretamente uma fundação.

## Construir sobre o que sobrevive

Por isso construímos a [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra),
e pusemos o eixo em falta no centro dela.

O núcleo tem cinco números: quão bem sabe, quão mal sabe (sim, separadamente — já
voltamos a isso), quão no controlo te sentes, quão ativado estás, e quão inesperado
tudo isto é. Vêm de Fontaine e colegas (2007), que os derivaram de 144 características
medidas em várias culturas em vez de um diagrama apelativo.

Agora a mistura comporta-se:

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

Não "calma". **Angústia** — profundamente desagradável, altamente ativada, com o
sentido de controlo anulado. Que é exatamente ao que uma mistura de raiva e terror
deve saber.

E a fila de apoio ao cliente funciona:

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'disgust'
afraid.valence, afraid.potency   # -0.47, -0.42   -> 'apprehension'
```

Olha para aqueles números. **A valência é quase idêntica** — ambas as mensagens são
mais ou menos igualmente desagradáveis, e é por isso que um modelo de sentimento
convencional vê uma coisa só. A *potência* é oposta. Uma pessoa sente-se capaz de
agir; a outra não.

É essa a tua queixa, e é essa a tua despedida.

## O teste que podia ter deitado isto abaixo

Eis o que nos preocupava. Tudo o que está acima assenta na literatura de psicologia,
e essa literatura é construída quase inteiramente sobre **questionários** — pessoas a
classificar palavras numa escala de 1 a 9. Os questionários têm uma propriedade
desagradável: podem discretamente *codificar* uma teoria em vez de a testar. Se toda a
gente que escreve questionários de emoções aprendeu pelo mesmo manual, os questionários
vão concordar com o manual, e toda a gente se vai sentir muito validada.

Queríamos uma testemunha sem qualquer formação teórica.

O **DeepMoji** é uma rede neuronal que foi treinada em **1,2 mil milhões de tweets**
para adivinhar com que emoji uma mensagem terminava. É genuinamente só isso que faz.
Nunca ouviu falar de Plutchik, nem da teoria da avaliação, nem de potencial de
resposta. Não tem opinião nenhuma sobre emoções — apenas tem um sentido extremamente
bem informado de como as pessoas *realmente escrevem* quando sentem coisas.

Por isso fizemos-lhe a única pergunta que importava:

> Consegues distinguir a zanga do medo? E, se sim — o que estás a usar para o fazer?

**Consegue.** Dados comentários humanos reais rotulados por humanos reais, separa a
zanga do medo muito acima do acaso. (Baralha as etiquetas e a capacidade desaparece
por completo, portanto não é um artefacto do nosso método.)

Depois fomos ver *como*. Pegámos na direção que o DeepMoji usa para distinguir os
dois, e medimos o quanto se alinha com cada um dos nossos cinco eixos.

Alinha-se com a **potência** — três vezes mais fortemente do que com qualquer outra
coisa. Não com a valência. Não com a ativação.

Um modelo treinado em mil milhões de tweets, ao qual nunca foi dito que a zanga
envolve um sentido de controlo e o medo a sua ausência, agarra-se exatamente a essa
distinção quando o obrigas a escolher. Encontrou o eixo sozinho.

É a coisa mais convincente que temos, e queremos deixar claro que podia ter corrido
ao contrário. Se o DeepMoji tivesse separado a zanga e o medo pela valência, ou não os
tivesse separado de todo, o nosso terceiro eixo teria sido um artefacto da literatura
de psicologia e teríamos tido de o dizer.

## Agridoce, e outras coisas que um único número não consegue conter

Mais uma consequência, porque é bonita.

Guardamos "quão bem sabe" e "quão mal sabe" como **dois números separados**, em vez de
uma única pontuação a correr do negativo para o positivo. Isso parece um detalhe
técnico. Não é.

As pessoas sentem-se genuinamente bem e mal ao mesmo tempo. O estudo canónico usa o
dia da formatura: os estudantes reportam felicidade real e tristeza real *em
simultâneo*, não uma média morna das duas. Uma única pontuação de valência é
matematicamente incapaz de representar isso. Tem de reportar "moderadamente feliz", que
não é o que ninguém ali está a sentir.

Dois canais conseguem conter aquilo. O que significa que o modelo consegue representar
a vitória relutante, a despedida afetuosa, o cliente que está aliviado *e* ainda assim
furioso. São essas as emoções interessantes, e são as que um único número achata.

## Emoções para o outro lado

Tudo até aqui é sobre ler um humano. A mesma maquinaria corre ao contrário, para dar a
uma personagem uma vida emocional própria.

Uma emoção, aqui, é um *deslocamento* — foste empurrado para longe de onde
normalmente estás, e com o tempo derivas de volta. O sítio para onde derivas de volta
não é zero. Não existe "nenhuma emoção"; mesmo em repouso estás algures, e esse algures
é ligeiramente agradável, calmo, e ligeiramente no controlo. (Essa ligeira inclinação
positiva é a razão pela qual uma criatura em repouso vai *explorar* alguma coisa em vez
de ficar inerte. É um efeito real, medido.)

Por isso um guarda que acabou de ver algo aterrador não salta de volta para o neutro
quando um temporizador expira. Vai descendo através disso:

```
terror → fear → apprehension → pensiveness → acceptance
```

Medo, depois desconfiança, depois uma espécie de matutar silencioso, e por fim está
bem. Não escrevemos essa sequência; ela cai da geometria.

E dois guardas podem diferir porque assentam em lugares de repouso *diferentes*. Dá a
um deles uma linha de base de controlo ligeiramente mais baixa e o hábito de levar as
más notícias com o dobro do peso, e ele torna-se reconhecivelmente ansioso — assusta-se
mais, recupera mais devagar, matuta mais tempo. Isso é uma personagem, e são quatro
números em vez de uma árvore de comportamento.

Depois vem a parte útil: o que é que ele *faz*? Isso, também, sai do eixo de controlo.
O guarda zangado carrega sobre ti. O guarda assustado foge. "Emoção negativa" não
consegue escolher entre as duas, e nunca conseguiu.

## A parte em que te dizemos o que está mal com isto

Cada modelo na biblioteca traz uma **classificação** e uma citação — de `ESTABLISHED`
(replicado, transcultural, meta-analítico) até `METAPHOR` (um diagrama encantador que
não sobreviveu aos testes).

A roda de Plutchik lá está, classificada como `METAPHOR`, e continua a funcionar
exatamente como Plutchik especificou — `-anger` continua a dar-te `fear`, porque é isso
que o modelo dele diz. A aritmética dele está fielmente implementada, *e* o modelo dele
não está certo acerca das pessoas. Ambas as coisas são verdade, e preferimos dizer-te as
duas a escolher uma.

Somos igualmente diretos quanto às nossas próprias falhas:

**Ler a ativação a partir de texto está por resolver.** Conseguimos obter valência,
conseguimos obter potência — não conseguimos dizer de forma fiável quão *acelerada* uma
pessoa está a partir das suas palavras. O nosso melhor número é mau. Enviamo-lo rotulado
como mau em vez de torcer discretamente para que não confirmes.

**Uma das nossas próprias descobertas é provisória.** O "sentido de controlo" que
*causa* a zanga e o "sentido de controlo" que as pessoas *reportam enquanto estão
zangadas* acabam por não ser a mesma coisa — sentes-te menos no comando a meio da raiva
do que a teoria previria. Perder as estribeiras é, afinal, *perder o controlo*. Achamos
que isso é importante. Também achamos que a nossa evidência para tal é frágil, e
marcámo-la em conformidade.

## Porque é que nos demos ao trabalho

Uma biblioteca de emoções que afirma discretamente coisas que a evidência contradiz é
pior do que inútil. É *confiantemente* inútil — e tudo o que for construído em cima dela
herda o erro, silenciosamente, para sempre.

Preferimos lançar algo que te diz quanto deves confiar em cada uma das suas partes.

```bash
pip install emotion-algebra
```

A [documentação](https://github.com/TigreGotico/emotion-algebra) tem um arranque rápido
de cinco minutos, um guia para dar vida emocional a um agente, e a tabela completa de
evidências com todas as citações lá dentro. Se achas que uma das nossas classificações
está errada, o código-fonte está mesmo ali para discutires com ele — e gostaríamos
genuinamente de saber.

Entretanto: algures na tua fila de apoio ao cliente, está alguém a compor
silenciosamente uma despedida. Era bom saber quem é.

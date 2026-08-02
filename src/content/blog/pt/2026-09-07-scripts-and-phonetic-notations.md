---
title: "Escritas e Notações Fonéticas: O Que o scriptconv Realmente Converte"
description: "Uma análise aprofundada ao scriptconv, a biblioteca sem dependências que deteta sistemas de escrita e converte entre notações fonéticas. Cobre IPA, ARPABET e X-SAMPA; deteção de escrita ISO-15924; transliteração Buckwalter para árabe; decomposição de Hangul em jamo; e conversão de kana, com exemplos reais e executados e limites honestos."
date: 2026-08-01
lang: pt
author: "Casimiro Ferreira"
tags:
  - "IPA"
  - "Phonetics"
  - "NLP"
  - "Linguistics"
  - "FOSS"
draft: false
---

Um dicionário de pronúncia norte-americano diz que um gato soa a
`K AE1 T`. O Alfabeto Fonético Internacional escreve o mesmo som como
`kæt`. Um sistema diferente, apenas ASCII, escreve-o como `k"{t`. Os três
descrevem exatamente o mesmo par de fonemas — um som "k" seguido de um "a"
curto seguido de um "t". Nada no som mudou. Só mudou o alfabeto usado para
o escrever.

Isto acontece constantemente a quem combina dados de pronúncia de mais do
que uma fonte. Um conjunto de dados de fala construído a partir de um
dicionário norte-americano usa uma notação. Um léxico europeu usa outra.
Um motor de texto-para-fala espera uma terceira. Antes de qualquer um
desses dados poder ser combinado, pesquisado, ou comparado, tem de ser
traduzido de um alfabeto fonético para outro — a mesma tarefa que um
tradutor faz entre línguas humanas, exceto que aqui as "línguas" são
formas de escrever som em vez de formas de escrever palavras.

O `scriptconv` é uma pequena biblioteca em Python que faz essa tradução,
mais uma tarefa relacionada um nível acima: descobrir em que sistema de
escrita um trecho de texto sequer está antes de se poder fazer qualquer
outra coisa com ele. Não tem opinião nenhuma sobre linguística — não
adivinha como uma palavra se pronuncia. Apenas move símbolos que já
representam sons conhecidos de uma notação para outra, e identifica
escritas a partir dos próprios carateres.

## Alguns termos, definidos com clareza

- **Escrita** (script): um sistema de escrita — o conjunto real de
  carateres, como o latino, o cirílico, ou o hangul. Não é o mesmo que uma
  língua: o inglês, o francês e o vietnamita usam todos a escrita latina,
  e o sérvio pode escrever-se tanto em cirílico como em latino.
- **Ortografia**: as regras convencionais de escrita para uma língua
  específica numa escrita — maiúsculas, marcas de acento, espaçamento.
- **Fonema**: uma unidade distinta de som numa língua, como o som "k" em
  "cat".
- **IPA** (Alfabeto Fonético Internacional): um alfabeto padrão para
  escrever sons com precisão, independentemente da grafia normal de
  qualquer língua.
- **Transliteração**: converter texto de uma escrita para outra mapeando
  carateres, visando preservar exatamente a grafia original em vez da
  pronúncia.
- **Romanização**: transliteração especificamente para a escrita latina.

## Porque é que existem alfabetos fonéticos só ASCII

O IPA precisa de carateres como `ʃ`, `ʒ`, `ə`, e `ˈ` que não estão num
teclado padrão. Isso foi um problema real durante décadas de computação,
antes de o Unicode ser universal e antes de a maioria das fontes,
terminais, e formatos de ficheiro suportarem de forma fiável texto
não-ASCII. Investigadores construíram substitutos apenas ASCII: o
ARPABET, desenvolvido para trabalho de reconhecimento de fala em inglês
americano, e o X-SAMPA, uma codificação ASCII do IPA completo desenvolvida
para ser segura em email e terminais antigos. Não são curiosidades
históricas. O ARPABET ainda é a notação usada por dicionários de
pronúncia e ferramentas de fala amplamente implantados em inglês
americano, e o X-SAMPA ainda aparece em ferramentas linguísticas que
precisam de texto simples. Qualquer coisa que leia esses dados tem de
conseguir ler esse alfabeto.

O `scriptconv` corre a conversão real. Isto é resultado executado, não
uma descrição:

```python
from scriptconv import convert, arpa_to_ipa, ipa_to_arpa

convert("K AE1 T", "arpa", "ipa")
# 'kæt'

convert("HH AH0 L OW1", "arpa", "ipa")
# 'həloʊ'

convert("kˈæt", "ipa", "x-sampa")
# 'k"{t'

arpa_to_ipa("HH AH0 L OW1", stress=True)
# 'həlˈoʊ'

ipa_to_arpa("həlˈoʊ", stress=True)
# 'HH AH0 L OW1'
```

Os marcadores de acento sobrevivem à ida e volta. O ARPABET marca o
acento com um dígito colado à vogal (`OW1`); o IPA marca-o com um `ˈ`
colocado antes da sílaba tónica. `arpa_to_ipa(..., stress=True)` move
essa informação, e converter de volta reconstrói exatamente os dígitos
originais.

O IPA fica no meio de tudo isto por desenho. O `scriptconv` trata cada
notação como um nó num grafo e cada conversor como uma aresta, e encaminha
as conversões através do IPA como núcleo em vez de escrever à mão um
conversor para cada par de notações diretamente:

```python
from scriptconv import DEFAULT_GRAPH

[f"{e.src}->{e.dst}" for e in DEFAULT_GRAPH.route("arpa", "x-sampa")]
# ['arpa->ipa', 'ipa->x-sampa']
```

Nove notações transcodificam através desse núcleo no total: ARPABET,
X-SAMPA, Kirshenbaum, Lexique, Cotovía, RFE, e mantoq, mais Buckwalter,
coberto abaixo.

## Detetar a escrita antes de fazer qualquer outra coisa

Antes de um software poder decidir como processar um trecho de texto —
em que direção o renderizar, que corretor ortográfico correr, que fonte
escolher — tem de saber em que escrita o texto está. Essa é uma pergunta
diferente de em que língua está. A escrita identifica o conjunto de
carateres; a língua identifica o vocabulário e a gramática. O sérvio, de
novo, pode ser cirílico ou latino. O usbeque também pode. O `scriptconv`
deteta a escrita diretamente a partir dos carateres, e separadamente mapeia
um código de língua para a escrita em que é convencionalmente escrita:

```python
from scriptconv import detect_script, script_runs, lang_to_script, base_direction

detect_script("Здравствуйте")
# 'Cyrl'

detect_script("안녕하세요")
# 'Hang'

script_runs("привет hello")
# [('Cyrl', 'привет '), ('Latn', 'hello')]

base_direction("مرحبا hello")
# 'mixed'

lang_to_script("uzb_cyr")
# 'Cyrl'
```

O `detect_script` devolve um código ISO 15924 — o registo padrão de
etiquetas de quatro letras para escritas (`Cyrl` para cirílico, `Hang`
para hangul, `Latn` para latino, `Arab` para árabe). O `script_runs`
divide texto misto em trechos contíguos por escrita, o que é o que um
renderizador precisa para decidir, frase a frase, que fonte e direção de
texto aplicar. O `base_direction` reporta se uma string mista se lê da
esquerda para a direita, da direita para a esquerda, ou ambas.

## Os casos difíceis: Buckwalter, Hangul, e kana

Três conversões de sistemas de escrita aparecem com frequência suficiente
em pipelines reais para que o `scriptconv` trate cada uma diretamente.

O **Buckwalter**, para árabe, é um esquema de transliteração ASCII que
mapeia cada letra e diacrítico árabe para um caráter ASCII específico,
um-para-um, para que a grafia original — incluindo as marcas de vogais
que a maioria do texto nativo omite — possa ser reconstruída exatamente.
Existe porque a escrita árabe é incómoda de tratar em pipelines e
ferramentas construídas à volta de ASCII: ordenação, diffing, expressões
regulares, e formatos de texto mais antigos tornam-se todos mais fáceis
assim que o texto é ASCII de alfabeto latino, desde que o mapeamento seja
exato e reversível.

```python
from scriptconv import buckwalter_to_arabic, arabic_to_buckwalter

buckwalter_to_arabic("mrHbA")
# 'مرحبا'

arabic_to_buckwalter("مرحبا")
# 'mrHbA'

arabic_to_buckwalter("رحمٰن")
# 'rHm`n'
```

O último exemplo inclui o alef adaga, um pequeno diacrítico
sobrescrito usado num punhado de palavras (`رحمٰن`, *rahman*) — o
Buckwalter tem um caráter ASCII específico reservado para ele (`` ` ``),
distinto de um alef normal, para que a transliteração não colapse os
dois.

O **Hangul** parece blocos silábicos, mas cada bloco é um agregado
composto de letras individuais (jamo) dispostas numa grelha — da mesma
forma que "H", "A", "N" se combinam visualmente num único glifo para "han"
em vez de serem escritos da esquerda para a direita. Software que precisa
das letras individuais — para pesquisa, para análise fonológica, para
alimentar um sistema diferente — tem de as separar de novo:

```python
from scriptconv.translit import decompose_hangul

decompose_hangul("한국")
# 'ㅎㅏㄴㄱㅜㄱ'

decompose_hangul("국민")
# 'ㄱㅜㄱㅁㅣㄴ'
```

Esse último exemplo importa pelo que *não* faz: 국민 (*gungmin*, "cidadão")
pronuncia-se com assimilação nasal, `[ɡuŋmin]`, mas o `decompose_hangul`
devolve as letras tal como escritas — `ㄱㅜㄱㅁㅣㄴ`, sem assimilação —
porque a decomposição é aritmética sobre o ponto de código Unicode, não
uma regra fonológica. Diz o que foi escrito, não o que soa.

A conversão de **kana** move-se entre os dois silabários do japonês,
hiragana e katakana, que representam os mesmos sons com carateres
diferentes a um deslocamento fixo de ponto de código:

```python
from scriptconv import hira_to_kana, kana_to_hira

hira_to_kana("こんにちは")
# 'コンニチハ'

kana_to_hira("カタカナ")
# 'かたかな'
```

## Porque é que isto vive na sua própria biblioteca

Um phonemizer — uma ferramenta que adivinha como se pronuncia uma palavra
escrita — precisa de juízo linguístico: regras de acentuação, exceções,
pronúncia dependente do contexto. O `scriptconv` deliberadamente não tem
nada disso. Cada função acima é uma pesquisa em tabela ou um cálculo de
ponto de código: mesma entrada, mesma saída, sem adivinhar, sem modelo de
linguagem, nada que pudesse estar errado sobre como uma língua específica
realmente soa. É isso que o torna seguro para partilhar entre todos os
phonemizers que precisam dele, em vez de cada phonemizer reimplementar a
sua própria tabela ARPABET com os seus próprios bugs. O artigo
[a stack de fonologia](/pt/blog/2026-08-10-the-phonology-stack) cobre como
os motores reais de adivinhação de pronúncia — os que carregam opiniões
linguísticas — são construídos por cima desta camada em vez de a
duplicarem.

## Onde o mapeamento não é exato

Converter entre notações nem sempre é sem perdas, e o `scriptconv`
regista isto como dados consultáveis em vez de o deixar como surpresa.
Cada notação tem duas propriedades rastreadas de forma independente: se
convertê-la para IPA e de volta reproduz os símbolos originais
exatamente, e se o IPA convertido para ela e de volta reproduz todos os
símbolos IPA.

O ARPABET falha nas duas direções: tem um inventário fonémico
restrito e específico do inglês, por isso ir IPA → ARPABET → IPA pode
perder distinções que o IPA consegue fazer e para as quais a tabela do
ARPABET não tem símbolo. O X-SAMPA e o Lexique cobrem fielmente o
inventário IPA completo mas não têm garantia de fazer a ida e volta de
forma limpa a partir do seu próprio lado. O Kirshenbaum e o Buckwalter
fazem a ida e volta de forma limpa a partir do seu próprio lado para IPA
mas não o inverso. O mantoq, o alfabeto fonético do fonemizador de árabe
halabi, só converte numa direção, para IPA — não há conversor de volta.
Nada disto está escondido nalgum docstring; são dados que a biblioteca
expõe para que quem chama possa verificar antes de assumir que uma ida e
volta é segura.

---

Se está a juntar dados de pronúncia de várias fontes, ou precisa de
detetar escritas e normalizar texto antes de este chegar a um
phonemizer, [entre em contacto](/pt/contact) ou veja o que mais construímos
nesta área na [página de serviços](/pt/services).

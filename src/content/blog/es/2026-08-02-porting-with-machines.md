---
title: "Portar con Máquinas, y la Pregunta de Licencia que No Pudimos Responder"
description: "Reescribimos varios programas en C, C++ y Java — el G2P de espeak-ng, Cotovía, AhoTTS, HermiT — como Python puro, con una IA leyendo el código fuente original y un humano orquestando el trabajo. Nadie de nuestro lado leyó los originales. Eso plantea dos preguntas separadas: ¿puede el resultado ser propiedad de alguien siquiera, y es una obra derivada de la entrada? Mantuvimos las licencias originales porque era más barato que responder. Seguimos pensando que la pregunta está abierta."
date: 2026-08-01
lang: es
author: "Casimiro Ferreira"
tags:
  - "FOSS"
  - "Licensing"
  - "Open Source"
  - "Python"
  - "G2P"
draft: false
---

Hemos reescrito un puñado de programas antiguos en Python. El front-end de G2P de
[espeak-ng](https://github.com/espeak-ng/espeak-ng), las reglas de transcripción gallega y española
de [Cotovía](https://gtm.uvigo.es/en/transfer/software/cotovia/),
el procesamiento lingüístico del euskera de [AhoTTS](https://github.com/aholab/AhoTTS),
el razonador N3 [EYE](https://github.com/eyereasoner/eye), y el razonador OWL 2 DL
[HermiT](http://www.hermit-reasoner.com/). C, C++ y Java, la mayoría con más
de una década, todos siguen siendo lo mejor disponible para lo que hacen.

El motivo fue corriente. Un programa en C que fonemiza gallego es excelente hasta
que quieres tenerlo dentro de una pila de voz en Python en una placa ARM. Entonces
necesitas un compilador, una cadena de herramientas, compilación cruzada, una
historia de empaquetado por plataforma, y una frontera de subproceso a través de la
cual tienes que serializar texto. Un razonador en Java necesita una JVM.
El Python puro necesita `pip install`. También se lee: puedes abrir el archivo que
decide dónde va el acento y cambiarlo, sin saber cómo funciona el sistema de
compilación original.

Los portes se hicieron de forma semiautónoma. Una IA leyó el código fuente original y
escribió el Python; un humano dirigió el trabajo y comprobó la salida contra el
binario original. En varios de ellos, nadie de nuestro lado llegó a leer el código
fuente original jamás. El modelo lo leyó. Nosotros leímos los diffs y las pruebas
de paridad.

Eso deja una pregunta sobre la que tuvimos que tomar una decisión, y que no
pudimos responder: **¿es el resultado una obra derivada, y de quién es?**

Somos ingenieros. Nada de esto es asesoramiento legal, y no estamos cualificados
para darlo. Esto es una descripción de una decisión que tomamos y del razonamiento
detrás de ella.

## Dos preguntas que se siguen confundiendo

Reimplementar un programa leyendo su código fuente no es nuevo. La gente lleva
reescribiendo C en Python desde que existe Python. Lo nuevo es el arreglo:
quien lee es una máquina, quien implementa es la misma máquina, y los humanos
implicados nunca vieron el original.

Aquí hay dos preguntas, y casi toda discusión sobre esto las colapsa en una sola.
Son independientes.

1. **¿Puede el resultado ser propiedad de alguien siquiera?** El derecho de autor
   se aplica a obras con autores. Si una máquina produjo el código, ¿quién es el autor?
2. **¿Es el resultado una obra derivada de la entrada?** Quienquiera que lo haya
   autorado — si es que alguien lo hizo — ¿infringe el resultado el original?

Puedes responder que sí a una y no a la otra en cualquier combinación.
Mantenlas separadas.

Algo de vocabulario, ya que el resto de esto depende de él. Una **obra derivada**
es una obra basada en una preexistente — una traducción, una adaptación, un
porte. El derecho a hacer una pertenece al titular del derecho de autor del
original. Las licencias **copyleft** (la familia GPL) te dejan usar y modificar
el código con la condición de que lo que distribuyas se mantenga bajo los mismos
términos. Las licencias **permisivas** (MIT, Apache-2.0, BSD) te dejan hacer
esencialmente cualquier cosa, incluido distribuir el resultado dentro de software
propietario. La **LGPL** está en medio: el copyleft se aplica a la propia
biblioteca, pero enlazarla en un programa mayor no obliga a que ese programa sea
abierto. Todas se construyen sobre el derecho de autor. Solo muerden si hay un
derecho de autor que hacer valer.

## Pregunta uno: ¿hay un autor?

El derecho de autor necesita un autor humano. La Oficina de Derechos de Autor de
EE. UU. lo ha sostenido de forma consistente, y en *Thaler v. Perlmutter* el
Tribunal de Apelaciones del Circuito de D.C. estuvo de acuerdo: la Ley de
Derechos de Autor «requiere que toda obra elegible sea autorada en primera
instancia por un ser humano» (n.º 23-5233, D.C. Cir., 18 de marzo de 2025; el
Tribunal Supremo denegó el certiorari en marzo de 2026). El estándar europeo
tiene una forma distinta y llega a un lugar similar — la protección requiere la
«creación intelectual propia del autor», lo que presupone un autor que crea.

Ninguna de esas afirmaciones dice que el trabajo asistido por IA no sea
protegible. Ambas dicen que lo que la máquina generó por sí sola sí lo es. La
línea atraviesa la obra, no la rodea, y dónde caiga exactamente depende de
cuánto contribuyó un humano. En nuestros portes, la contribución humana es real
pero delgada: elegir el objetivo, estructurar el paquete, juzgar los fallos de
paridad. No es obvio que eso nos convierta en los autores de las reglas de
transcripción.

Lo cual produce un objeto incómodo. Una licencia es una concesión de permiso por
parte de un titular de derechos. Si nadie posee derechos sobre el resultado, el
archivo de licencia en la raíz del repositorio es decoración. Nótese hacia dónde
va ese argumento: se come primero tu propia licencia. Cualquiera que argumente
que el código generado por máquina no tiene dueño está argumentando que sus
propios términos de distribución no son exigibles, antes siquiera de acercarse a
los del proyecto original.

## Pregunta dos: ¿está derivado?

Esta no le importa quién sea el autor. La infracción gira sobre el acceso al
original más la similitud sustancial con su **expresión** protegida — la forma
particular en que se escribió la cosa, no lo que hace.

Tuvimos acceso. El modelo leyó el código fuente. Esa mitad no está en disputa.

La mitad de la similitud es donde se pone interesante, y donde el cambio de
lenguaje importa menos de lo que la gente espera. Traducir una novela a otro
idioma produce una obra derivada; ese es el ejemplo de manual. Cambiar el
lenguaje derrota una demanda por copia literal. No derrota una demanda sobre la
estructura — el orden de las transformaciones, la descomposición en funciones,
la forma de las tablas de reglas, la manera en que se reparten los casos límite.

También merece decirse claramente que una herramienta no blanquea nada. Si
diriges una copia y distribuyes el resultado, eres tú quien lo hizo. «Lo escribió
el modelo» no es una defensa más de lo que lo sería «lo emitió el compilador».

## El argumento más fuerte en el otro lado

Existe un caso serio de que una reimplementación entre lenguajes está bien, y
merece exponerse correctamente en lugar de mencionarse de pasada.

En *SAS Institute v World Programming* (TJUE, C-406/10, 2 de mayo de 2012), el
Tribunal sostuvo que «ni la funcionalidad de un programa de ordenador ni el
lenguaje de programación y el formato de los archivos de datos utilizados en un
programa de ordenador para explotar algunas de sus funciones constituyen una
forma de expresión de ese programa». Por lo tanto no están protegidos por
derecho de autor. La Directiva de Software (2009/24/CE, artículo 1(2)) dice lo
mismo sobre las ideas y principios subyacentes a cualquier elemento de un
programa. El Tribunal también sostuvo que un licenciatario puede estudiar y
observar el comportamiento de un programa para determinar las ideas que hay
detrás, y reimplementarlas.

Eso no es un tecnicismo. Significa que lo que un fonemizador *hace* — esta
secuencia de grafemas, en este contexto, se convierte en aquel fonema — no es
propiedad de nadie. Las reglas de acentuación del gallego son hechos sobre el
gallego. La semántica directa de OWL 2 es una especificación publicada del W3C.
Bajo esa lectura, una reimplementación que reproduce comportamiento y no
expresión es lícita, y una reescritura entre lenguajes está mucho más lejos de
la infracción que un copiar y pegar.

La brecha entre ese argumento y nuestra situación es la fuente. *SAS* trata
sobre estudiar el comportamiento. Nuestro modelo leyó el código.

## El precedente que ya existe, y hasta dónde llega

El argumento de que «la salida de una máquina no tiene autor, así que no se
aplica derecho de autor» no es un experimento mental. Es fundacional en
producción, a nivel de toda la industria. Tanto la destilación de modelos como
los datos sintéticos de entrenamiento descansan sobre él.

La afirmación pública más clara de esto es
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), un modelo abierto de
TTS ampliamente usado. Su ficha dice que se entrenó exclusivamente con audio
permisivo o no protegido por derecho de autor, y enumera entre las fuentes
permitidas:

> Audio sintético generado por modelos de TTS cerrados de grandes proveedores

con una nota a pie de página que apunta a la
[guía de política de IA](https://copyright.gov/ai/ai_policy_guidance.pdf) de la
Oficina de Derechos de Autor de EE. UU. La cadena de razonamiento es la de
arriba: el audio fue generado por una máquina, la salida de una máquina no
tiene autor humano, así que no subsiste derecho de autor en ella, así que no hay
nada que infringir al entrenar con él. El modelo se distribuye bajo Apache-2.0.
La ficha también traza un límite — excluye el audio sintético de modelos de TTS
*abiertos* y de clones de voz personalizados — lo cual es una señal de que los
autores calcularon dónde deja de aplicarse el argumento en lugar de aplicarlo a
todo.

Aquí está la parte que importa para el porte. **Ese precedente resuelve la otra
mitad del problema.**

El argumento de Kokoro trata sobre la **entrada**. Lo que consumieron era en sí
mismo generado por máquina, así que el argumento es que no llevaba derecho de
autor en absoluto desde el principio. Sin derecho de autor de entrada, por
tanto nada que heredar.

Nuestra situación es la imagen especular. Lo que consumimos — el C de
espeak-ng, el C++ de Cotovía, el Java de HermiT — está inequívocamente escrito
por humanos y protegido por derecho de autor, por personas nombradas, en
universidades nombradas, hace décadas. Lo que *salió* fue escrito por máquina.
El argumento de «sin derecho de autor en la salida de IA» aterriza en nuestra
salida, no en nuestra entrada. No viaja hacia arriba. Es, de nuevo, el
argumento que socava nuestra propia licencia mientras deja los derechos del
proyecto original completamente intactos.

Hay una asimetría adicional que merece señalarse. La exposición residual de
Kokoro no es realmente derecho de autor en absoluto — es **contrato**. Los
términos de servicio de los proveedores cerrados generalmente prohíben usar su
salida para entrenar modelos competidores, y un término que aceptaste no se
evapora porque la salida resultara no tener derecho de autor. El copyleft no
funciona así. Nadie hace clic en «acepto» para la GPL. Es una concesión
unilateral de permiso, y solo te vincula si necesitas ese permiso — es decir,
solo si lo que hiciste es una obra derivada.

Así que todo el asunto colapsa de vuelta sobre la única pregunta que nadie ha
respondido. Si una reimplementación entre lenguajes, escrita por máquina, no es
una obra derivada, la GPL nunca entró en juego y nada de ella se aplicó. Si lo
es, la GPL se aplicó desde la primera línea. No hay un tercer estado, y ninguna
cantidad de discusión sobre la autoría de la IA mueve esa aguja en particular.

## Salas limpias, y si dos modelos hacen una

La respuesta clásica a exactamente este problema es el protocolo de sala limpia
(clean room), y merece describirse con precisión porque su forma importa.

Un equipo lee el original y escribe una especificación funcional: lo que hace
el programa, en términos de comportamiento. Un segundo equipo, que nunca ha
visto el original, implementa solo a partir de esa especificación. La salida
del segundo equipo demostrablemente no está copiada de una expresión que nunca
vio. Así se reimplementó la BIOS del PC, y por eso la reimplementación
sobrevivió.

El movimiento moderno obvio es ejecutar un modelo para leer y describir, y un
modelo distinto con un contexto fresco para implementar. Estructuralmente, eso
es el mismo protocolo. ¿Es una sala limpia?

Tiene la forma correcta. Pero una sala limpia no es un constructo técnico — es
uno **probatorio**. Todo su valor está en poder demostrar la separación
después, a alguien que asume que hiciste trampa. Así que la versión de dos
modelos significa algo solo si la disciplina se mantiene de principio a fin:

- Los dos lados genuinamente nunca comparten contexto. No «le dijimos que lo
  olvidara» — ejecuciones separadas, transcripciones separadas.
- La especificación lleva comportamiento y nada más. Sin pseudocódigo que
  refleje el flujo de control del original. Sin nombres de identificadores. Sin
  orden de funciones. Eso es expresión, y una especificación llena de ello es
  el original disfrazado.
- Se conservan los registros de ambos lados, porque una sala limpia que no
  puedes evidenciar es una historia.

Si el lado que lee emite estructura, la contaminación pasa directamente y
tienes una obra derivada con pasos adicionales y una factura de tokens mayor.

Nosotros no hicimos esto. El modelo que implementaba leyó el código fuente
directamente. Por eso el README de pycotovia dice, en el repositorio, en
público:

> Debido a que la IA que implementa **leyó el código fuente GPL**, esto **no es
> una reimplementación de sala limpia** y no hacemos tal afirmación. Es un
> porte derivado de la fuente.

Preferimos tener esa frase escrita a tener que responderla más tarde.

## Lo que hicimos

Mantuvimos las licencias originales.

[espyak](https://github.com/TigreGotico/espyak) es GPL-3.0-or-later, igual que
espeak-ng. Ese ni siquiera es un caso difícil: el paquete incluye los propios
archivos de datos de espeak-ng sin modificar — `dictsource`, `phsource`,
`lang` — y ninguna teoría de autoría toca los archivos que copiamos sin
cambios. Los datos del proyecto original están dentro del wheel, así que la
licencia del original viene con ellos.

[pycotovia](https://github.com/TigreGotico/pycotovia) es GPL-3.0, igual que
Cotovía (GPL-3.0+). [ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) y
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa) son
GPL-3.0, igual que AhoTTS, cuyo archivo de licencia declara GPL-3.0+ para el
procesamiento lingüístico. [pyeye](https://github.com/TigreGotico/pyeye) es
MIT, igual que EYE. Copyleft entra, copyleft sale; permisivo entra, permisivo
sale.

No hicimos eso porque estableciéramos que era obligatorio. Lo hicimos porque la
asimetría tomaba la decisión sin necesitar la respuesta.

Publicamos código abierto de todos modos. El copyleft no nos cuesta casi nada
— el único coste real es el caso en que un cliente quiere el código dentro de
algo propietario, y para estas bibliotecas concretas ese caso es raro. Así que
ser copyleft cuando no estábamos estrictamente obligados cuesta
aproximadamente cero.

El otro error no es simétrico. Distribuir una licencia permisiva sobre algo que
debería haber sido copyleft es un problema descubierto tarde, en público, por
otra persona, después de que otras personas hayan construido sobre ello bajo
términos que no estabas autorizado a ofrecer. Deshacer eso significa contactar
a cada usuario aguas abajo.

Esa asimetría también es por qué vale la pena vigilar el desajuste en general.
Un porte estructural de un original LGPL no puede simplemente convertirse en
Apache-2.0 por el hecho de reescribirse en otro lenguaje — y ese es exactamente
el tipo de desajuste fácil de crear y difícil de notar, porque nada se queja.
El build pasa. Las pruebas pasan. La cabecera de licencia es solo un archivo.
HermiT es LGPL, así que la licencia de nuestro porte en Python de él es uno de
los casos que estamos revisando — que es el resultado corriente y correcto:
compruebas, y arreglas lo que haya que arreglar.

Bajo una asimetría tan desequilibrada, no necesitas resolver la cuestión legal
para tomar la decisión. Simplemente tomas la rama donde equivocarse es
sobrevivible.

## La misma pregunta, apuntando en la otra dirección

Todo lo anterior trata sobre código que producimos. La misma lógica idéntica se
aplica al código que recibimos. Alguien abre una pull request contra uno de
nuestros repositorios. El parche fue escrito por un modelo. ¿Qué nos están
concediendo?

La mayoría de los proyectos manejan esto con el
[Developer Certificate of Origin](https://developercertificate.org/) — el DCO,
la línea `Signed-off-by:` al final de un mensaje de commit. Es una breve
declaración a la que el contribuyente se compromete al firmar: que creó la
contribución él mismo, o que provino de una fuente bajo una licencia compatible
y tiene el derecho de someterla bajo los términos del proyecto. Es
deliberadamente ligero. Sin abogados, sin papeleo, una línea por commit. Así es
como el núcleo de Linux y QEMU, entre muchos otros, establecen de dónde viene
su código.

Para un parche escrito por una máquina, ninguna de las dos ramas es
directamente cierta. Y la bifurcación se resuelve de la misma forma tomes la
rama que tomes.

Si la salida generada por máquina no lleva derecho de autor, el contribuyente
no posee derechos sobre ella. No hay nada que licenciarte.

Si en cambio se trata como derivada de sus datos de entrenamiento, los
derechos — sean los que sean — pertenecen a quien escribió esos datos. El
contribuyente sigue sin poseer nada, y sigue sin tener nada que licenciarte.

De cualquier forma, no pueden conceder lo que no poseen. La firma no es
deshonesta. El contribuyente firmó de buena fe e hizo el trabajo. Simplemente
está vacía: una transferencia de algo que nunca fue suyo para transferir.

La consecuencia práctica es menos alarmante de lo que suena, y las dos ramas
difieren notablemente.

En la primera rama, no necesitas ninguna concesión en absoluto. Material que
nadie posee puede ser usado por cualquiera. Aceptar el parche está bien y no
pasa nada malo. Lo que cambia silenciosamente es la otra dirección: el
copyleft se construye sobre el derecho de autor, y no puede aplicarse a
material que no lleva ninguno. Un proyecto GPL que acumula parches escritos
por máquina acumula partes que su propia licencia puede no alcanzar. La
licencia sigue rigiendo la obra tal como se distribuye. El núcleo exigible
dentro de ella se adelgaza, lentamente, sin que nadie lo note.

La segunda rama tiene dientes. Si un modelo reproduce datos de entrenamiento
memorizados palabra por palabra — lo cual sí ocurre, más con modismos comunes e
implementaciones bien conocidas que con lógica novedosa — entonces has
aceptado código con derecho de autor de otra persona, bajo la garantía de un
contribuyente que no tenía forma de comprobarlo. Todo el valor del DCO está en
que la persona que lo firma estaba en posición de saberlo. Aquí no lo está.

Debian está trabajando en esto ahora mismo. Una
[resolución general sobre el uso de LLM](https://www.debian.org/vote/2026/vote_002)
entró en su período de discusión el 23 de julio de 2026 con cinco propuestas en
la papeleta. Cubren toda la gama: la Propuesta A enmendaría el Contrato Social
para prohibir directamente las contribuciones asistidas por LLM a paquetes,
documentación y recursos web; la Propuesta C pide a los contribuyentes que
eviten los LLM en la medida de lo posible, exige redacción exclusivamente
humana para las comunicaciones del proyecto, y permite que mantenedores
individuales impongan sus propias prohibiciones; las Propuestas B, D y E
permiten el trabajo asistido por IA bajo condiciones, construidas
respectivamente sobre verificación de licencias, responsabilidad del
contribuyente, divulgación, y restricciones al envío de material confidencial
a servicios en la nube. En el momento de escribir esto está en discusión y no
hay nada decidido.

Esa es la segunda vez. Un
[intento anterior en 2024](https://lwn.net/Articles/972331/) terminó sin
resolución, y el razonamiento para detenerse merece conservarse: la objeción a
actuar no fue que la preocupación careciera de fundamento sino que una regla
que nadie puede hacer cumplir no vale la pena adoptarla. No puedes mirar un
diff y saberlo.

Esto no es una preocupación marginal. Golpea con más fuerza precisamente a los
proyectos con la procedencia más cuidada, porque todo el modelo de un proyecto
basado en DCO sobre de dónde viene su código descansa sobre esa única
atestación.

No hemos resuelto cómo vamos a manejarlo, y estamos en mala posición para ser
estrictos. Distribuimos portes escritos por un modelo. Un proyecto que publica
código escrito por máquina y rechaza contribuciones escritas por máquina está
sosteniendo dos posiciones incompatibles a la vez, y preferiríamos no hacerlo.
Las opciones honestas son las mismas que Debian está sopesando — divulgación,
responsabilidad del contribuyente, o una regla que nadie puede verificar — y no
hemos elegido una.

## El otro eje por el que corre el argumento

El debate de Debian trata sobre procedencia y licencias. No es el único eje, y
el segundo no tiene nada que ver con el derecho de autor.

Codeberg, la forja FLOSS, adoptó dos mociones aprobadas por sus miembros en
julio de 2026 y
[expuso su razonamiento](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
en términos que apenas tocan las licencias. Las objeciones son sobre costes y
esfuerzo: consumo de energía y hardware trasladado a todo el mundo; tráfico de
rastreadores que presiona a las forjas pequeñas hacia defensas que también
obstruyen a los usuarios normales; proyectos «vibe-coded» de un solo uso,
publicados y nunca mantenidos; y la carga sobre las personas que revisan:

> Los mantenedores están bajo una carga de trabajo aumentada debido a personas
> que envían contribuciones de bajo esfuerzo generadas por LLM (a menudo con
> buena intención) que requieren cantidades sustanciales de tiempo para
> revisar.

Sus Términos de Uso ahora desalientan tales proyectos, aplicados caso por caso
por moderadores en lugar de por eliminación masiva.

Así que hay dos preguntas independientes en circulación, y un proyecto puede
caer en cualquier punto de la rejilla: si el código escrito por máquina puede
licenciarse en absoluto, y si el ecosistema puede absorber el volumen. Debian
está votando sobre la primera y no ha concluido. Codeberg ha actuado sobre la
segunda. Ningún resultado zanja el otro, y las respuestas que un proyecto da a
cada una están en gran medida sin correlación.

## La parte que no vamos a fingir que está zanjada

Puede que no hubiéramos necesitado hacer nada de esto.

Considera los tres argumentos juntos. La funcionalidad no está protegida — el
TJUE lo dijo directamente. La salida puramente generada por máquina puede no
tener autor humano, así que puede que no haya nuevo derecho de autor de qué
preocuparse y, incómodamente, tampoco ninguno nuestro. Y un protocolo de dos
modelos ejecutado con disciplina real podría ser una sala limpia genuina, en
cuyo caso el porte nunca tocó expresión protegida en absoluto.

Si las tres se sostienen, algunos de estos portes podrían haberse licenciado de
forma permisiva con la conciencia tranquila. Si ninguna se sostiene, nuestra
elección conservadora fue simplemente correcta. No sabemos cuál es el caso, y
no lo pusimos a prueba. No nos interesa ser el caso que lo zanje.

La pregunta no desaparece por ser ignorada. Este tipo de porte se está
volviendo corriente — es barato ahora, y hay una gran cantidad de C sin
mantenimiento que merece la pena trasladar a algún lugar donde pueda
mantenerse. Cada uno de esos portes se enfrentará a las mismas dos preguntas, y
la mayoría de ellos responderán no preguntando. Igual que hará cualquier
proyecto que fusione un parche que no escribió, es decir, todos. Las preguntas
llegan tanto si escribes el código como si solo lo aceptas.

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

Reescribimos un puñado de programas antiguos en Python. El front-end de G2P de
[espeak-ng](https://github.com/espeak-ng/espeak-ng), las reglas de transcripción
gallega y española de [Cotovía](https://gtm.uvigo.es/en/transfer/software/cotovia/),
el procesamiento lingüístico del euskera de [AhoTTS](https://github.com/aholab/AhoTTS),
el razonador N3 [EYE](https://github.com/eyereasoner/eye), y el razonador OWL 2 DL
[HermiT](http://www.hermit-reasoner.com/). C, C++ y Java, la mayoría con más de
una década.

El motivo fue corriente. Un programa en C que fonemiza gallego es excelente
hasta que quieres tenerlo dentro de una pila de voz en Python en una placa ARM:
un compilador, una cadena de herramientas, compilación cruzada, una frontera de
subproceso a través de la cual serializar texto. Un razonador en Java necesita
una JVM; el Python puro necesita `pip install`, y puedes abrir el archivo que
decide dónde va el acento y cambiarlo.

Los portes se hicieron de forma semiautónoma: una IA leyó el código fuente
original y escribió el Python, un humano dirigió el trabajo y comprobó la
salida contra el binario original. En varios de ellos nadie de nuestro lado
llegó a leer el código fuente original; el modelo sí lo hizo, y nosotros leímos
los diffs y las pruebas de paridad.

Eso deja una pregunta que no pudimos responder: **¿es el resultado una obra
derivada, y de quién es?**

Somos ingenieros. Nada de esto es asesoramiento legal, y no estamos
cualificados para darlo: esto es la descripción de una decisión que tomamos y
del razonamiento detrás de ella.

## Dos preguntas que se siguen confundiendo

Reimplementar un programa leyendo su código fuente no es nuevo. Lo nuevo es el
arreglo: quien lee es una máquina, quien implementa es la misma máquina, y los
humanos implicados nunca vieron el original.

Hay dos preguntas independientes aquí, casi siempre colapsadas en una sola,
aunque se puede responder que sí a una y no a la otra.

1. **¿Puede el resultado ser propiedad de alguien siquiera?** El derecho de
   autor se aplica a obras con autores. Si una máquina produjo el código,
   ¿quién es el autor?
2. **¿Es el resultado una obra derivada de la entrada?** Quienquiera que lo
   haya autorado, si es que alguien lo hizo, ¿infringe el resultado el
   original?

Una **obra derivada** es una obra basada en una preexistente, como una
traducción o un porte. Las licencias **copyleft** (la familia GPL) permiten
usar y modificar código con la condición de que lo que se distribuya se
mantenga bajo los mismos términos. Las licencias **permisivas** (MIT,
Apache-2.0, BSD) permiten distribuir el resultado dentro de software
propietario. La **LGPL** está en medio de las dos.

## Pregunta uno: ¿hay un autor?

El derecho de autor necesita un autor humano. La Oficina de Derechos de Autor
de EE. UU. lo ha sostenido de forma consistente, y en *Thaler v. Perlmutter* el
Tribunal de Apelaciones del Circuito de D.C. estuvo de acuerdo: la Ley de
Derechos de Autor «requiere que toda obra elegible sea autorada en primera
instancia por un ser humano» (n.º 23-5233, D.C. Cir., 18 de marzo de 2025; el
Tribunal Supremo denegó el certiorari en marzo de 2026). El estándar europeo
llega a un lugar similar: la protección requiere la «creación intelectual
propia del autor», lo que presupone un autor que crea.

Ninguna de las dos dice que el trabajo asistido por IA no sea protegible, solo
que lo que una máquina genera por sí sola no lo es, y dónde cae exactamente la
línea depende de cuánto contribuyó un humano: en nuestros portes, real pero
delgado — elegir el objetivo, estructurar el paquete, juzgar los fallos de
paridad. No es obvio que eso nos convierta en los autores de las reglas de
transcripción.

Eso produce un objeto incómodo: una licencia es una concesión de permiso por
parte de un titular de derechos, así que si nadie posee derechos sobre el
resultado, el archivo de licencia en la raíz del repositorio es decoración, y
el argumento se come su propia cola. Cualquiera que sostenga que el código
generado por máquina no tiene dueño está sosteniendo que sus propios términos
de distribución no son exigibles, antes siquiera de acercarse a los del
proyecto original.

## Pregunta dos: ¿está derivado?

Esta no le importa quién sea el autor. La infracción gira sobre el acceso al
original más la similitud sustancial con su **expresión** protegida — la forma
particular en que se escribió la cosa, no lo que hace — y tuvimos acceso: el
modelo leyó el código fuente, y esa mitad no está en disputa.

La mitad de la similitud es donde el cambio de lenguaje importa menos de lo
que la gente espera. Traducir una novela produce una obra derivada; cambiar el
lenguaje derrota una demanda por copia literal, pero no una demanda sobre la
estructura, el orden de las transformaciones, la descomposición en funciones,
la forma de las tablas de reglas.

Una herramienta tampoco blanquea nada: si diriges una copia y distribuyes el
resultado, eres tú quien lo hizo, y «lo escribió el modelo» no es más defensa
que «lo emitió el compilador».

## El argumento más fuerte en el otro lado

Existe un caso serio de que una reimplementación entre lenguajes está bien. En
*SAS Institute v World Programming* (TJUE, C-406/10, 2 de mayo de 2012), el
Tribunal sostuvo que «ni la funcionalidad de un programa de ordenador ni el
lenguaje de programación y el formato de los archivos de datos utilizados en
un programa de ordenador para explotar algunas de sus funciones constituyen
una forma de expresión de ese programa». La Directiva de Software (2009/24/CE,
artículo 1(2)) dice lo mismo sobre las ideas y principios subyacentes a un
programa, y el Tribunal sostuvo que un licenciatario puede estudiar el
comportamiento de un programa para determinar las ideas que hay detrás, y
reimplementarlas.

Eso significa que lo que un fonemizador *hace* — convertir esta secuencia de
grafemas en aquel fonema — no es propiedad de nadie: las reglas de acentuación
del gallego son hechos sobre el gallego, y la semántica directa de OWL 2 es
una especificación publicada del W3C. Una reimplementación que reproduce
comportamiento en lugar de expresión es lícita, y una reescritura entre
lenguajes está mucho más lejos de la infracción que un copiar y pegar.

La brecha entre ese argumento y nuestra situación es la fuente: *SAS* trata
sobre estudiar el comportamiento, y nuestro modelo leyó el código.

## El precedente que ya existe, y hasta dónde llega

El argumento de que «la salida de una máquina no tiene autor, así que no se
aplica derecho de autor» no es un experimento mental: tanto la destilación de
modelos como los datos sintéticos de entrenamiento descansan sobre él, en toda
la industria. La afirmación pública más clara es
[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M), un modelo abierto de
TTS ampliamente usado cuya ficha dice que se entrenó exclusivamente con audio
permisivo o no protegido por derecho de autor, enumerando entre las fuentes
permitidas:

> Audio sintético generado por modelos de TTS cerrados de grandes proveedores

con una nota que apunta a la
[guía de política de IA](https://copyright.gov/ai/ai_policy_guidance.pdf) de
la Oficina de Derechos de Autor de EE. UU.: la salida de una máquina no tiene
autor humano, así que no hay nada que infringir al entrenar con ella. El
modelo se distribuye bajo Apache-2.0, y la ficha también excluye el audio
sintético de modelos de TTS *abiertos* y de clones de voz personalizados, una
señal de que sus autores calcularon dónde deja de aplicarse el argumento.

Ese precedente resuelve la otra mitad del problema. El argumento de Kokoro
trata sobre la **entrada**: lo que consumieron era en sí mismo generado por
máquina, así que sostienen que no llevaba derecho de autor desde el principio.
Nuestra situación es la imagen especular: lo que consumimos — el C de
espeak-ng, el C++ de Cotovía, el Java de HermiT — está escrito por humanos y
protegido por derecho de autor, por personas nombradas en universidades
nombradas, y lo que *salió* fue escrito por máquina, así que el argumento
aterriza en nuestra salida, no en nuestra entrada, y no viaja hacia arriba.

Hay una asimetría adicional: la exposición residual de Kokoro, si la hay, es
contractual y no de derecho de autor, y esa obligación sobrevive incluso donde
el derecho de autor no lo hace. El copyleft no funciona así; nadie hace clic
en «acepto» para la GPL, y solo te vincula si lo que hiciste es una obra
derivada.

Así que todo colapsa de vuelta sobre la pregunta que nadie ha respondido. Si
una reimplementación entre lenguajes, escrita por máquina, no es una obra
derivada, la GPL nunca entró en juego. Si lo es, se aplicó desde la primera
línea. No hay un tercer estado.

## Salas limpias, y si dos modelos hacen una

La respuesta clásica a este problema es el protocolo de sala limpia: un equipo
lee el original y escribe una especificación funcional de lo que hace el
programa, y un segundo equipo, que nunca ha visto el original, implementa solo
a partir de esa especificación. Así se reimplementó la BIOS del PC, y por eso
sobrevivió.

El movimiento moderno obvio es ejecutar un modelo para leer y describir, y un
modelo distinto con un contexto fresco para implementar — estructuralmente el
mismo protocolo. Tiene la forma correcta, pero una sala limpia no es un
constructo técnico, es uno **probatorio**, cuyo valor entero está en poder
demostrar la separación ante alguien que asume que hiciste trampa. La versión
de dos modelos significa algo solo si la disciplina se mantiene:

- Los dos lados genuinamente nunca comparten contexto. No «le dijimos que lo
  olvidara», sino ejecuciones separadas, transcripciones separadas.
- La especificación lleva comportamiento y nada más. Sin pseudocódigo que
  refleje el flujo de control del original. Sin nombres de identificadores.
  Sin orden de funciones. Eso es expresión, y una especificación llena de ello
  es el original disfrazado.
- Se conservan los registros de ambos lados, porque una sala limpia que no
  puedes evidenciar es una historia.

Si el lado que lee emite estructura, la contaminación pasa directamente y
tienes una obra derivada con pasos adicionales y una factura de tokens mayor.

No hicimos esto: el modelo que implementaba leyó el código fuente
directamente, por eso el README de pycotovia dice, en público:

> Debido a que la IA que implementa **leyó el código fuente GPL**, esto **no
> es una reimplementación de sala limpia** y no hacemos tal afirmación. Es un
> porte derivado de la fuente.

Preferimos tener eso escrito a tener que responderlo más tarde.

## Lo que hicimos

Mantuvimos las licencias originales: copyleft entra, copyleft sale; permisivo
entra, permisivo sale. [espyak](https://github.com/TigreGotico/espyak) es
GPL-3.0-or-later, igual que espeak-ng; ni siquiera es un caso difícil, porque
incluye los propios archivos de datos de espeak-ng sin modificar
(`dictsource`, `phsource`, `lang`), y ninguna teoría de autoría toca archivos
copiados sin cambios. [pycotovia](https://github.com/TigreGotico/pycotovia)
es GPL-3.0, igual que Cotovía (GPL-3.0+).
[ahotts-g2p](https://github.com/TigreGotico/ahotts-g2p) y
[pyAhoTTS-Iparrahotsa](https://github.com/TigreGotico/pyAhoTTS-Iparrahotsa)
son GPL-3.0, igual que AhoTTS. [pyeye](https://github.com/TigreGotico/pyeye)
es MIT, igual que EYE.

No hicimos esto porque estableciéramos que fuera obligatorio, sino porque la
asimetría tomaba la decisión sin necesitar la respuesta: el copyleft casi no
nos cuesta nada aquí, mientras que una licencia permisiva sobre algo que
debería haber sido copyleft es el error peor, descubierto tarde y en público,
después de que otras personas hayan construido sobre términos que no
estábamos autorizados a ofrecer.

Esa asimetría merece vigilarse en general: nada se queja cuando el porte
estructural de un original LGPL se convierte silenciosamente en Apache-2.0 al
traducirse. HermiT es LGPL y nuestro porte en Python lleva LGPL-3.0 para
coincidir. El resto del conjunto reveló dos casos más, ambos sin drama: un
envoltorio que declaraba Apache-2.0 sobre un original MIT, y repositorios cuyo
README nombraba una licencia sin el archivo correspondiente. Se comprueba, se
arregla lo que haga falta, y la pregunta interesante sigue abierta.

No hace falta resolver la cuestión legal para tomar esta decisión: se toma la
rama en la que equivocarse es sobrevivible.

## La misma pregunta, apuntando en la otra dirección

La misma lógica se aplica al código que recibimos: alguien abre una pull
request escrita por un modelo, y la pregunta es qué nos están concediendo.

La mayoría de los proyectos manejan esto con el
[Developer Certificate of Origin](https://developercertificate.org/): la
línea `Signed-off-by:` que certifica que escribiste la contribución, o que
proviene de una fuente compatible que tienes derecho a someter. Así es como el
núcleo de Linux y QEMU establecen de dónde viene su código.

Para un parche escrito por una máquina, ninguna de las dos ramas es
directamente cierta: si la salida generada por máquina no lleva derecho de
autor, el contribuyente no posee derechos sobre ella; si en cambio se trata
como derivada de sus datos de entrenamiento, los derechos pertenecen a quien
escribió esos datos. De cualquier forma no pueden conceder lo que no poseen, y
la firma, aunque no deshonesta, transfiere algo que nunca fue suya para
transferir.

Las consecuencias difieren notablemente. En la primera rama, material que
nadie posee puede ser usado por cualquiera, pero el copyleft no puede
aplicarse a material que no lleva ninguno, así que un proyecto GPL que acepta
parches escritos por máquina acumula silenciosamente partes que su propia
licencia puede no alcanzar. La segunda tiene dientes: si un modelo reproduce
datos de entrenamiento memorizados palabra por palabra — más común con
modismos que con lógica novedosa — se ha aceptado código con derecho de autor
de otra persona bajo la garantía de un contribuyente que no tenía forma de
comprobarlo, y eso golpea con más fuerza a los proyectos con la procedencia
más cuidada.

Debian está trabajando en esto. Una
[resolución general sobre el uso de LLM](https://www.debian.org/vote/2026/vote_002)
entró en su período de discusión en julio de 2026, con propuestas que van
desde prohibir directamente las contribuciones asistidas por LLM hasta
permitirlas bajo divulgación y responsabilidad, y nada está decidido. Un
[intento anterior en 2024](https://lwn.net/Articles/972331/) también terminó
sin resolución: la objeción no fue que la preocupación careciera de
fundamento, sino que una regla que nadie puede hacer cumplir no vale la pena
adoptarla.

Estamos en mala posición para ser estrictos: distribuimos portes escritos por
un modelo, y un proyecto que publica código escrito por máquina mientras
rechaza contribuciones escritas por máquina sostiene dos posiciones
incompatibles a la vez.

La licencia no es el único eje por el que corre este argumento, aunque es el
que ocupa esta entrada. Codeberg adoptó dos mociones aprobadas por sus
miembros en julio de 2026 y
[expuso su razonamiento](https://blog.codeberg.org/protecting-our-floss-commons-from-llms.html)
casi sin mencionar las licencias: el coste de energía y hardware, el tráfico
de rastreadores, los proyectos de un solo uso sin mantenimiento, y la carga de
revisión que los parches de bajo esfuerzo imponen a los mantenedores. Eso es
independiente de si el código puede licenciarse. Debian vota sobre lo primero
y no ha concluido; Codeberg actuó sobre lo segundo.

## La parte que no vamos a fingir que está zanjada

Puede que no hubiéramos necesitado hacer nada de esto.

Tómense los tres argumentos juntos. La funcionalidad no está protegida — el
TJUE lo dijo directamente. La salida puramente generada por máquina puede no
tener autor humano, así que puede que no haya nuevo derecho de autor de qué
preocuparse y, incómodamente, tampoco ninguno nuestro. Y un protocolo de dos
modelos ejecutado con disciplina real podría ser una sala limpia genuina, en
cuyo caso el porte nunca tocó expresión protegida en absoluto.

Si las tres se sostienen, algunos de estos portes podrían haberse licenciado
de forma permisiva con la conciencia tranquila. Si ninguna se sostiene,
nuestra elección conservadora fue simplemente correcta. No sabemos cuál es el
caso, no lo pusimos a prueba, y no nos interesa ser el caso que lo zanje.

La pregunta no desaparece por ser ignorada. Este tipo de porte se está
volviendo corriente, y hay una gran cantidad de C sin mantenimiento que merece
la pena trasladar a algún lugar donde pueda mantenerse. Cada uno de esos
portes se enfrenta a las mismas dos preguntas, y la mayoría responderá no
preguntando. Igual que hará cualquier proyecto que fusione un parche que no
escribió, es decir, todos.

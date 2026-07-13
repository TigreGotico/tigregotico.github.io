---
title: "Tu modelo de sentimientos no distingue una queja de una despedida"
description: "Dos mensajes de soporte que parecen furiosos. Un cliente está a punto de escalar; el otro está a punto de irse sin decir palabra. Casi ningún modelo de emociones puede distinguirlos — porque a todos les falta el mismo eje. Presentamos emotion-algebra."
date: 2026-07-13
lang: es
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

Dos mensajes llegan a tu cola de soporte.

> "Esta es la tercera vez que tu aplicación pierde mi trabajo. Arrégralo."

> "No sé si estoy haciendo esto bien y tengo miedo de haber roto algo."

Pásalos por cualquier modelo de sentimientos que quieras. Ambos devuelven lo mismo:
**negativo, alta activación**. Con aspecto de enfado. Alterados.

Así que los tratas igual — y acabas de cometer un error, porque estas
dos personas necesitan cosas opuestas.

El primero está *furioso*, y la gente furiosa está **comprometida**. Creen que
pueden forzar una solución, y seguirán presionando hasta conseguirla. Les envías una
disculpa cálida y la promesa de que lo investigarás, y los enfurecerás aún más.

El segundo está *asustado*. No cree que pueda arreglar nada. Está a
una mala respuesta de cerrar la pestaña y no volver jamás — en silencio, sin
decirte nunca por qué. Le envías un número de ticket y un plazo de cinco días para
solucionarlo, y lo perderás.

Uno es una queja. El otro es una despedida. Y casi nada en el arsenal de la
IA emocional puede decirte cuál es cuál.

Pasamos un tiempo averiguando por qué. La respuesta resultó ser más interesante
de lo que esperábamos, y termina con una red neuronal entrenada con mil millones de
tuits coincidiendo con un artículo de psicología de 1985 que nunca ha leído.

## La dimensión que falta

Esto es lo que pasa con la ira y el miedo: **son casi idénticas medidas de la
forma habitual.**

Ambas se sienten mal. Ambas tienen una activación alta — tu ritmo cardíaco se acelera
en ambos casos. Esas dos cualidades, «qué bien se siente» y «qué alterado estás», son
las dos dimensiones sobre las que está construido casi cualquier modelo de emociones.
Normalmente se llaman *valencia* y *activación*.

La ira y el miedo se sitúan una encima de la otra en ese espacio. Ningún modelo
construido a partir de esos dos números puede separarlas, por muy sofisticado que sea,
porque la información sencillamente no está ahí.

Lo que realmente las separa es una tercera cosa: **¿sientes que puedes hacer algo
al respecto?**

La ira es lo que sientes cuando algo va mal *y puedes actuar*. El miedo es lo que
sientes cuando algo va mal *y no puedes*. Esa sensación de control — los psicólogos
la llaman *potencial de afrontamiento* o *potencia* — es toda la diferencia. También es lo
que te dice si alguien va a luchar o huir, escalar o desaparecer.

No es una idea marginal. **Cuatro programas de investigación independientes**
llegaron a ella por separado a lo largo de dos décadas, y uno de ellos (Lerner &
Keltner, 2001) la demostró *causalmente*: la gente enfadada hace juicios optimistas y
tolerantes al riesgo, mientras que la gente asustada hace juicios pesimistas y
aversos al riesgo — y el efecto opera a través del control y la certeza, no de lo mal
que se sienten.

Su hallazgo más sorprendente merece que nos detengamos. **Los juicios de la gente
enfadada se parecen a los juicios de la gente feliz.** No a los de la gente asustada.
La ira y la felicidad tienen valencias opuestas, y eso no importa, porque la valencia
no es lo que está haciendo el trabajo.

Entonces, ¿por qué este eje no aparece en las herramientas?

## Por qué el eje desapareció

La mayoría de las herramientas emocionales se remontan a un pequeño número de modelos
teóricos. Los dos más influyentes son la **Rueda de las Emociones de Plutchik** (1980)
y, construido sobre ella, el **Reloj de Arena de las Emociones de Cambria** (2012),
que es el modelo detrás de SenticNet.

La rueda de Plutchik es un objeto hermoso. Tiene forma de círculo cromático, y
carga con la idea central del círculo cromático: las emociones vienen en **pares
opuestos**. La alegría se opone a la tristeza. La confianza se opone al asco. Y la ira
se opone al miedo.

Eso último es el problema, y una vez que lo ves no puedes dejar de verlo.

Si la ira y el miedo son extremos opuestos de un mismo eje, entonces se cancelan.
Toma la rabia más intensa que una persona pueda sentir, mézclala con el terror más
intenso, y pregúntale al modelo qué obtienes:

```
(rage + terror) / 2  ==  neutrality
```

**Calma.** Mezcla los dos estados negativos más violentos de los que un ser humano
es capaz, y el modelo declara que no sientes nada en absoluto.

Eso no es un error en una implementación. Es una consecuencia directa de la geometría
— y significa que el modelo ha tirado a la basura exactamente la cantidad que
necesitábamos. Al hacer de la ira y el miedo *opuestos*, garantiza que nunca puedan
*distinguirse*.

La rueda lo sabe a medias, dicho sea de paso. El Reloj de Arena tiene una fórmula
para puntuar el sentimiento, y en esa fórmula el eje ira–miedo está envuelto en un
valor absoluto: **ambos extremos cuentan como desagradables**. ¡Y es verdad! La ira y
el miedo son ambos desagradables. Pero contradice en silencio la geometría que los
puso en polos opuestos en primer lugar. La propia aritmética del modelo no está de
acuerdo con su propio diagrama.

## Lo que la evidencia dice realmente

En ese momento dejamos de escribir código y nos fuimos a leer la literatura, y no
fueron unos días cómodos.

La estructura de pares opuestos de Plutchik ha sido puesta a prueba. En 2009, Smith
& Schneider la sometieron a más de dos mil pruebas estadísticas y concluyeron que la
teoría de la rueda de las emociones «no recibe apoyo empírico». Los pares opuestos
son una metáfora elegante tomada prestada de la teoría del color. No son un hallazgo
sobre las personas.

Mientras tanto, las cosas que *sí* replican — el circunflejo valencia–activación de
Russell, y la dimensión de control que separa la ira del miedo — son exactamente las
piezas que rara vez llegan al software funcional.

Hay un problema de segundo orden aquí, y es el que realmente nos molestó. Cada uno de
estos modelos es *utilizable*. Son vívidos, se pueden enseñar, caben en una
diapositiva. Así que se repiten — y una vez que un modelo se ha repetido lo suficiente,
verificar de dónde vino empieza a parecer pedantería en lugar de diligencia.
Así es como una metáfora se convierte silenciosamente en un fundamento.

## Construirlo sobre lo que sobrevive

Así que construimos [**emotion-algebra**](https://github.com/TigreGotico/emotion-algebra),
y pusimos el eje que faltaba en el centro.

El núcleo tiene cinco números: qué bien se siente, qué mal se siente (sí, por
separado — ya volveremos a eso), qué en control te sientes, qué activado estás, y qué
inesperado es todo. Esos vienen de Fontaine y colegas (2007), que los derivaron
a partir de 144 características medidas en distintas culturas, no de un diagrama
atractivo.

Ahora la mezcla se comporta:

```python
from emotion_algebra import prototype, dominant

dominant(prototype("anger").blend(prototype("fear"), 0.5))
# 'distress'
```

No «calma». **Angustia** — profundamente desagradable, muy activada, con la sensación
de control anulada. Que es exactamente lo que una mezcla de rabia y terror debería
sentir.

Y la cola de soporte funciona:

```python
from emotion_algebra import affect_from_texts

angry, afraid = affect_from_texts([
    "This is the third time your app has lost my work. Fix it.",
    "I don't know if I'm doing this right and I'm scared I've broken something.",
])

angry.valence,  angry.potency    # -0.43, +0.16   -> 'annoyance'
afraid.valence, afraid.potency   # -0.47, -0.43   -> 'apprehension'
```

Mira esos números. **La valencia es casi idéntica** — ambos mensajes son más o menos
igual de desagradables, que es por lo que un modelo de sentimientos convencional ve
una sola cosa. La *potencia* es opuesta. Una persona se siente capaz de actuar; la
otra no.

Esa es tu queja, y esa es tu despedida.

## La prueba que podría haberlo matado

Esto es lo que nos preocupaba. Todo lo anterior se apoya en la literatura de
psicología, y esa literatura está construida casi enteramente sobre **cuestionarios**
— personas valorando palabras en una escala del 1 al 9. Los cuestionarios tienen una
propiedad desagradable: pueden *codificar* silenciosamente una teoría en lugar de
ponerla a prueba. Si a todos los que escriben cuestionarios de emociones les
enseñaron el mismo libro de texto, los cuestionarios coincidirán con el libro de
texto, y todos se sentirán muy validados.

Queríamos un testigo sin ningún tipo de formación teórica.

**DeepMoji** es una red neuronal que fue entrenada con **1200 millones de tuits**
para adivinar con qué emoji terminaba un mensaje. Eso es genuinamente todo lo que
hace. Nunca ha oído hablar de Plutchik, ni de la teoría de la valoración, ni del
potencial de afrontamiento. No tiene ninguna opinión sobre las emociones en absoluto
— solo tiene un sentido extraordinariamente informado de cómo la gente *escribe
realmente* cuando siente cosas.

Así que le hicimos la única pregunta que importaba:

> ¿Puedes distinguir la ira del miedo? Y si es así — ¿qué estás usando para hacerlo?

**Puede.** Dados comentarios humanos reales etiquetados por humanos reales, separa la
ira del miedo muy por encima del azar. (Mezcla las etiquetas y la habilidad
desaparece por completo, así que no es un artefacto de nuestro método.)

Luego miramos *cómo*. Tomamos la dirección que DeepMoji usa para distinguirlas,
y medimos cuánto se alinea con cada uno de nuestros cinco ejes.

Se alinea con la **potencia** — tres veces más fuertemente que con cualquier otra
cosa. No con la valencia. No con la activación.

Un modelo entrenado con mil millones de tuits, al que nunca se le ha dicho que la ira
implica una sensación de control y el miedo su ausencia, recurre exactamente a esa
distinción cuando le pides que elija. Encontró el eje por sí solo.

Eso es lo más convincente que tenemos, y queremos ser claros en que podría haber
salido mal. Si DeepMoji hubiera separado la ira y el miedo usando la valencia, o no
las hubiera separado en absoluto, nuestro tercer eje habría sido un artefacto de la
literatura psicológica y habríamos tenido que decirlo.

## Agridulce, y otras cosas que un solo número no puede contener

Una consecuencia más, porque es bonita.

Cargamos «qué bien se siente» y «qué mal se siente» como **dos números separados**,
en lugar de una sola puntuación que va de negativo a positivo. Eso suena a
tecnicismo. No lo es.

La gente realmente siente bien y mal al mismo tiempo. El estudio canónico usa el día
de graduación: los estudiantes declaran felicidad real y tristeza real *simultáneamente*,
no un promedio tibio de las dos. Una puntuación única de valencia es matemáticamente
incapaz de representar eso. Tiene que declarar «moderadamente feliz», que no es lo que
nadie está sintiendo allí.

Dos canales pueden contenerlo. Lo que significa que el modelo puede representar la
victoria renuente, la despedida con cariño, el cliente que está aliviado *y* todavía
furioso. Esas son las emociones interesantes, y son las que un solo número aplana.

## Emociones para el otro lado

Todo lo anterior trata de leer a un humano. La misma maquinaria funciona al revés,
para darle a un personaje una vida emocional propia.

Una emoción, aquí, es un *desplazamiento* — te empujaron lejos de donde normalmente
estás, y con el tiempo vuelves a la deriva. El lugar al que vuelves no es cero. No
existe eso de «ninguna emoción»; incluso en reposo estás en algún sitio, y ese
sitio es ligeramente agradable, tranquilo y ligeramente en control. (Esa leve inclinación
positiva es por lo que una criatura en reposo va y *explora* algo en lugar de quedarse
inerte. Es un efecto real y medido.)

Así que un guardia que acaba de ver algo aterrador no vuelve a lo neutral cuando
un temporizador expira. Baja a través de ello:

```
terror → fear → apprehension → pensiveness → acceptance
```

Miedo, luego inquietud, luego una especie de cavilación silenciosa, y finalmente
está bien. No escribimos esa secuencia; surge de la geometría.

Y dos guardias pueden diferir porque se asientan hacia lugares de reposo *distintos*.
Dale a uno una línea base de sensación de control ligeramente más baja y el hábito de
recibir las malas noticias con el doble de intensidad, y se vuelve reconociblemente
ansioso — se sobresalta más, se recupera más lento, cavila más tiempo. Eso es un
personaje, y son cuatro números en lugar de un árbol de comportamiento.

Luego la parte útil: ¿qué *hace*? Eso también sale del eje de control. El guardia
enfadado carga contra ti. El guardia asustado huye. «Emoción negativa» no puede
elegir entre esas opciones, y nunca pudo.

## La parte en la que te contamos lo que tiene de malo

Cada modelo en la librería lleva una **calificación** y una cita — desde
`ESTABLISHED` (replicado, transcultural, metaanalítico) hasta `METAPHOR` (un diagrama
encantador que no sobrevivió a las pruebas).

La rueda de Plutchik está ahí, calificada como `METAPHOR`, y sigue funcionando
exactamente como Plutchik especificó — `-anger` sigue dando `fear`, porque eso es lo que
dice su modelo. Su aritmética está implementada fielmente, *y* su modelo no es
correcto acerca de las personas. Ambas cosas son ciertas, y preferimos contarte ambas
a tener que elegir una.

Somos igual de sinceros sobre nuestras propias carencias:

**Leer la activación a partir del texto no está resuelto.** Podemos obtener valencia,
podemos obtener potencia — no podemos determinar de forma fiable qué *alterada* está
una persona por sus palabras. Nuestro mejor número es malo. Lo enviamos etiquetado
como malo en lugar de esperar silenciosamente que no lo compruebes.

**Uno de nuestros propios hallazgos es provisional.** La «sensación de control» que
*causa* la ira y la «sensación de control» que la gente *declara mientras está
enfadada* resultan no ser la misma cosa — te sientes menos al mando durante un
arrebato de ira de lo que la teoría predeciría. Perder los estribos es, después de
todo, *perder el control*. Creemos que eso es importante. También creemos que nuestra
evidencia para ello es escasa, y lo hemos señalado como corresponde.

## Por qué nos molestamos

Una librería de emociones que afirma silenciosamente cosas que la evidencia contradice
es peor que inútil. Es *confiadamente* inútil — y todo lo construido sobre ella
hereda el error, en silencio, para siempre.

Preferimos enviar algo que te diga cuánto confiar en cada una de sus propias partes.

```bash
pip install emotion-algebra
```

La [documentación](https://github.com/TigreGotico/emotion-algebra) tiene un
inicio rápido de cinco minutos, una guía para darle vida emocional a un agente, y la
tabla de evidencia completa con todas las citas. Si crees que alguna de nuestras
calificaciones es incorrecta, la fuente está ahí para discutirla — y nos gustaría
de verdad saberlo.

Mientras tanto: en algún lugar de tu cola de soporte, hay alguien redactando
tranquilamente una despedida. Sería bueno saber quién es.

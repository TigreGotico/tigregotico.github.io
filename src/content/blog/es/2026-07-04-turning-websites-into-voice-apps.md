---
title: "Si Todos Publican una App, Nosotros Publicaremos Voz: Convertir Sitios Web en Apps de Voz"
description: "Todo sitio que importa acabó envuelto en una app móvil. Proponemos el movimiento opuesto para la era de la voz y la CLI: una API limpia más una skill de voz por sitio, para que la web se pueda navegar de oído y con el teclado. Un sitio cada vez, suma hasta un navegador de voz."
date: 2026-07-04
lang: es
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

En algún momento de los últimos quince años, la web decidió calladamente que todo
sitio importante también necesita una app móvil. No porque el HTML dejara de
funcionar — sino porque una app es una *superficie controlada*: un conjunto curado de
acciones, sin adornos que no elegiste, una interfaz construida para una única forma de
interactuar.

Creemos que el mismo movimiento está esperando a hacerse para un conjunto distinto de
usuarios y un conjunto distinto de interfaces. Si todo el mundo convierte su sitio en
una app de Android, **nosotros podemos convertir sitios en apps de voz** — y en apps de
línea de comandos, y en flujos nativos para lectores de pantalla. La misma idea, en
dirección opuesta: envolver un sitio en una superficie construida para cómo *tú*
quieres interactuar con él, salvo que la superficie es tu voz y tu terminal en lugar
de una pantalla táctil.

## La web apenas es usable de oído

Para un usuario vidente con un ratón, un sitio moderno está bien. Para alguien que
navega por voz, o a través de un lector de pantalla, o desde una terminal, la mayor
parte de la web es un entorno hostil: muros de scroll infinito, banners de cookies,
ventanas emergentes, menús que necesitan un puntero, contenido enterrado bajo tres
capas de basura interactiva. La información está ahí dentro. Sacarla, sin manos, es
un suplicio.

La respuesta habitual es "los sitios deberían ser más accesibles", y deberían. Pero
no vamos a arreglar toda la web pidiéndolo amablemente. Lo que *sí* podemos hacer es
tomar los sitios que importan y construir una interfaz limpia y hablada para cada uno
— como hicieron las tiendas de apps con el táctil, pero para voz y CLI, y de forma
abierta.

## Dos capas: una API limpia, luego una skill de voz

Cada una de estas apps de voz son dos piezas apiladas, y ya construimos ambas.

**Capa uno — un cliente tipado que convierte un sitio en una API.** Esto es
exactamente nuestro [trabajo de scraping e ingeniería inversa de APIs](/es/blog/2026-04-20-music-database-scrapers):
alcanzar un sitio que no tiene interfaz pública utilizable y devolver objetos tipados
y estructurados en lugar de HTML frágil — verbos, no scraping:

```python
from py_bandcamp import BandCamp

for release in BandCamp.search_albums("king gizzard"):
    artist = release.work.credits[0].entity.name if release.work.credits else ""
    print(release.work.title, artist, release.uri)
```

El instrumental de reconocimiento y de
[transporte anti-bot](/es/blog/2026-03-15-beating-bot-walls-with-drop-in-requests-sessions)
que hay debajo mantiene ese acceso funcionando a medida que el sitio cambia. Ese
cliente ya es útil por sí solo: para un usuario de terminal la API *es* la versión
accesible del sitio web — nuestro cliente de SoundCloud incluso trae `nds`, una app de
línea de comandos para buscar y reproducir música sin un navegador a la vista. Una vez
que un sitio es una API, deja de ser un artefacto visual y se convierte en algo que una
máquina — o un pipeline de voz — puede manejar.

**Capa dos — un plugin de OVOS que habla esa API.** Sobre el cliente se asienta un
plugin de [OpenVoiceOS](https://openvoiceos.org) que mapea intenciones habladas a
llamadas de API y narra los resultados con nuestras
[voces TTS offline](/es/blog/2026-06-15-two-voices-every-language-miro-and-dii).
Deliberadamente *no* es una skill a medida por sitio — ese camino lleva a docenas de
skills puntuales que nadie puede mantener. Para cualquier cosa con forma de medios es
un plugin proveedor de [OCP](https://openvoiceos.github.io/ovos-technical-manual/):
un pequeño adaptador que expone la superficie de búsqueda y reproducción de un sitio a
todo el framework Open Common Play, de modo que "buscar", "reproducir", "siguiente" y
"reanudar" ya funcionan igual que para cualquier otra fuente. El sitio encaja en una
interfaz de voz uniforme en lugar de inventar la suya propia.

El resultado: "Pon el canal Groove Salad de SomaFM." "Busca en Bandcamp ambient con
licencia Creative Commons." El sitio web, convertido en algo que puedes usar sin
mirarlo — y sin una gramática nueva que aprender para cada sitio.

## En la era de los LLM, una API tipada es una interfaz de lenguaje natural esperando a nacer

Hay una segunda razón por la que esta forma importa más ahora de lo que habría
importado hace cinco años. Un cliente limpio y tipado es exactamente lo que un gran
modelo de lenguaje necesita para convertirse en un *front-end de lenguaje natural*
para un sitio web.

Dale a un LLM un conjunto documentado de funciones — `search_albums`,
`get_recommendations`, `stream_url` — y traducirá encantado "búscame algo como Naxatras
pero más pesado" a las llamadas correctas, las encadenará, y hablará el resultado de
vuelta. La API estructurada es la parte difícil; la interfaz conversacional encima es
cada vez más algo que el modelo simplemente *provee*, siempre que las herramientas que
se le entregan estén bien tipadas y sean honestas sobre lo que devuelven. El HTML
desordenado no le da a un LLM nada a lo que agarrarse. Un cliente tipado le da una
superficie de control.

Por eso nuestros clientes de sitios web incluyen un **`SKILL.md`** — una descripción en
lenguaje llano de lo que hace la API, sus verbos, sus tipos de retorno y llamadas de
ejemplo, escrita para que la lea un agente. Apunta un asistente impulsado por LLM hacia
él y el cliente se convierte en una herramienta que el modelo puede usar de inmediato:
sin código pegamento, sin integración a medida, solo "esto es lo que este sitio puede
hacer, en palabras". Un documento convierte un scraper en algo que un modelo de
lenguaje puede operar en tu nombre.

Son los mismos datos estructurados sirviendo a tres front-ends a la vez: una **CLI**
para usuarios de terminal, un **plugin OCP/de voz** para uso sin manos, y una
**herramienta LLM** para control por lenguaje natural. Construye la API una vez; úsala
de tres formas.

## Por qué esto importa más a quienes no pueden ver la pantalla

Para usuarios ciegos y con baja visión, esto no es una característica de conveniencia —
es la diferencia entre acceso y exclusión. Un lector de pantalla solo puede leer lo que
una página expone limpiamente, y la mayoría no lo hace. Una app de voz dedicada se salta
la página por completo: va a los datos estructurados y habla *eso*, en un flujo diseñado
para escucharse desde la primera línea de código.

Es el mismo principio detrás de nuestros
[juegos de audio](/es/games) — construidos para los oídos, no para los ojos, con los
jugadores ciegos como audiencia principal en lugar de una ocurrencia tardía. Las apps de
voz para sitios web extienden ese principio de los juegos al resto de la web.

## Un sitio cada vez — pero la dirección es un navegador de voz

Aquí está la parte honesta: no hay atajo universal. No puedes habilitar la voz para
"la web" de un solo golpe, porque cada sitio es su propio enredo. Hay que hacerlo
**sitio por sitio** — un cliente, una skill, un conjunto cuidadosamente mapeado de
intenciones cada vez. Eso suena a limitación, y a corto plazo lo es.

Pero mira hacia dónde apunta la acumulación. Cada sitio que envolvemos es un rincón más
de la web ahora alcanzable por voz y por CLI. Encadena suficientes de ellos — un
vocabulario común de metadatos, una capa de voz compartida, un conjunto consistente de
intenciones "buscar / abrir / leer / reproducir / siguiente" — y ya no estás mirando un
montón de skills separadas. Estás mirando los comienzos de un **navegador de voz**: una
forma de moverse por la web hablando, donde los sitios individuales son solo destinos
que ya saben cómo responder.

La apuesta de la era móvil fue que un sitio que vale la pena usar vale una app. La
nuestra es que un sitio que vale la pena usar vale una *voz*. Los estamos construyendo
uno a uno, en abierto, y cada uno de ellos hace la web un poco más navegable para las
personas que la web visual dejó atrás.

¿Quieres un sitio concreto convertido en una app de voz o CLI — por accesibilidad, por
tu producto, o simplemente porque debería existir? [Hablemos.](/es/services)

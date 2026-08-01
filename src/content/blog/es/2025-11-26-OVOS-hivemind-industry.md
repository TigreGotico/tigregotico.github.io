---
title: "OVOS y HiveMind en la Industria Manufacturera"
description: "Los proyectos europeos COALA y WASABI han construido todo un framework de asistente de voz industrial en torno a OVOS + HiveMind, integrándolos con sus propias herramientas, interfaz y motores de conversación."
date: 2025-11-26
lang: es
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

Los proyectos europeos **[COALA](https://coala-ai.de)** y **[WASABI](https://wasabiproject.eu)** construyeron todo un framework de asistente de voz industrial sobre **[OpenVoiceOS](https://openvoiceos.org)** (una plataforma de voz de código abierto sin ánimo de lucro) y **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)**, integrándolos con su propia interfaz Android, motor de NLP y stack de Docker.

No participé en estas implementaciones. Esa es la cuestión: el stack se está adoptando por sus propios méritos, por equipos con requisitos industriales reales.

---

## Convocatoria Abierta WASABI

La 2.ª [Convocatoria Abierta WASABI](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) para prestar apoyo financiero a al menos 10 experimentos liderados por pymes cerró recientemente.
Esta convocatoria abierta está diseñada para apoyar experimentos de asistencia digital basados en IA que involucran a pymes de la industria manufacturera.

Todos los experimentos de la Convocatoria Abierta WASABI están obligados a:

* ejecutar el **stack Docker OVOS de WASABI/COALA**
* conectarse a través de **HiveMind**
* desarrollar una **Skill OVOS** personalizada que contenga su lógica industrial

El uso de OVOS/HiveMind se explica en estos 2 documentos del proyecto WASABI:
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS y HiveMind en el piloto industrial WASABI](../2025-11-26-OVOS-hivemind-industry.png)

---

## Ejemplos de Aplicaciones Industriales

### **1. Orientación de Trabajadores y Apoyo al Ensamblaje**

Experimentos como **[TICONAI](https://wasabiproject.eu/ticonai-2)** y **[SKITE](https://wasabiproject.eu/skite-main-2)** usan skills OVOS para orientar a los trabajadores durante tareas complejas, como ensamblar componentes, validar procedimientos o proporcionar instrucciones paso a paso sin usar las manos.

### **2. Control de Calidad y Reducción de Errores**

Proyectos como **[WALLABI](https://wasabiproject.eu/wallabi)** y **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** se centran en proporcionar a los trabajadores instrucciones y listas de verificación en tiempo real para prevenir errores. Los asistentes de voz ayudan a los operarios a verificar configuraciones, recordar comprobaciones de seguridad o contrastar parámetros.

### **3. Asistencia al Mantenimiento Predictivo**

Experimentos como **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** usan el asistente para dar a los técnicos de mantenimiento acceso rápido a datos de estado de las máquinas, explicaciones de fallos y pasos de reparación, especialmente cuando tienen las manos ocupadas.

### **4. Logística, Manipulación de Materiales y Apoyo al Almacén**

**[VELO](https://wasabiproject.eu/velo-2)** y **[AIVEA](https://wasabiproject.eu/aivea)** usan la voz para ayudar a los trabajadores a localizar artículos, confirmar inventario o verificar tareas de entrega mientras se desplazan por la planta de fábrica.

### **5. Incorporación y Formación**

**[ONBOARD](https://wasabiproject.eu/onboard)** y **[AI-MODE](https://wasabiproject.eu/ai-mode)** prueban cómo se puede guiar a los nuevos empleados a través de tareas mediante orientación por voz, reduciendo la carga sobre los supervisores.

### **6. Sostenibilidad, Seguimiento de Residuos y Eficiencia de Recursos**

**[VAFER](https://wasabiproject.eu/vafer)** integra interfaces de voz con sistemas que monitorizan el reciclaje, la reutilización de materiales y los flujos de recursos: reporte sin usar las manos en entornos fabriles.

Todo esto depende de OVOS y de HiveMind para encaminar la comunicación entre dispositivos, interfaz Android y sistemas backend.

---

## Lo Que COALA/WASABI Construyó Sobre OVOS

Aunque los proyectos no produjeron skills industriales de código abierto, sí crearon varios componentes en torno a OVOS + HiveMind:

### **1. Un Asistente de Dominio (DA) basado en RASA**

La investigación inicial de COALA desarrolló un **pipeline de NLP RASA** entrenado con conversaciones de la industria manufacturera (sobre comprobaciones de calidad, resolución de problemas, operación de máquinas).
En WASABI, este motor RASA se conecta a OVOS como una **skill**, gestionando el diálogo específico del dominio.

### **2. La Aplicación Android COALA**

Un front-end Android para los trabajadores, que se conecta a OVOS a través de HiveMind.

Versión inicial publicada aquí:
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

Las funcionalidades incluyen:

* inicio de sesión mediante Keycloak
* chat por texto o voz
* interfaz para instrucciones, avisos y notas
* mensajería basada en HiveMind

### **3. Un Stack Industrial Completo Basado en Docker**

Ambos proyectos ofrecen un entorno Docker preconfigurado que reúne:

* OVOS
* HiveMind
* Keycloak (gestión de usuarios)
* motor de NLP RASA
* servicios de conector COALA

Esto forma el stack estándar de asistente de voz industrial que todos los experimentos WASABI deben implementar.

### **4. Un Dataset de Habla Industrial**

COALA publicó un dataset de habla multilingüe grabado en fábricas y talleres:
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## Por Qué Funciona para la Industria

Los objetivos de diseño que importan en la planta de fábrica —transparencia total para sectores regulados, implementación local/edge sin dependencia de la nube, skills modulares para lógica propietaria y la capacidad de HiveMind de distribuir nodos de voz por una instalación— se incorporaron desde el principio, no se añadieron a posteriori.

Código fuente de OVOS y HiveMind: [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)

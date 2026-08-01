---
title: "OVOS e HiveMind nell'Industria Manifatturiera"
description: "I progetti europei COALA e WASABI hanno costruito un intero framework di assistente vocale industriale attorno a OVOS + HiveMind, integrandoli con i propri strumenti, interfaccia e motori di conversazione."
date: 2025-11-26
lang: it
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

I progetti europei **[COALA](https://coala-ai.de)** e **[WASABI](https://wasabiproject.eu)** hanno costruito un intero framework di assistente vocale industriale sopra **[OpenVoiceOS](https://openvoiceos.org)** (una piattaforma vocale open source senza scopo di lucro) e **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)**, integrandoli con la propria interfaccia Android, il proprio motore NLP e stack Docker.

Non sono stato coinvolto in queste implementazioni. Ed è proprio questo il punto: lo stack viene adottato per i propri meriti, da team con reali requisiti industriali.

---

## Bando Aperto WASABI

Il 2º [Bando Aperto WASABI](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) per fornire sostegno finanziario ad almeno 10 sperimentazioni guidate da PMI si è chiuso di recente.
Questo bando aperto è concepito per sostenere sperimentazioni di assistenza digitale basata su IA che coinvolgono PMI del settore manifatturiero.

Tutte le sperimentazioni del Bando Aperto WASABI sono tenute a:

* eseguire lo **stack Docker OVOS di WASABI/COALA**
* connettersi tramite **HiveMind**
* sviluppare una **Skill OVOS** personalizzata contenente la propria logica industriale

L'utilizzo di OVOS/HiveMind è spiegato in questi 2 documenti del progetto WASABI:
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS e HiveMind nel pilota industriale WASABI](../2025-11-26-OVOS-hivemind-industry.png)

---

## Esempi di Applicazioni Industriali

### **1. Guida degli Operatori e Supporto all'Assemblaggio**

Sperimentazioni come **[TICONAI](https://wasabiproject.eu/ticonai-2)** e **[SKITE](https://wasabiproject.eu/skite-main-2)** usano skill OVOS per guidare gli operatori durante compiti complessi come assemblare componenti, convalidare procedure o fornire istruzioni passo passo a mani libere.

### **2. Controllo Qualità e Riduzione degli Errori**

Progetti come **[WALLABI](https://wasabiproject.eu/wallabi)** e **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** si concentrano sul fornire agli operatori istruzioni e liste di controllo in tempo reale per prevenire errori. Gli assistenti vocali aiutano gli operatori a verificare le impostazioni, ricordare i controlli di sicurezza o riscontrare i parametri.

### **3. Assistenza alla Manutenzione Predittiva**

Sperimentazioni come **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** usano l'assistente per dare ai tecnici della manutenzione un accesso rapido ai dati sullo stato di salute delle macchine, alle spiegazioni dei guasti e alle procedure di riparazione, soprattutto quando hanno le mani occupate.

### **4. Logistica, Movimentazione dei Materiali e Supporto al Magazzino**

**[VELO](https://wasabiproject.eu/velo-2)** e **[AIVEA](https://wasabiproject.eu/aivea)** usano la voce per aiutare gli operatori a localizzare articoli, confermare l'inventario o verificare i compiti di consegna mentre si spostano nel reparto produttivo.

### **5. Inserimento e Formazione**

**[ONBOARD](https://wasabiproject.eu/onboard)** e **[AI-MODE](https://wasabiproject.eu/ai-mode)** testano come i nuovi dipendenti possano essere guidati attraverso i compiti tramite guida vocale, riducendo il carico sui supervisori.

### **6. Sostenibilità, Tracciamento dei Rifiuti ed Efficienza delle Risorse**

**[VAFER](https://wasabiproject.eu/vafer)** integra interfacce vocali con sistemi che monitorano il riciclo, il riutilizzo dei materiali e i flussi di risorse — rendicontazione a mani libere in ambienti di fabbrica.

Tutto questo si basa su OVOS e su HiveMind per instradare la comunicazione tra dispositivi, interfaccia Android e sistemi di backend.

---

## Cosa Hanno Costruito COALA/WASABI Sopra OVOS

Sebbene i progetti non abbiano prodotto skill industriali open source, hanno creato diversi componenti attorno a OVOS + HiveMind:

### **1. Un Domain Assistant (DA) basato su RASA**

La ricerca iniziale di COALA ha sviluppato una **pipeline NLP RASA** addestrata su conversazioni del settore manifatturiero (su controlli di qualità, risoluzione dei problemi, funzionamento delle macchine).
In WASABI, questo motore RASA è collegato a OVOS come una **skill**, gestendo il dialogo specifico del dominio.

### **2. L'App Android COALA**

Un front-end Android per gli operatori, che si connette a OVOS tramite HiveMind.

Versione iniziale rilasciata qui:
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

Le funzionalità includono:

* login tramite Keycloak
* chat testuale o vocale
* interfaccia per istruzioni, avvisi e note
* messaggistica basata su HiveMind

### **3. Uno Stack Industriale Completo Basato su Docker**

Entrambi i progetti forniscono un ambiente Docker preconfigurato che raggruppa:

* OVOS
* HiveMind
* Keycloak (gestione utenti)
* motore NLP RASA
* servizi connettore COALA

Questo costituisce lo stack standard di assistente vocale industriale che tutte le sperimentazioni WASABI devono implementare.

### **4. Un Dataset di Parlato Industriale**

COALA ha pubblicato un dataset di parlato multilingue registrato in fabbriche e officine:
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## Perché Funziona per l'Industria

Gli obiettivi di progettazione che contano nel reparto produttivo — trasparenza totale per i settori regolamentati, implementazione locale/edge senza dipendenza dal cloud, skill modulari per la logica proprietaria e la capacità di HiveMind di distribuire nodi vocali in un impianto — sono stati incorporati fin dall'inizio, non aggiunti a posteriori.

Codice sorgente di OVOS e HiveMind: [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)

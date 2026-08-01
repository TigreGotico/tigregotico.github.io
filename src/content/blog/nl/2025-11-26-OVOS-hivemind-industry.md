---
title: "OVOS & HiveMind in de Maakindustrie"
description: "De EU-projecten COALA en WASABI hebben een compleet industrieel spraakassistent-framework rond OVOS + HiveMind gebouwd, en integreren die met hun eigen tools, UI en conversatie-engines."
date: 2025-11-26
lang: nl
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

De EU-projecten **[COALA](https://coala-ai.de)** en **[WASABI](https://wasabiproject.eu)** bouwden een compleet industrieel spraakassistent-framework bovenop **[OpenVoiceOS](https://openvoiceos.org)** (een non-profit open-source spraakplatform) en **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)**, en integreren die met hun eigen Android-UI, NLP-engine en Docker-stack.

Ik was niet betrokken bij deze implementaties. Dat is nu juist het punt: de stack wordt op eigen kracht overgenomen, door teams met reële industriële eisen.

---

## WASABI Open Call

De 2e [WASABI Open Call](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) om financiële steun te bieden aan ten minste 10 experimenten geleid door kmo's is onlangs afgesloten.
Deze open call is ontworpen om experimenten met op AI gebaseerde digitale assistentie te ondersteunen, waarbij kmo's uit de maakindustrie betrokken zijn.

Alle experimenten van de WASABI Open Call zijn verplicht om:

* de **WASABI/COALA OVOS Docker-stack** te draaien
* verbinding te maken via **HiveMind**
* een aangepaste **OVOS Skill** te ontwikkelen die hun industriële logica bevat

Het gebruik van OVOS/HiveMind wordt uitgelegd in deze 2 documenten van het WASABI-project:
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS en HiveMind in de industriële WASABI-pilot](../2025-11-26-OVOS-hivemind-industry.png)

---

## Voorbeelden van industriële toepassingen

### **1. Werknemersbegeleiding en montageondersteuning**

Experimenten zoals **[TICONAI](https://wasabiproject.eu/ticonai-2)** en **[SKITE](https://wasabiproject.eu/skite-main-2)** gebruiken OVOS-skills om werknemers te begeleiden bij complexe taken zoals het monteren van componenten, het valideren van procedures of het handsfree geven van stapsgewijze instructies.

### **2. Kwaliteitscontrole en foutreductie**

Projecten zoals **[WALLABI](https://wasabiproject.eu/wallabi)** en **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** richten zich op het voorzien van werknemers van realtime-instructies en checklists om fouten te voorkomen. Spraakassistenten helpen operators om instellingen te verifiëren, veiligheidscontroles te onthouden of parameters te controleren.

### **3. Ondersteuning bij voorspellend onderhoud**

Experimenten zoals **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** gebruiken de assistent om onderhoudstechnici snel toegang te geven tot gegevens over de gezondheid van machines, uitleg over storingen en reparatiestappen — vooral wanneer hun handen bezet zijn.

### **4. Logistiek, materiaalafhandeling en magazijnondersteuning**

**[VELO](https://wasabiproject.eu/velo-2)** en **[AIVEA](https://wasabiproject.eu/aivea)** gebruiken spraak om werknemers te helpen items te lokaliseren, voorraad te bevestigen of leveringstaken te controleren terwijl ze zich over de werkvloer bewegen.

### **5. Onboarding en training**

**[ONBOARD](https://wasabiproject.eu/onboard)** en **[AI-MODE](https://wasabiproject.eu/ai-mode)** testen hoe nieuwe medewerkers via spraakbegeleiding door taken kunnen worden geleid, wat de last voor supervisors vermindert.

### **6. Duurzaamheid, afvalregistratie en hulpbronefficiëntie**

**[VAFER](https://wasabiproject.eu/vafer)** integreert spraakinterfaces met systemen die recycling, hergebruik van materialen en hulpbronstromen monitoren — handsfree rapportage in fabrieksomgevingen.

Dit alles is afhankelijk van OVOS en van HiveMind voor het routeren van communicatie tussen apparaten, de Android-UI en backendsystemen.

---

## Wat COALA/WASABI bovenop OVOS bouwden

Hoewel de projecten geen open-source industriële skills hebben opgeleverd, hebben ze wel verscheidene componenten rond OVOS + HiveMind gecreëerd:

### **1. Een op RASA gebaseerde Domain Assistant (DA)**

Eerder COALA-onderzoek ontwikkelde een **RASA NLP-pipeline** die is getraind op gesprekken uit de maakindustrie (over kwaliteitscontroles, probleemoplossing, machinebediening).
In WASABI is deze RASA-engine als een **skill** aan OVOS gekoppeld en behandelt hij domeinspecifieke dialoog.

### **2. De COALA Android-app**

Een Android-frontend voor werknemers, die via HiveMind verbinding maakt met OVOS.

Vroege versie hier uitgebracht:
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

De functies omvatten:

* login via Keycloak
* tekst- of spraakchat
* UI voor instructies, waarschuwingen en notities
* op HiveMind gebaseerde berichtgeving

### **3. Een volledige, op Docker gebaseerde industriële stack**

Beide projecten leveren een vooraf geconfigureerde Docker-omgeving die het volgende bundelt:

* OVOS
* HiveMind
* Keycloak (gebruikersbeheer)
* RASA NLP-engine
* COALA-connectorservices

Dit vormt de standaard industriële spraakassistent-stack die alle WASABI-experimenten moeten implementeren.

### **4. Een industriële spraakdataset**

COALA publiceerde een meertalige spraakdataset die in fabrieken en werkplaatsen is opgenomen:
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## Waarom het werkt voor de industrie

De ontwerpdoelen die er op de werkvloer toe doen — volledige transparantie voor gereguleerde sectoren, lokale/edge-implementatie zonder cloudafhankelijkheid, modulaire skills voor propriëtaire logica en het vermogen van HiveMind om spraaknodes over een faciliteit te verdelen — waren vanaf het begin ingebouwd, niet achteraf toegevoegd.

Broncode van OVOS en HiveMind: [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)

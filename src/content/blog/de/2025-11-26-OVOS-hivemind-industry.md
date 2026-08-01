---
title: "OVOS & HiveMind in der Fertigungsindustrie"
description: "Die EU-Projekte COALA und WASABI haben ein komplettes industrielles Sprachassistenten-Framework rund um OVOS + HiveMind aufgebaut und diese mit ihren eigenen Werkzeugen, ihrer Benutzeroberfläche und ihren Konversations-Engines integriert."
date: 2025-11-26
lang: de
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

Die EU-Projekte **[COALA](https://coala-ai.de)** und **[WASABI](https://wasabiproject.eu)** haben ein komplettes industrielles Sprachassistenten-Framework auf Basis von **[OpenVoiceOS](https://openvoiceos.org)** (einer gemeinnützigen quelloffenen Sprachplattform) und **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)** aufgebaut und diese mit ihrer eigenen Android-Benutzeroberfläche, ihrer NLP-Engine und ihrem Docker-Stack integriert.

Ich war an diesen Bereitstellungen nicht beteiligt. Genau das ist der Punkt: Der Stack wird aufgrund seiner eigenen Vorzüge übernommen, von Teams mit realen industriellen Anforderungen.

---

## WASABI Open Call

Der 2. [WASABI Open Call](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) zur finanziellen Förderung von mindestens 10 von KMU geleiteten Experimenten wurde kürzlich abgeschlossen.
Dieser Open Call ist darauf ausgelegt, KI-basierte digitale Assistenzexperimente unter Beteiligung von KMU aus der Fertigung zu unterstützen.

Alle Experimente des WASABI Open Call sind verpflichtet:

* den **WASABI/COALA-OVOS-Docker-Stack** auszuführen
* sich über **HiveMind** zu verbinden
* einen benutzerdefinierten **OVOS-Skill** zu entwickeln, der ihre industrielle Logik enthält

Die Nutzung von OVOS/HiveMind wird in diesen 2 Dokumenten des WASABI-Projekts erläutert:
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS und HiveMind im industriellen WASABI-Pilotprojekt](../2025-11-26-OVOS-hivemind-industry.png)

---

## Beispiele industrieller Anwendungen

### **1. Werkerführung & Montageunterstützung**

Experimente wie **[TICONAI](https://wasabiproject.eu/ticonai-2)** und **[SKITE](https://wasabiproject.eu/skite-main-2)** nutzen OVOS-Skills, um Arbeiter bei komplexen Aufgaben anzuleiten, etwa beim Zusammenbau von Komponenten, bei der Validierung von Verfahren oder bei der freihändigen Bereitstellung von Schritt-für-Schritt-Anweisungen.

### **2. Qualitätskontrolle und Fehlerreduzierung**

Projekte wie **[WALLABI](https://wasabiproject.eu/wallabi)** und **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** konzentrieren sich darauf, Arbeitern Echtzeit-Anweisungen und Checklisten bereitzustellen, um Fehler zu vermeiden. Sprachassistenten helfen Bedienern, Einstellungen zu überprüfen, Sicherheitskontrollen zu erinnern oder Parameter gegenzuprüfen.

### **3. Unterstützung bei der vorausschauenden Wartung**

Experimente wie **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** nutzen den Assistenten, um Wartungstechnikern schnellen Zugriff auf Maschinenzustandsdaten, Fehlererklärungen und Reparaturschritte zu geben — insbesondere, wenn ihre Hände beschäftigt sind.

### **4. Logistik, Materialhandhabung & Lagerunterstützung**

**[VELO](https://wasabiproject.eu/velo-2)** und **[AIVEA](https://wasabiproject.eu/aivea)** nutzen Sprache, um Arbeitern zu helfen, Artikel zu finden, Bestände zu bestätigen oder Lieferaufgaben zu prüfen, während sie sich über die Werkstattfläche bewegen.

### **5. Einarbeitung und Schulung**

**[ONBOARD](https://wasabiproject.eu/onboard)** und **[AI-MODE](https://wasabiproject.eu/ai-mode)** testen, wie neue Mitarbeiter mittels Sprachführung durch Aufgaben geleitet werden können, um die Belastung der Vorgesetzten zu verringern.

### **6. Nachhaltigkeit, Abfallverfolgung & Ressourceneffizienz**

**[VAFER](https://wasabiproject.eu/vafer)** integriert Sprachschnittstellen mit Systemen, die Recycling, Materialwiederverwendung und Ressourcenflüsse überwachen — freihändiges Berichten in Fabrikumgebungen.

All dies stützt sich auf OVOS und auf HiveMind zur Weiterleitung der Kommunikation zwischen Geräten, Android-Benutzeroberfläche und Backend-Systemen.

---

## Was COALA/WASABI auf OVOS aufgebaut haben

Obwohl die Projekte keine quelloffenen industriellen Skills hervorgebracht haben, schufen sie mehrere Komponenten rund um OVOS + HiveMind:

### **1. Ein RASA-basierter Domänenassistent (DA)**

Frühere COALA-Forschung entwickelte eine **RASA-NLP-Pipeline**, trainiert mit Fertigungsgesprächen (über Qualitätsprüfungen, Fehlerbehebung, Maschinenbedienung).
In WASABI ist diese RASA-Engine als **Skill** in OVOS eingebunden und übernimmt den domänenspezifischen Dialog.

### **2. Die COALA-Android-App**

Ein Android-Frontend für Arbeiter, das sich über HiveMind mit OVOS verbindet.

Frühe Version hier veröffentlicht:
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

Zu den Funktionen gehören:

* Anmeldung über Keycloak
* Text- oder Sprachchat
* Benutzeroberfläche für Anweisungen, Warnungen und Notizen
* HiveMind-basiertes Messaging

### **3. Ein vollständiger Docker-basierter Industrie-Stack**

Beide Projekte liefern eine vorkonfigurierte Docker-Umgebung, die Folgendes bündelt:

* OVOS
* HiveMind
* Keycloak (Benutzerverwaltung)
* RASA-NLP-Engine
* COALA-Connector-Dienste

Dies bildet den Standard-Stack für industrielle Sprachassistenten, den alle WASABI-Experimente bereitstellen müssen.

### **4. Ein industrieller Sprachdatensatz**

COALA veröffentlichte einen mehrsprachigen Sprachdatensatz, der in Fabriken und Werkstätten aufgenommen wurde:
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## Warum es für die Industrie funktioniert

Die Designziele, die in der Fertigung zählen — vollständige Transparenz für regulierte Branchen, lokale/Edge-Bereitstellung ohne Cloud-Abhängigkeit, modulare Skills für proprietäre Logik und die Fähigkeit von HiveMind, Sprachknoten über eine Anlage zu verteilen — waren von Anfang an eingebaut, nicht nachträglich hinzugefügt.

Quellcode von OVOS und HiveMind: [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)

---
title: "OVOS & HiveMind in the Manufacturing Industry"
description: "The COALA and WASABI EU projects have built an entire industrial voice-assistant framework around OVOS + HiveMind, integrating them with their own tools, UI, and conversation engines."
date: 2025-11-26
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

The **[COALA](https://coala-ai.de)** and **[WASABI](https://wasabiproject.eu)** EU projects built an entire industrial voice-assistant framework on top of **[OpenVoiceOS](https://openvoiceos.org)** (a non-profit open-source voice platform) and **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)**, integrating them with their own Android UI, NLP engine, and Docker stack.

I wasn’t involved in these deployments. That’s the point: the stack is being adopted on its own merits, by teams with real industrial requirements.

---

## WASABI Open Call

The 2nd [WASABI Open Call](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf) to provide financial support to at least 10 experiments led by SMEs recently closed.
This open call is designed to support AI-based digital assistance experiments involving SMEs from manufacturing.

All WASABI Open Call experiments are required to:

* run the **WASABI/COALA OVOS Docker stack**
* connect via **HiveMind**
* develop a custom **OVOS Skill** containing their industrial logic

The usage of OVOS/Hivemind is explained in these 2 documents from the Wasabi project:
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![OVOS and HiveMind in the WASABI industrial pilot](./2025-11-26-OVOS-hivemind-industry.png)

---

## Examples of Industrial Applications

### **1. Worker Guidance & Assembly Support**

Experiments like **[TICONAI](https://wasabiproject.eu/ticonai-2)** and **[SKITE](https://wasabiproject.eu/skite-main-2)** are using OVOS skills to guide workers during complex tasks such as assembling components, validating procedures, or providing step-by-step instructions hands-free.

### **2. Quality Control and Error Reduction**

Projects like **[WALLABI](https://wasabiproject.eu/wallabi)** and **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** focus on providing workers with real-time instructions and checklists to prevent mistakes. Voice assistants help operators verify settings, remember safety checks, or cross-check parameters.

### **3. Predictive Maintenance Assistance**

Experiments such as **[GENIUS-PM](https://wasabiproject.eu/genius-pm)** use the assistant to give maintenance techs quick access to machine health data, fault explanations, and repair steps, especially when their hands are occupied.

### **4. Logistics, Material Handling & Warehouse Support**

**[VELO](https://wasabiproject.eu/velo-2)** and **[AIVEA](https://wasabiproject.eu/aivea)** use voice to help workers locate items, confirm inventory, or check delivery tasks while moving around a shop floor.

### **5. Onboarding and Training**

**[ONBOARD](https://wasabiproject.eu/onboard)** and **[AI-MODE](https://wasabiproject.eu/ai-mode)** test how new employees can be guided through tasks using voice guidance, reducing the burden on supervisors.

### **6. Sustainability, Waste Tracking & Resource Efficiency**

**[VAFER](https://wasabiproject.eu/vafer)** integrates voice interfaces with systems that monitor recycling, material reuse, and resource flows, with hands-free reporting in factory environments.

All of these rely on OVOS and on HiveMind for routing communication between devices, Android UI, and backend systems.

---

## What COALA/WASABI Built on Top of OVOS

Although the projects produced no open-source industrial skills, they did create several components around OVOS + HiveMind:

### **1. A RASA-based Domain Assistant (DA)**

Earlier COALA research developed a **RASA NLP pipeline** trained on manufacturing conversations (about quality checks, troubleshooting, machine operation).
In WASABI, this RASA engine is plugged into OVOS as a **skill**, handling domain-specific dialog.

### **2. The COALA Android App**

An Android front-end for workers, connecting to OVOS through HiveMind.

Early version released here:
[BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

Features include:

* login via Keycloak
* text or voice chat
* UI for instructions, warnings, and notes
* HiveMind-based messaging

### **3. A Full Docker-Based Industrial Stack**

Both projects ship a preconfigured Docker environment bundling:

* OVOS
* HiveMind
* Keycloak (user management)
* RASA NLP engine
* COALA connector services

This forms the standard industrial voice-assistant stack that all WASABI experiments must deploy.

### **4. An Industrial Speech Dataset**

COALA published a multilingual speech dataset recorded in factories and workshops:
[zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## Why It Works for Industry

The design goals that matter on the factory floor were baked in from the start, not retrofitted: full transparency for regulated sectors, local/edge deployment with no cloud dependency, modular skills for proprietary logic, and HiveMind's ability to distribute voice nodes across a facility.

OVOS and HiveMind source code: [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)


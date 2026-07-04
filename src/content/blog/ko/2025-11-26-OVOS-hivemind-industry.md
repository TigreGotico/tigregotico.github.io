---
title: "제조 산업에서의 OVOS와 HiveMind"
description: "EU 프로젝트 COALA와 WASABI는 OVOS + HiveMind를 중심으로 산업용 음성 비서 프레임워크 전체를 구축하고, 이를 자체 도구, UI, 대화 엔진과 통합했습니다."
date: 2025-11-26
lang: ko
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "HiveMind"
  - "Industry"
  - "manufacturing"
draft: false
---

EU 프로젝트 **[COALA](https://coala-ai.de)**와 **[WASABI](https://wasabiproject.eu)**는 **[OpenVoiceOS](https://openvoiceos.org)**(비영리 오픈소스 음성 플랫폼)와 **[HiveMind](https://jarbashivemind.github.io/HiveMind-community-docs/)**를 기반으로 산업용 음성 비서 프레임워크 전체를 구축하고, 이를 자체 Android UI, NLP 엔진, Docker 스택과 통합했습니다.

저는 이러한 배포에 관여하지 않았습니다. 바로 그 점이 중요합니다. 이 스택은 실제 산업 요구사항을 가진 팀들에 의해 그 자체의 장점만으로 채택되고 있습니다.

---

## WASABI 공개 공모

적어도 10건의 중소기업(SME) 주도 실험에 재정적 지원을 제공하기 위한 제2차 [WASABI 공개 공모](https://wasabiproject.eu/wp-content/uploads/2025/08/WASABI_Guide_for_Applicants_2nd-OC_vFIN.pdf)가 최근 마감되었습니다.
이 공개 공모는 제조업 중소기업이 참여하는 AI 기반 디지털 지원 실험을 지원하기 위해 마련되었습니다.

모든 WASABI 공개 공모 실험은 다음을 반드시 수행해야 합니다.

* **WASABI/COALA OVOS Docker 스택** 실행
* **HiveMind**를 통한 연결
* 자사의 산업 로직을 담은 맞춤형 **OVOS Skill** 개발

OVOS/HiveMind의 활용 방식은 WASABI 프로젝트의 다음 두 문서에 설명되어 있습니다.
- [Deliverable D2.1](https://wasabiproject.eu/wp-content/uploads/2024/01/WASABI_D2.1_template_v0.7_FINAL.pdf)
- [Deliverable D2.4](https://files.wasabiproject.eu/wp-content/uploads/2023/Docs/wp2/Deliverables/D2.4/WASABI_D2.4_Joint%20WASABI%20Demonstrator_v0.5_final.pdf)

![WASABI 산업 파일럿에서의 OVOS와 HiveMind](../2025-11-26-OVOS-hivemind-industry.png)

---

## 산업 응용 사례

### **1. 작업자 안내 및 조립 지원**

**[TICONAI](https://wasabiproject.eu/ticonai-2)**와 **[SKITE](https://wasabiproject.eu/skite-main-2)** 같은 실험은 OVOS skill을 사용하여 부품 조립, 절차 검증, 단계별 지침 제공 등 복잡한 작업 중에 작업자를 손을 쓰지 않고 안내합니다.

### **2. 품질 관리 및 오류 감소**

**[WALLABI](https://wasabiproject.eu/wallabi)**와 **[HUMANENERDIA](https://wasabiproject.eu/humanenerdia)** 같은 프로젝트는 실수를 예방하기 위해 작업자에게 실시간 지침과 체크리스트를 제공하는 데 중점을 둡니다. 음성 비서는 작업자가 설정을 확인하고, 안전 점검을 기억하거나, 매개변수를 교차 확인하는 것을 돕습니다.

### **3. 예측 정비 지원**

**[GENIUS-PM](https://wasabiproject.eu/genius-pm)** 같은 실험은 비서를 활용하여 정비 기술자가 특히 손이 바쁠 때 기계 상태 데이터, 결함 설명, 수리 단계에 빠르게 접근할 수 있도록 합니다.

### **4. 물류, 자재 취급 및 창고 지원**

**[VELO](https://wasabiproject.eu/velo-2)**와 **[AIVEA](https://wasabiproject.eu/aivea)**는 음성을 사용하여 작업자가 작업 현장을 돌아다니는 동안 품목을 찾고, 재고를 확인하거나, 배송 작업을 점검하도록 돕습니다.

### **5. 온보딩 및 교육**

**[ONBOARD](https://wasabiproject.eu/onboard)**와 **[AI-MODE](https://wasabiproject.eu/ai-mode)**는 음성 안내를 사용하여 신입 직원이 작업을 어떻게 안내받을 수 있는지 시험하며, 이를 통해 관리자의 부담을 줄입니다.

### **6. 지속가능성, 폐기물 추적 및 자원 효율성**

**[VAFER](https://wasabiproject.eu/vafer)**는 재활용, 자재 재사용, 자원 흐름을 모니터링하는 시스템과 음성 인터페이스를 통합하여 공장 환경에서 손을 쓰지 않는 보고를 가능하게 합니다.

이 모든 것은 장치, Android UI, 백엔드 시스템 간의 통신 라우팅을 위해 OVOS와 HiveMind에 의존합니다.

---

## COALA/WASABI가 OVOS 위에 구축한 것

이 프로젝트들은 오픈소스 산업용 skill을 만들지는 않았지만, OVOS + HiveMind를 중심으로 여러 구성 요소를 만들었습니다.

### **1. RASA 기반 도메인 비서(DA)**

초기 COALA 연구는 제조업 대화(품질 점검, 문제 해결, 기계 조작 등)로 훈련된 **RASA NLP 파이프라인**을 개발했습니다.
WASABI에서는 이 RASA 엔진이 **skill**로서 OVOS에 연결되어 도메인 특화 대화를 처리합니다.

### **2. COALA Android 앱**

HiveMind를 통해 OVOS에 연결되는 작업자용 Android 프런트엔드입니다.

초기 버전은 여기에 공개되어 있습니다.
[https://github.com/BIBA-GmbH/Mycroft-Android](https://github.com/BIBA-GmbH/Mycroft-Android)

기능은 다음과 같습니다.

* Keycloak을 통한 로그인
* 텍스트 또는 음성 채팅
* 지침, 경고, 메모를 위한 UI
* HiveMind 기반 메시징

### **3. Docker 기반 완전한 산업용 스택**

두 프로젝트 모두 다음을 묶은 사전 구성된 Docker 환경을 제공합니다.

* OVOS
* HiveMind
* Keycloak(사용자 관리)
* RASA NLP 엔진
* COALA 커넥터 서비스

이는 모든 WASABI 실험이 반드시 배포해야 하는 표준 산업용 음성 비서 스택을 구성합니다.

### **4. 산업용 음성 데이터셋**

COALA는 공장과 작업장에서 녹음한 다국어 음성 데이터셋을 공개했습니다.
[https://zenodo.org/record/8268928](https://zenodo.org/record/8268928)

---

## 산업이 OVOS + HiveMind를 선택하는 이유

그 매력은 단순명료합니다.

* **완전한 투명성**(규제 산업에 필수)
* **로컬/엣지 배포**(클라우드 의존 없음)
* **기존 장비에 쉽게 통합**
* **맞춤형 독점 skill에 충분한 모듈성**
* **분산 음성 네트워크**(공장 전역의 HiveMind 새틀라이트)

요컨대, 이 조합은 유연하고 특정 공급업체에 종속되지 않으며 산업 데이터 제약을 존중합니다.

---

## 산업에서 작동하는 이유

공장 현장에서 중요한 설계 목표들, 즉 규제 산업을 위한 완전한 투명성, 클라우드 의존이 없는 로컬/엣지 배포, 독점 로직을 위한 모듈형 skill, 그리고 시설 전역에 음성 노드를 분산할 수 있는 HiveMind의 능력은 나중에 덧붙여진 것이 아니라 처음부터 내재되어 있었습니다.

OVOS 및 HiveMind 소스 코드: [github.com/OpenVoiceOS](https://github.com/OpenVoiceOS) · [github.com/JarbasHiveMind](https://github.com/JarbasHiveMind)

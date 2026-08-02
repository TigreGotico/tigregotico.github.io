---
title: "OpenVoiceOS और Home Assistant: वॉइस ऑटोमेशन की ड्रीम टीम"
description: "Home Assistant ऑटोमेशन संभालता है; OVOS आवाज़ संभालता है। तीन एकीकरण परतें इस संयोजन को कारगर बनाती हैं: HA की वॉइस पाइपलाइन के लिए Wyoming ब्रिज, संवादात्मक एजेंट के रूप में ovos-persona-server, और OVOS उपकरणों को HA की नेटिव एंटिटी के रूप में प्रस्तुत करने के लिए HiveMind।"
date: 2025-09-17
lang: hi
author: "Casimiro Ferreira"
tags:
  - "OVOS"
  - "Home Assistant"
  - "Smart Home"
  - "Voice Automation"
draft: false
---

> यह ब्लॉग मूल रूप से [OpenVoiceOS blog](https://blog.openvoiceos.org/posts/2025-09-17-ovos_ha_dream_team) पर प्रकाशित हुआ था

Home Assistant ऑटोमेशन संभालता है; OVOS आवाज़ संभालता है। न तो कोई दूसरे बनने की कोशिश करता है। जिम्मेदारियों का यही विभाजन इस संयोजन को कारगर बनाता है: HA के डिवाइस एकीकरण और ऑटोमेशन इंजन के साथ OVOS की लचीली, पूरी तरह लोकल वॉइस स्टैक।

यह पोस्ट तीन एकीकरण परतों को कवर करती है: HA की वॉइस पाइपलाइन के लिए Wyoming ब्रिज, संवादात्मक एजेंट के रूप में ovos-persona-server, और OVOS उपकरणों को HA की नेटिव एंटिटी के रूप में प्रस्तुत करने के लिए HiveMind।

-----

## Wyoming ब्रिज: Home Assistant में OVOS वॉइस प्लगइन

Wyoming प्रोटोकॉल बाहरी ASR, TTS और वेकवर्ड सेवाओं के लिए HA का मानक इंटरफ़ेस है। हमने Wyoming ब्रिज बनाए हैं जो किसी भी OVOS प्लगइन को उस प्रोटोकॉल के माध्यम से प्रस्तुत करते हैं — यानी HA को OVOS पारिस्थितिकी तंत्र के हर प्लगइन तक पहुँच मिलती है, न कि केवल एक चुनिंदा सीमित सूची तक।


* [Wyoming OVOS ASR](https://github.com/TigreGotico/wyoming-ovos-stt): बोले गए आदेशों को Home Assistant के समझने योग्य टेक्स्ट में बदलें।
* [Wyoming OVOS TTS](https://github.com/TigreGotico/wyoming-ovos-tts): Home Assistant को OVOS के विविध वॉइस विकल्पों का उपयोग करके प्रतिक्रियाएँ बोलने में सक्षम बनाएँ।
* [Wyoming OVOS Wakeword](https://github.com/TigreGotico/wyoming-ovos-wakeword): कस्टम वेकवर्ड एकीकृत करें, जिससे आपका Home Assistant सेटअप केवल तभी प्रतिक्रिया दे जब वह आपके चुने हुए ट्रिगर वाक्यांश को सुने।

[OVOS Wyoming Docker](https://github.com/TigreGotico/ovos-wyoming-docker) प्रोजेक्ट इन सेवाओं को इस तरह पैकेज करता है कि वे मात्र एक `docker compose up` की दूरी पर हों।

### सार्वजनिक रूप से वित्तपोषित भाषा परियोजनाओं से बहुभाषी TTS

सुलभता में भाषाई सुलभता भी शामिल है। यह एकीकरण [**ILENIA**](https://proyectoilenia.es/demostradores-2025/prototipo-ovos/) जैसी परियोजनाओं से उच्च गुणवत्ता वाली, सार्वजनिक रूप से वित्तपोषित आवाज़ें व्यापक दर्शकों तक पहुँचाता है। Home Assistant उपयोगकर्ताओं को कैटलन और गैलिशियन जैसी भाषाओं के लिए स्वाभाविक-ध्वनि वाली आवाज़ें मिलती हैं, सीधे उन परियोजनाओं से जिन्होंने उन्हें बनाया।

* **कैटलन के लिए Matxa TTS:** [`ovos-tts-plugin-matxa-multispeaker-cat`](https://github.com/OpenVoiceOS/ovos-tts-plugin-matxa-multispeaker-cat) कैटलन भाषा के लिए मल्टी-स्पीकर टेक्स्ट-टू-स्पीच क्षमताएँ प्रदान करता है।
* **गैलिशियन के लिए NosTTS:** [`ovos-tts-plugin-nos`](https://github.com/OpenVoiceOS/ovos-tts-plugin-nos) गैलिशियन में मज़बूत टेक्स्ट-टू-स्पीच प्रदान करता है।

![ILENIA logo](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ilenia.png)

-----

## Home Assistant के लिए एक संवादात्मक एजेंट के रूप में OVOS का उपयोग

एक कदम और आगे जाना चाहते हैं? आप **Ollama एकीकरण** का उपयोग करके OVOS को Home Assistant के लिए एक पूर्ण संवादात्मक एजेंट के रूप में सेट अप कर सकते हैं।

![ollama setup in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ollama_setup.png)


इस सेटअप में, Home Assistant उपयोगकर्ता का टेक्स्ट [ovos-persona-server](https://openvoiceos.github.io/ovos-technical-manual/150-personas/) को भेजता है; OVOS इरादे को समझता है और Home Assistant के बोलने के लिए उत्तर लौटाता है। और चूँकि [ovos-persona-server](https://github.com/OpenVoiceOS/ovos-persona-server) Ollama-संगत एंडपॉइंट प्रस्तुत करता है, वही सर्वर किसी भी ऐसे ऐप से जुड़ जाता है जो Ollama या OpenAI APIs बोलता है — न कि केवल Home Assistant से।

![chat with OVOS in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/agent_chat.png)

-----


## OVOS के साथ Voice PE

[Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe) HA की वॉइस पाइपलाइन के लिए एक समर्पित हार्डवेयर सैटेलाइट है। यह ऊपर वर्णित सभी Wyoming सेवाओं के साथ काम करता है — इसे किसी भी चालू wyoming-ovos-stt, wyoming-ovos-tts, या wyoming-ovos-wakeword इंस्टेंस की ओर इंगित करें।

![Configuring Home Assistant Voice Preview Edition](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/voice_pe_config.png)

-----

## HiveMind के साथ OVOS उपकरणों को Home Assistant एंटिटी के रूप में प्रस्तुत करना

यदि आपके पास समर्पित OVOS उपकरण हैं, तो [HiveMind HomeAssistant](https://github.com/JarbasHiveMind/hivemind-homeassistant) एकीकरण उन्हें Home Assistant में नेटिव एंटिटी के रूप में दिखाता है — पूरे बेड़े के लिए एक एकीकृत नियंत्रण पैनल।


### **HiveMind एकीकरण सेट अप करना:**

HiveMind के माध्यम से अपने OVOS उपकरणों को एकीकृत करने के लिए, आप आमतौर पर Home Assistant में HiveMind एकीकरण जोड़ेंगे। इसमें कनेक्शन विवरण प्रदान करना शामिल है जैसे एकीकरण के लिए एक `name`, एक `access_key`, `password`, `site_id`, `host` (आपके HiveMind सर्वर का IP पता या होस्टनेम), और `port` (डिफ़ॉल्ट रूप से 5678)। आपके सेटअप के आधार पर आपके पास `allow_self_signed` प्रमाणपत्रों की अनुमति देने या `legacy_audio` सक्षम करने के विकल्प भी हो सकते हैं।

![HiveMind setup in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_setup.png)

### **OVOS उपकरणों के लिए प्रस्तुत नियंत्रण:**

एक बार एकीकृत होने के बाद, HiveMind आपके OVOS उपकरणों के लिए सीधे Home Assistant के भीतर नियंत्रणों का एक व्यापक समूह प्रस्तुत करता है। यह आपको Home Assistant UI से अपने OVOS उपकरण के विभिन्न पहलुओं का प्रबंधन करने की अनुमति देता है, जिसमें शामिल हैं:

  * `Listening Mode` बदलना (उदाहरण के लिए, वेकवर्ड, हमेशा सुनना)
  * `Microphone Mute` टॉगल
  * `OCP Player` स्थिति और नियंत्रण
  * `Reboot Device`, `Restart OVOS`, और `Shutdown Device` जैसी क्रियाएँ
  * `Sleep Mode` और `SSH Service` को टॉगल करना
  * मैन्युअल रूप से `Start Listening` या `Stop` करना
  * वॉल्यूम स्तर को नियंत्रित करना

![HiveMind entities in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_entities.png)

### **सूचना एकीकरण:**

HiveMind आपके OVOS उपकरणों को Home Assistant के भीतर सूचना लक्ष्यों के रूप में कार्य करने में भी सक्षम बनाता है। इसका अर्थ है कि आप Home Assistant ऑटोमेशन को अपने OVOS उपकरणों पर सीधे बोली गई सूचनाएँ भेजने के लिए कॉन्फ़िगर कर सकते हैं, जिससे वे अलर्ट, अनुस्मारक, या आपके द्वारा कॉन्फ़िगर की गई कोई भी अन्य जानकारी "बोल" सकें। यह Home Assistant में एक "Speak" नोटिफ़ायर एंटिटी के रूप में प्रस्तुत किया जाता है।

![HiveMind notify service in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/hivemind_notify.png)

### **मीडिया प्लेयर और Music Assistant एकीकरण:**

OVOS उपकरण Home Assistant में मानक मीडिया प्लेयर के रूप में भी दिखते हैं, इसलिए आप सामान्य मीडिया-प्लेयर इंटरफ़ेस से प्लेबैक नियंत्रित कर सकते हैं। वही एकीकरण Music Assistant तक विस्तृत होता है: अपने OVOS उपकरणों के माध्यम से संगीत स्ट्रीम करें और वे आपके पूरे-घर के ऑडियो सिस्टम का हिस्सा बन जाते हैं।


![HiveMind player in Home Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ha_player.png)

![HiveMind player in Music Assistant](https://blog.openvoiceos.org/assets/blog/OpenVoiceOS-and-Home-Assistant-a-voice-automation-dream-team/ma_player.png)

-----

## OVOS से Home Assistant एंटिटीज़ को नियंत्रित करना

समुदाय द्वारा अनुरक्षित [skill-homeassistant](https://github.com/OscillateLabsLLC/skill-homeassistant) OVOS को HA REST API के माध्यम से Home Assistant एंटिटीज़ पर सीधा नियंत्रण देता है। इसे अपने OVOS उपकरण पर इंस्टॉल करें और आप कह सकते हैं "turn on the living room lights" या "set the thermostat to 21 degrees" — पूरी तरह लोकल, कोई क्लाउड नहीं।

-----

## जो अभी अधूरा है

Wyoming ब्रिज और HiveMind एकीकरण यहाँ सबसे परिपक्व हिस्से हैं; संवादात्मक-एजेंट-के-रूप-में-persona-server वाला मार्ग नया है, और अगर आप देखना चाहते हैं कि OVOS + HA मिलकर अधिकतम क्या कर सकते हैं तो इसे पहले आज़माना उचित रहेगा। ऊपर लिंक किए गए रिपॉजिटरी में बग रिपोर्ट और PRs का स्वागत है।

---

OpenVoiceOS एक समुदाय-संचालित परियोजना है — यदि आप मानते हैं कि वॉइस असिस्टेंट खुले, समावेशी और उपयोगकर्ता-नियंत्रित होने चाहिए, तो [परियोजना का समर्थन करें](https://www.openvoiceos.org/contribution) वित्तपोषण, खुले डेटा, या अनुवादों के साथ।

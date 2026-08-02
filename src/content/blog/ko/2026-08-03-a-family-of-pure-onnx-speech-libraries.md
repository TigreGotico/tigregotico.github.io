---
title: "순수 ONNX 음성 라이브러리 제품군"
description: "TigreGótico는 대역폭 확장, 음성 복제, 화자 임베딩, VAD, 단어 강세, 음소화, TTS, 그리고 이들 모두를 채점하는 지표 라이브러리로 이루어진 음성 라이브러리 세트를 유지 관리합니다 — 이들은 하나의 런타임 규칙을 공유합니다: onnxruntime과 numpy만 사용하며, PyTorch도 GPU도 필요 없습니다."
date: 2026-08-01
lang: ko
author: "Casimiro Ferreira"
tags:
  - "ONNX"
  - "TTS"
  - "voice cloning"
  - "VAD"
  - "self-hosted"
  - "phoonnx"
draft: false
---

ONNX는 학습된 신경망을 위한 파일 형식입니다: 가중치와 연산 그래프가 고정되어 있으며, 이를 학습시킨 프레임워크에 대한 의존성이 없습니다. ONNX로 내보낸 모델은 그 그래프를 실행하는 것 외에는 아무것도 하지 않는 작은 추론 엔진인 **ONNX Runtime**을 통해 실행할 수 있습니다. 이는 모델이 어떻게 학습되었는지 알지 못하고, 학습을 지원하지 않으며, PyTorch나 TensorFlow가 설치되어 있을 필요도 없습니다.

우리의 여러 라이브러리는 하나의 규칙을 지킵니다: 런타임에서 유일한 의존성은 `onnxruntime`과 `numpy`뿐입니다. "대체로"가 아니라 — 패키지 자체를 임포트하는 것만으로는 결코 학습 프레임워크를 끌어오지 않습니다. `audiosronnx`(대역폭 확장과 잡음 제거), `voiceclonnx`(음성 복제), `speakeronnx`(화자 임베딩), `speechonnxmetrics`(평가), `stressonnx`(단어 강세), `vadonnx`(음성 활동 감지), `phoonnx`(음소화 및 텍스트 음성 변환) 모두가 이를 따르며, 각각 자체 PyPI 패키지로 존재합니다. 두 개 더 있는 `phoonnx.js`와 `precise-onnx-js`는 브라우저에서 `onnxruntime-web`으로 동일한 아이디어를 적용합니다.

## 왜 이렇게까지 하는가

음성 모델을 배포하는 뻔한 방법은 추론을 위해서도 학습 프레임워크를 그대로 곁에 두는 것입니다. 개발 중에는 편리합니다. 프로덕션에서는 부채입니다.

- **설치 크기.** PyTorch + CUDA 설치는 모델 하나를 로드하기도 전에 기가바이트 단위로 불어납니다. `onnxruntime`과 `numpy`를 합치면 수십 메가바이트에 불과합니다.
- **관리할 CUDA가 없습니다.** GPU 드라이버, CUDA 툴킷 버전, 프레임워크 빌드를 서로 맞추는 것은 고장의 단골 원인입니다. CPU 전용 ONNX Runtime은 이를 완전히 건너뛰며, GPU가 있는 곳에서는 여전히 같은 그래프를 GPU에서 실행합니다.
- **적당한 하드웨어에서 돌아갑니다.** 라즈베리 파이나 10년 된 노트북도 `onnxruntime`을 편안히 실행할 수 있습니다. 이런 기기는 대개 완전한 PyTorch 스택을 쓸만한 속도로 실행할 수 없거나, 32비트 또는 메모리가 제한된 보드에는 아예 설치조차 할 수 없습니다.
- **하나의 산출물, 모든 플랫폼.** 동일한 `.onnx` 파일이 Linux, macOS, Windows에서 수정 없이 실행되며, `onnxruntime-web`을 통해 브라우저 탭 안에서도 실행됩니다. 대상마다 별도의 내보내기 단계가 필요 없습니다.
- **학습/서빙 버전 충돌이 없습니다.** 학습 스택은 특정 프레임워크와 CUDA 버전에 고정됩니다. 서빙 스택은 가능한 한 가장 작고 안정적인 의존성 집합을 원합니다. 이 둘을 분리하면 하나를 업그레이드해도 다른 하나가 깨지지 않습니다.

## 그 대가

이 제약은 실재하며, 공짜가 아닙니다.

**프로세스 내에서 미세조정을 할 수 없습니다.** ONNX 그래프에는 옵티마이저도, 역전파도 없습니다. 이 라이브러리들 각각은 모델을 고정된 산출물로 취급합니다: 로드하고 실행할 뿐입니다. 학습이나 미세조정은 원본 프레임워크로 별도로 이루어지며, 그 결과가 나중에 ONNX로 내보내집니다. `stressonnx`와 `speechonnxmetrics`는 둘 다 그 오프라인 변환 단계만을 위해 `torch`를 끌어오는 선택적 `export` 추가 기능을 갖고 있습니다 — 추론을 위해서는 결코 아닙니다.

**모든 아키텍처가 깔끔하게 내보내지지는 않습니다.** 동적 제어 흐름, 커스텀 CUDA 커널, 또는 ONNX에 대응물이 없는 연산은 단순한 내보내기를 막을 수 있습니다. `audiosronnx`의 README는 이를 직접 문서화합니다: 모든 연구 모델이 이식된다고 가장하는 대신, 평가했지만 반려한 모델들의 [미출시 목록](https://github.com/TigreGotico/audiosronnx)을 이유와 함께 유지합니다.

**전처리는 손으로 다시 구현해야 합니다.** PyTorch나 Kaldi 같은 프레임워크는 STFT(파형을 스펙트로그램으로 바꾸는 과정), 멜 필터뱅크 특성, 리샘플링의 빠르고 검증된 구현을 제공합니다. 모델 자체가 더 이상 그 프레임워크에 의존하지 않게 되면, 전처리도 마찬가지로 의존할 수 없습니다 — `speakeronnx`는 바로 이 이유로 80밴드 로그-멜 필터뱅크를 순수 NumPy로 재구현하며, `audiosronnx`는 STFT와 리샘플링에 대해 같은 일을 합니다. 제대로 하려면 더 많은 코드가 필요하고, 원본에 대한 자체적인 동등성 테스트도 필요합니다.

## 하나의 작업, 여러 엔진, 하나의 API

학습된 음성 모델은 언어, 녹음 환경, 대상 도메인에 따라 엄청나게 달라집니다. 깨끗한 낭독 음성으로 학습된 화자 검증 모델은 전화 음성에서 실패할 수 있습니다. 영어 음색 전이에 맞춰진 음성 복제 모델은 성조 언어에서 명료도를 잃을 수 있습니다. 어디서나 이기는 단일 모델은 없으므로, 미리 하나에 전념하는 것은 도박입니다.

이 제품군의 각 라이브러리는 하나의 작업을 골라 여러 독립적으로 공개된 모델을 하나의 인터페이스 뒤에 감싸므로, 엔진을 바꾸는 것은 다시 쓰는 일이 아니라 한 줄짜리 변경이 됩니다.

`audiosronnx`는 잡음 제거와 대역폭 확장(8kHz 전화 음성 같은 협대역 녹음을 더 풍부하게 들리는 고표본율 신호로 바꾸는 것)이라는 두 가지 작업을, 각각 여러 엔진이 뒷받침하는 두 개의 로더 뒤로 분리합니다:

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise`는 현재 열 개의 잡음 제거기(`dpdfnet`, `mossformer2`, `frcrn`, `mpsenet`, `gtcrn`, `cmgan`, `metadenoiser`, `mossformergan`, `voicefixer`, `deepfilternet`)를 서로 다른 라이선스 아래 0.54 MB부터 415 MB 모델까지 등록합니다. `load_sr`는 일곱 개의 대역폭 확장기(`lavasr`, `novasr`, `flowhigh`, `hifiganbwe`, `apbwe`, `sidon`, `callenhancer`)를 등록합니다. 다른 엔진이 측정된 모든 축에서 앞서는 열등한 모델이라도 레지스트리에 남아 있으므로, 공개된 벤치마크 결과는 언제든 재현 가능한 상태를 유지합니다.

`voiceclonnx`는 음성 복제 — 텍스트를 거치지 않고 기존 녹음의 목소리를 다른 참조 화자처럼 들리게 바꾸는 것 — 에 같은 접근을 취합니다:

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

열 개의 엔진(`facodec`, `openvoice`, `chatterbox`, `triaan`, `cosyvoice`, `bicodec`, `knnvc`, `focalcodec`, `lscodec`, `rvc`)이 등록되어 있으며, kNN 특징 교체, 인수분해 코덱, 흐름 매칭, 음색 전이, AR 코덱-LM, 화자 분리 코덱이라는 여섯 개의 서로 다른 모델 계열에 걸쳐 있습니다. 각각은 공개된 명료도 및 화자 유사도 수치와 함께 제공되므로, 엔진을 고르는 것은 동전 던지기가 아니라 비교입니다.

`vadonnx`는 이 패턴을 음성 활동 감지 — 오디오 스트림의 어느 부분에 음성이 있는지 판단하는 작업 — 에 적용합니다:

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

여섯 개의 모델 계열(`silero`, `marblenet`, `pyannote`, `fsmn`, `speechbrain`, `ten`)이 등록되어 있으며, 선언적인 `IOSignature`가 있어 하나의 범용 엔진이 대부분을 구동하거나, 커스텀 `.onnx` VAD 파일 어디로든 향할 수 있습니다.

`speakeronnx`는 누가 말하고 있는지를 무엇을 말했는지와 무관하게 요약하는 고정 길이 벡터인 **화자 임베딩**을 추출하고, 코사인 유사도로 두 임베딩을 비교하여 두 클립이 같은 화자인지 확인합니다:

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

네 개의 아키텍처 계열(WeSpeaker, CAM++, ERes2Net, ReDimNet)에 걸쳐 아홉 개의 모델을, 공개된 임베딩 차원 및 라이선스와 함께 등록합니다.

`stressonnx`는 텍스트 음성 변환 프론트엔드를 위해 단어 강세 — 단어의 어느 음절이 강세를 받는지, 많은 언어가 철자로 드러내지 않는 정보(러시아어 *за́мок*, 성(城), 대 *замо́к*, 자물쇠는 모든 글자를 공유합니다) — 를 선택합니다. 러시아어를 위한 신경 파이프라인 하나, 우크라이나어와 벨라루스어를 위한 또 하나, 그리고 신경 추론이 전혀 없이 26개 언어를 아우르는 규칙 및 어휘 기반 백엔드를 등록합니다:

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx`는 텍스트를 음소화하고(철자로 쓰인 단어를 TTS 모델이 소비하는 소리 단위로 바꾸고), 여러 생태계(네이티브 phoonnx, Piper, Mimic3, Coqui, MMS, Transformers)에서 내보낸 17개의 등록된 합성 엔진과 음성에 걸쳐 텍스트 음성 변환을 실행합니다:

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js`는 동일한 토크나이저 경로를 `onnxruntime-web`으로 브라우저까지 가져가며, `precise-onnx-js`는 웨이크워드 감지(MFCC 특성 추출과 ONNX 분류기, Mycroft Precise 모델과 호환)를 JavaScript로 이식합니다. 둘 다 서버 없이 동작합니다:

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

`audiosronnx`(공개된 모델 18개)와 `voiceclonnx`(공개된 모델 10개)의 가중치는 [TigreGótico Hugging Face 조직](https://huggingface.co/TigreGotico)에 별도의 다운로드로 존재하며, 처음 사용할 때 가져와 로컬에 캐시되므로, 다른 엔진을 고르는 것은 재배포가 아니라 설정 변경입니다.

## 고리를 닫기: 추측 대신 엔진을 채점하기

하나의 API 뒤에 여러 엔진을 등록하는 것은 입력에 실제로 어느 것이 더 나은지 알 수 있을 때만 이득이 됩니다. 그것이 `speechonnxmetrics`가 존재하는 이유입니다: 동일한 `numpy` + `onnxruntime` 제약 위에 구축된 지표 라이브러리로, 모델을 채점하는 데 추가 설치 비용이 들지 않습니다.

이는 지표를 세 종류로 묶습니다. **참조 없는 MOS** 추정기 — UTMOS, DNSMOS, NISQA, SIGMOS — 는 비교할 깨끗한 참조 없이도 사람 청취 패널이 클립에 줄 1~5점의 자연스러움 평가인 **평균 의견 점수(MOS)** 를 예측합니다. **침습적 지표** — STOI(단기 객관적 명료도), SI-SDR(스케일 불변 신호-왜곡비), MCD(멜-켑스트럼 왜곡) — 는 일치하는 깨끗한 참조가 필요하며 출력이 그것에 얼마나 가까운지를 측정합니다. **ASR 기반 텍스트 지표** — WER(단어 오류율)와 CER(문자 오류율) — 는 출력에 음성 인식기를 돌려 전사를 예상 텍스트와 비교함으로써, 모델이 그럴듯하게 들리지만 틀린 말을 하는 경우를 잡아냅니다.

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

이는 엔진 선택을 청취 테스트에서 표 하나로 바꿉니다. `voiceclonnx`는 자신의 열 개 복제 엔진에 대해 정확히 그런 비교를 공개합니다 — 원본 전사에 대한 WER과 각각에 대한 별도의 화자 유사도 점수 — 그래서 "facodec은 WER 0%를 낸다"거나 "lscodec은 WER을 희생해 더 강한 음색 전이를 얻는다" 같은 말은 인상이 아니라 측정된 주장입니다. 이를 언어와 녹음 환경 전반에 걸쳐 곱하면 수동 비교는 더 이상 현실적이지 않게 되며, 객관적인 지표야말로 열 개짜리 엔진 레지스트리를 압도적이지 않고 쓸모 있게 만드는 것입니다.

## 이것이 유용한 곳

오프라인 음성 처리가 필요하다면 — 녹음을 정리하거나, 목소리를 복제하거나, 누가 말하고 있는지 감지하거나, 합성하는 작업을 GPU를 결코 보지 못할 하드웨어에서 해야 한다면 — 찾아야 할 형태는 이렇습니다: 작은 런타임 의존성, 하나로 고정된 기본값 대신 공개된 모델들 중에서의 선택, 그리고 실제로 여러분의 사례에 무엇이 통하는지 측정하는 방법. 위의 모든 라이브러리는 `pip install` 한 번이면 되고, 코드 수준에서는 MIT 또는 Apache 라이선스이며(개별 모델 가중치는 엔진별로 문서화된 각자의 업스트림 라이선스를 따릅니다), 노트북, 서버, 라즈베리 파이에서 동일하게 동작합니다.

[/contact](/ko/contact)를 통해 문의하시거나 [/services](/ko/services)에서 저희가 만드는 다른 것들을 확인해 보십시오.

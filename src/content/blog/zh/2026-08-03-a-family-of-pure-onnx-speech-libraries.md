---
title: "一族纯 ONNX 语音库"
description: "TigreGótico 维护着一组语音库——带宽扩展、声音克隆、说话人嵌入、VAD、词重音、音素化、TTS，以及一个为它们全部打分的指标库——它们共用同一条运行时规则：只依赖 onnxruntime 和 numpy，不需要 PyTorch，也不需要 GPU。"
date: 2026-08-01
lang: zh
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

ONNX 是训练好的神经网络的一种文件格式：权重与计算图被冻结下来，不依赖训练它所用的框架。一个导出为 ONNX 的模型可以通过 **ONNX Runtime** 运行——这是一个小巧的推理引擎，除了执行那张计算图之外什么都不做。它不知道模型是怎么训练的，不支持训练，也不需要安装 PyTorch 或 TensorFlow。

我们的多个库都恪守同一条规则：在运行时，唯一的依赖就是 `onnxruntime` 和 `numpy`。不是"大体上"——导入这个包本身绝不会带进来一个训练框架。`audiosronnx`（带宽扩展与降噪）、`voiceclonnx`（声音克隆）、`speakeronnx`（说话人嵌入）、`speechonnxmetrics`（评估）、`stressonnx`（词重音）、`vadonnx`（语音活动检测）和 `phoonnx`（音素化与文本转语音）全都遵循这条规则，各自作为独立的 PyPI 包发布。另外两个，`phoonnx.js` 和 `precise-onnx-js`，则在浏览器中用 `onnxruntime-web` 实现了同样的理念。

## 为什么要这么讲究

发布一个语音模型最直白的做法，是把训练框架也留着用于推理。这在开发阶段很方便，到了生产环境却是个负担。

- **安装体积。** 一套 PyTorch + CUDA 装完，动辄就是数 GB，而这时你还一个模型都没加载呢。`onnxruntime` 和 `numpy` 加在一起只有几十 MB。
- **不用折腾 CUDA。** 让 GPU 驱动、CUDA 工具包版本和框架构建版本互相匹配，是反复出现的故障源。纯 CPU 的 ONNX Runtime 完全绕开了这一点，而在有 GPU 可用的地方，同一张计算图照样能跑在 GPU 上。
- **在朴素的硬件上也能跑。** 一台树莓派或一台十年前的笔记本电脑能舒舒服服地跑 `onnxruntime`；它通常跑不动一整套 PyTorch 技术栈达到可用的速度，甚至在 32 位或内存受限的板卡上根本装不上。
- **一份产物，处处能用。** 同一个 `.onnx` 文件在 Linux、macOS、Windows 上原样运行——通过 `onnxruntime-web`，还能在浏览器标签页里运行。不需要为每个目标单独做一次导出。
- **训练与推理不再有版本冲突。** 训练技术栈需要钉死特定的框架和 CUDA 版本；推理技术栈则想要尽可能小、尽可能稳定的一套依赖。把两者分开，意味着升级其中一个不会弄坏另一个。

## 这要付出什么代价

这个约束是真实存在的，而且并非没有代价。

**你无法在进程内做微调。** 一张 ONNX 计算图没有优化器，也没有反向传播。以上这些库无一例外都把模型当作固定的产物：加载它们，运行它们。训练或微调另外进行，用原始框架完成，之后再把结果导出为 ONNX。`stressonnx` 和 `speechonnxmetrics` 都保留了一个可选的 `export` 附加项，专门为了这一次性的离线转换步骤才拉入 `torch`——推理时绝不会用到它。

**不是每种架构都能干净地导出。** 动态控制流、自定义 CUDA 内核，或是没有 ONNX 对应算子的操作，都可能挡住一次直截了当的导出。`audiosronnx` 的 README 直接记录了这一点：它维护着一份[未收录清单](https://github.com/TigreGotico/audiosronnx)，列出它评估过但拒绝收录的模型及其原因，而不是假装每个研究模型都能顺利移植过来。

**预处理必须手工重新实现。** 像 PyTorch 或 Kaldi 这样的框架，自带经过测试的快速实现：STFT（把波形变成频谱图）、mel 滤波器组特征、重采样。一旦模型本身不再依赖那个框架，它的预处理也不能依赖——`speakeronnx` 正是为此用纯 NumPy 重新实现了一个 80 频带的对数 mel 滤波器组，`audiosronnx` 对 STFT 和重采样也是同样做法。这是更多需要做对的代码，而且需要针对原始实现做自己的一致性测试。

## 一项任务，多个引擎，一套接口

训练好的语音模型会因语言、录音条件和目标领域而有巨大差异。一个在干净朗读语音上训练的说话人验证模型，可能在电话录音上就失灵了。一个针对英语音色迁移调优的声音克隆模型，在声调语言上可能会丢失可懂度。没有哪个模型能在所有场景下都赢，所以事先押注单一模型只是一种猜测。

这个库族中的每一个库都只挑一项任务，并把若干个独立发布的模型封装在同一个接口背后，因此切换引擎只是改一行代码，而不是重写。

`audiosronnx` 把它的两项工作——降噪与带宽扩展（把一段窄带录音，比如 8 kHz 的电话音频，变成听感更饱满、采样率更高的信号）——拆分到两个加载器背后，各自由若干引擎支撑：

```python
from audiosronnx import load_denoise, load_sr

clean, rate = load_denoise("dpdfnet").denoise("noisy_call.wav")   # remove noise
wide, _ = load_sr("lavasr").upscale(clean, rate)                  # extend to 48 kHz
```

`load_denoise` 目前注册了十个降噪器（`dpdfnet`、`mossformer2`、`frcrn`、`mpsenet`、`gtcrn`、`cmgan`、`metadenoiser`、`mossformergan`、`voicefixer`、`deepfilternet`），体积从 0.54 MB 到 415 MB 不等，许可各不相同。`load_sr` 注册了七个带宽扩展器（`lavasr`、`novasr`、`flowhigh`、`hifiganbwe`、`apbwe`、`sidon`、`callenhancer`）。那些在各项指标上都被别的引擎超越的模型，依然留在注册表里，这样一份已发布的基准测试结果就能随时按需复现。

`voiceclonnx` 对声音克隆采用了同样的做法——把一段现有录音中的声音，转换成听起来像另一位参考说话人的声音，而不经过文本：

```python
from voiceclonnx import VoiceCloner

cloner = VoiceCloner(engine="facodec")
out = cloner.clone_voice("source.wav", "reference.wav", "out.wav")
```

它注册了十个引擎（`facodec`、`openvoice`、`chatterbox`、`triaan`、`cosyvoice`、`bicodec`、`knnvc`、`focalcodec`、`lscodec`、`rvc`），横跨六个不同的模型家族——kNN 特征替换、因式分解编解码器、流匹配、音色迁移、自回归编解码语言模型，以及说话人解耦编解码器。每一个背后都附带已发布的可懂度和说话人相似度数值，因此选择一个引擎是一次比较，而不是抛硬币。

`vadonnx` 把这一模式用在语音活动检测上——判断一段音频流中哪些部分究竟包含语音：

```python
from vadonnx import load_vad

vad = load_vad("silero")
segments = vad.get_speech_segments(audio, sample_rate=16000)
# -> [SpeechSegment(start=0.32, end=2.27), SpeechSegment(start=3.27, end=4.45), ...]
```

它注册了六个模型家族（`silero`、`marblenet`、`pyannote`、`fsmn`、`speechbrain`、`ten`），一个声明式的 `IOSignature` 让一个通用引擎就能驱动其中大多数，或者指向任意自定义的 `.onnx` VAD 文件。

`speakeronnx` 提取一个 **说话人嵌入**——一个固定长度的向量，概括的是"谁在说话"，与"说了什么"无关——并通过余弦相似度比较两个嵌入，判断两段音频是否来自同一说话人：

```python
from speakeronnx import SpeakerEmbedder, cosine

embedder = SpeakerEmbedder(model="wespeaker-resnet34")
alice1 = embedder.embed("alice_clip1.wav")
alice2 = embedder.embed("alice_clip2.wav")
print(cosine(alice1, alice2))   # e.g. 0.82 - same speaker
```

它在四个架构家族（WeSpeaker、CAM++、ERes2Net、ReDimNet）中注册了九个模型，附带已发布的嵌入维度和许可证信息。

`stressonnx` 为文本转语音前端挑选词重音——一个词的哪个音节承载重音，这是很多语言在书写中并不标出的信息（俄语的 *за́мок*，城堡，与 *замо́к*，锁，字母完全相同）。它为俄语注册了一个神经网络流水线，为乌克兰语和白俄罗斯语注册了第二个，并为另外 26 种语言注册了一个完全不做神经推理的规则加词表后端：

```python
from stressonnx import stress

stress("старинный замок стоит на горе", "ru")
# 'стари́нный за́мок сто́ит на горе́'
```

`phoonnx` 对文本进行音素化（把拼写出的词变成 TTS 模型消费的声音单元），并驱动跨 17 个已注册的合成引擎和从多个生态系统（原生 phoonnx、Piper、Mimic3、Coqui、MMS、Transformers）导出的语音的文本转语音：

```python
import wave
from phoonnx.voice import TTSVoice

voice = TTSVoice.load("model.onnx", "model.json")
with wave.open("hello.wav", "wb") as wav_file:
    voice.synthesize_wav("Hello world!", wav_file)
```

`phoonnx.js` 把同样的分词器路径带进了浏览器，用的是 `onnxruntime-web`；`precise-onnx-js` 则把唤醒词检测（MFCC 特征提取加一个 ONNX 分类器，兼容 Mycroft Precise 模型）移植到了 JavaScript——两者都无需服务器：

```ts
import { loadVoice, synthesizeWav } from "phoonnx";
import { getVoice } from "phoonnx/voices";

const voice = await loadVoice(getVoice("phoonnx_eu-ES_dii_unicode")!);
const blob = await synthesizeWav(voice, "Kaixo mundua!");
```

`audiosronnx`（18 个已发布模型）和 `voiceclonnx`（10 个已发布模型）的权重，作为独立的下载项存放在 [TigreGótico 的 Hugging Face 组织](https://huggingface.co/TigreGotico)中，首次使用时获取并在本地缓存，因此换一个引擎只是改一处配置，而不是重新部署。

## 闭环最后一步：评判引擎，而非猜测

把许多引擎注册在同一套接口背后，只有在你能判断哪一个对你的输入真正更好时才有意义。这正是 `speechonnxmetrics` 存在的原因：一个建立在同样的 `numpy` + `onnxruntime` 约束之上的指标库，因此给一个模型打分不需要额外安装任何东西。

它把指标分成三类。**无参考 MOS** 估计器——UTMOS、DNSMOS、NISQA、SIGMOS——预测一个 **平均意见得分（Mean Opinion Score）**，即一个人类听众小组会给一段音频打出的 1 到 5 分的自然度评分，而无需一个干净的参考对象来比较。**侵入式指标**——STOI（短时客观可懂度）、SI-SDR（尺度不变信噪失真比）、MCD（mel 倒谱失真）——需要一个匹配的干净参考对象，衡量输出与它有多接近。**基于 ASR 的文本指标**——WER（词错误率）和 CER（字符错误率）——对输出跑一次语音识别，把转录文本与预期文本比较，从而捕捉那些听起来还不错、但说错了词的模型输出。

```python
import speechonnxmetrics as s

print(s.score("degraded.wav", ["utmos"]))
# -> {'utmos': 4.41...}

print(s.score("clone_output.wav", ["stoi", "mcd", "si_sdr"], ref="source.wav"))
# -> {'stoi': 0.662..., 'mcd': 10.459..., 'si_sdr': -26.937...}
```

这把引擎选择从一次听感测试变成了一张表格。`voiceclonnx` 恰恰为它的十个克隆引擎发布了这样的比较——对照源转录文本的 WER，加上各自单独的说话人相似度分数，因此"facodec 的 WER 是 0%"或"lscodec 用 WER 换来了更强的音色迁移"是经过测量的结论，而不是印象。把这乘以不同的语言和录音条件，人工比较就不再现实；一个客观指标，正是让一个十引擎的注册表变得可用、而非令人不知所措的关键。

## 这在哪里派上用场

如果你需要在一台永远不会配 GPU 的硬件上做离线语音处理——清理一段录音、克隆一个声音、判断谁在说话，或是合成一段语音——这就是该寻找的形态：一个很小的运行时依赖、一份已发布模型可供选择而非单一固定默认值，以及一种衡量哪个真正适合你场景的方法。以上每一个库都只需 `pip install` 一下，代码层面采用 MIT 或 Apache 许可（各模型权重携带各自的上游许可证，按引擎逐一记录），并且在笔记本电脑、服务器或树莓派上运行方式完全一样。

通过 [/zh/contact](/zh/contact) 联系我们，或到 [/zh/services](/zh/services) 看看我们还在构建什么。

/**
 * In-browser phoonnx (VITS) TTS: download an ONNX voice from HuggingFace and
 * synthesize client-side with onnxruntime-web. No server, no API.
 *
 * Two tokenizer paths (see the Miro/Dii voices):
 *  - "unicode": NFD-normalize, per-codepoint phoneme_id_map lookup. No phonemizer.
 *  - "espeak":  espeak-ng (WASM) -> IPA phonemes -> phoneme_id_map (piper format).
 */
import * as ort from "onnxruntime-web";

// onnxruntime wasm assets from a CDN (keeps the build light; works on static
// hosting). Single-threaded so we don't need COOP/COEP / SharedArrayBuffer.
const ORT_VERSION = "1.20.1";
ort.env.wasm.wasmPaths = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
ort.env.wasm.numThreads = 1;

const HF = "https://huggingface.co";

export interface VoiceEntry {
  id: string;
  repo: string;
  voice: string;
  lang: string;
  langLabel: string;
  phonemeType: "unicode" | "espeak";
  onnx: string;
  config: string;
  piperConfig: string | null;
  espeakVoice: string | null;
  sampleRate: number;
  sampleText: string;
  haCompatible: boolean;
}

interface VoiceConfig {
  phoneme_id_map: Record<string, number | number[]>;
  inference?: { noise_scale?: number; length_scale?: number; noise_w?: number };
  audio?: { sample_rate?: number };
  sample_rate?: number;
}

export interface LoadedVoice {
  entry: VoiceEntry;
  session: ort.InferenceSession;
  config: VoiceConfig;
  idMap: Record<string, number>;
  sampleRate: number;
  provider: string;
}

const url = (repo: string, file: string) => `${HF}/${repo}/resolve/main/${file}`;

/** Fetch with Cache Storage + progress callback (bytes). */
async function fetchCached(
  u: string,
  onProgress?: (received: number, total: number) => void,
): Promise<ArrayBuffer> {
  const cache = "caches" in self ? await caches.open("phoonnx-voices") : null;
  if (cache) {
    const hit = await cache.match(u);
    if (hit) return hit.arrayBuffer();
  }
  const resp = await fetch(u);
  if (!resp.ok) throw new Error(`download failed (${resp.status}): ${u}`);
  const total = Number(resp.headers.get("content-length")) || 0;
  if (resp.body && onProgress) {
    const reader = resp.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress(received, total);
    }
    const buf = new Uint8Array(received);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.length; }
    if (cache) await cache.put(u, new Response(buf, { headers: resp.headers }));
    return buf.buffer;
  }
  const buf = await resp.arrayBuffer();
  if (cache) await cache.put(u, new Response(buf));
  return buf;
}

/** Normalize a phoneme_id_map (piper uses [id], phoonnx uses id) to char->int. */
function flattenIdMap(m: Record<string, number | number[]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(m)) out[k] = Array.isArray(v) ? v[0] : v;
  return out;
}

export async function loadVoice(
  entry: VoiceEntry,
  onProgress?: (frac: number, label: string) => void,
): Promise<LoadedVoice> {
  const cfgBuf = await fetchCached(url(entry.repo, entry.config));
  const config: VoiceConfig = JSON.parse(new TextDecoder().decode(cfgBuf));
  const onnxBuf = await fetchCached(url(entry.repo, entry.onnx), (r, t) =>
    onProgress?.(t ? r / t : 0, `downloading model ${(r / 1e6).toFixed(1)} MB`),
  );
  onProgress?.(1, "initializing");

  let session: ort.InferenceSession;
  let provider = "wasm";
  try {
    session = await ort.InferenceSession.create(onnxBuf, {
      executionProviders: ["webgpu"],
    });
    provider = "webgpu";
  } catch {
    session = await ort.InferenceSession.create(onnxBuf, {
      executionProviders: ["wasm"],
    });
  }
  return {
    entry,
    session,
    config,
    idMap: flattenIdMap(config.phoneme_id_map),
    sampleRate: config.audio?.sample_rate || config.sample_rate || entry.sampleRate,
    provider,
  };
}

// Python string.punctuation — phoonnx's UnicodeCodepointPhonemizer strips these
// before tokenizing (see phonemizers/base.py remove_punctuation).
const PUNCT = new Set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~");

/**
 * Unicode tokenizer — validated to reproduce phoonnx exactly:
 * strip punctuation, NFD-normalize (splits accents into combining codepoints),
 * per-codepoint id lookup (skip unknowns), intersperse blank(0), wrap BOS(^)/EOS($).
 */
export function tokenizeUnicode(text: string, idMap: Record<string, number>): number[] {
  const blank = idMap["_"] ?? 0;
  const bos = idMap["^"] ?? 1;
  const eos = idMap["$"] ?? 2;
  let cleaned = "";
  for (const ch of text) if (!PUNCT.has(ch)) cleaned += ch;
  const tokens: number[] = [];
  for (const ch of Array.from(cleaned.trim().normalize("NFD"))) {
    if (ch in idMap) tokens.push(idMap[ch]);
  }
  const seq: number[] = [bos, blank];
  for (const t of tokens) seq.push(t, blank);
  seq.push(eos);
  return seq;
}

/** Encode mono float32 [-1,1] samples to a 16-bit PCM WAV blob. */
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const wstr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  wstr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  wstr(8, "WAVE");
  wstr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  wstr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function synthesize(voice: LoadedVoice, text: string): Promise<Blob> {
  let ids: number[];
  if (voice.entry.phonemeType === "unicode") {
    ids = tokenizeUnicode(text, voice.idMap);
  } else {
    const { tokenizeEspeak } = await import("./espeak");
    ids = await tokenizeEspeak(text, voice);
  }
  if (ids.length <= 3) throw new Error("nothing to synthesize for this text");

  const inf = voice.config.inference || {};
  const scales = Float32Array.from([
    inf.noise_scale ?? 0.667,
    inf.length_scale ?? 1.0,
    inf.noise_w ?? 0.8,
  ]);
  const feeds: Record<string, ort.Tensor> = {
    input: new ort.Tensor("int64", BigInt64Array.from(ids, BigInt), [1, ids.length]),
    input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new ort.Tensor("float32", scales, [3]),
  };
  // only pass inputs the model actually declares
  const wanted = new Set(voice.session.inputNames);
  for (const k of Object.keys(feeds)) if (!wanted.has(k)) delete feeds[k];

  const results = await voice.session.run(feeds);
  const out = results[voice.session.outputNames[0]];
  const audio = out.data as Float32Array;
  return encodeWav(audio, voice.sampleRate);
}

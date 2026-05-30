/**
 * espeak-ng phonemization (WASM) for the piper / Home-Assistant-compatible
 * voices. Text -> IPA (via espeak-ng) -> per-codepoint phoneme_id_map lookup,
 * the same tokenization phoonnx uses for espeak voices.
 */
// @ts-expect-error — emscripten module, ships no types
import espeakFactory from "espeak-ng";
// Vite resolves the wasm to a served URL.
import espeakWasmUrl from "espeak-ng/dist/espeak-ng.wasm?url";
import type { LoadedVoice } from "./phoonnx-tts";

const PUNCT = new Set("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~");

/** Run espeak-ng with --ipa and capture its phoneme output. */
async function textToIpa(text: string, voice: string): Promise<string> {
  const lines: string[] = [];
  await espeakFactory({
    arguments: ["-q", "--ipa", "-v", voice, text],
    print: (s: string) => lines.push(s),
    printErr: () => {},
    locateFile: (path: string) =>
      path.endsWith(".wasm") ? espeakWasmUrl : path,
  });
  return lines.join("\n");
}

export async function tokenizeEspeak(text: string, voice: LoadedVoice): Promise<number[]> {
  const espeakVoice = voice.entry.espeakVoice;
  if (!espeakVoice) throw new Error("this voice has no espeak language configured");

  let cleaned = "";
  for (const ch of text) if (!PUNCT.has(ch)) cleaned += ch;
  const ipa = await textToIpa(cleaned.trim(), espeakVoice);

  const { idMap } = voice;
  const blank = idMap["_"] ?? 0;
  const bos = idMap["^"] ?? 1;
  const eos = idMap["$"] ?? 2;
  const tokens: number[] = [];
  for (const ch of Array.from(ipa.normalize("NFD"))) {
    if (ch in idMap) tokens.push(idMap[ch]);
  }
  const seq: number[] = [bos, blank];
  for (const t of tokens) seq.push(t, blank);
  seq.push(eos);
  return seq;
}

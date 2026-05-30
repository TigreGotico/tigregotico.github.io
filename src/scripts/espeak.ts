/**
 * espeak-ng phonemization for the piper/Home-Assistant-compatible voices.
 * Filled in by the espeak-ng WASM integration; until then, espeak voices are
 * gated in the UI.
 */
import type { LoadedVoice } from "./phoonnx-tts";

export async function tokenizeEspeak(_text: string, _voice: LoadedVoice): Promise<number[]> {
  throw new Error(
    "espeak voices (Home Assistant compatible) are loading shortly — pick a Unicode voice for now.",
  );
}

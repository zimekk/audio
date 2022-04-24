import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Tone from "tone";
import { Subject } from "rxjs";
import Keyboard from "./Keyboard";
import Roll from "./Roll";

import type { Sampler } from "tone";
import type { Note } from "@tonejs/midi/dist/note";

// https://github.com/nbrosowsky/tonejs-instruments/blob/master/Tonejs-Instruments.js#L126
const SAMPLES = {
  "bass-electric": {
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    "A#4": "As4.[mp3|ogg]",
    "A#5": "As5.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    "C#5": "Cs5.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    E5: "E5.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    G5: "G5.[mp3|ogg]",
  },

  bassoon: {
    A3: "A3.[mp3|ogg]",
    C2: "C2.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    G1: "G1.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    A1: "A1.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
  },

  cello: {
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "G#3": "Gs3.[mp3|ogg]",
    "G#4": "Gs4.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    "A#4": "As4.[mp3|ogg]",
    B2: "B2.[mp3|ogg]",
    B3: "B3.[mp3|ogg]",
    B4: "B4.[mp3|ogg]",
    C2: "C2.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
  },

  clarinet: {
    D3: "D3.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    D5: "D5.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    "F#5": "Fs5.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    "A#4": "As4.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
  },

  contrabass: {
    C1: "C1.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
    D1: "D1.[mp3|ogg]",
    E1: "E1.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    "F#0": "Fs0.[mp3|ogg]",
    "F#1": "Fs1.[mp3|ogg]",
    G0: "G0.[mp3|ogg]",
    "G#1": "Gs1.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    A1: "A1.[mp3|ogg]",
    "A#0": "As0.[mp3|ogg]",
    B2: "B2.[mp3|ogg]",
  },

  flute: {
    A5: "A5.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    C6: "C6.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    E5: "E5.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
  },

  "french-horn": {
    D2: "D2.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    "D#1": "Ds1.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    G1: "G1.[mp3|ogg]",
    A0: "A0.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    C1: "C1.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
  },

  "guitar-acoustic": {
    F3: "F3.[mp3|ogg]",
    "F#1": "Fs1.[mp3|ogg]",
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    G1: "G1.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    "G#1": "Gs1.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "G#3": "Gs3.[mp3|ogg]",
    A1: "A1.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    "A#1": "As1.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    B1: "B1.[mp3|ogg]",
    B2: "B2.[mp3|ogg]",
    B3: "B3.[mp3|ogg]",
    C2: "C2.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    D1: "D1.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    "D#1": "Ds1.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    E1: "E1.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    F1: "F1.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
  },

  "guitar-electric": {
    "D#3": "Ds3.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    "D#5": "Ds5.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    "F#5": "Fs5.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    A5: "A5.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    C6: "C6.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
  },

  "guitar-nylon": {
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    "F#5": "Fs5.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G5: "G3.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "G#4": "Gs4.[mp3|ogg]",
    "G#5": "Gs5.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    A5: "A5.[mp3|ogg]",
    "A#5": "As5.[mp3|ogg]",
    B1: "B1.[mp3|ogg]",
    B2: "B2.[mp3|ogg]",
    B3: "B3.[mp3|ogg]",
    B4: "B4.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    "C#5": "Cs5.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    D5: "D5.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    E5: "E5.[mp3|ogg]",
  },

  harmonium: {
    C2: "C2.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    "C#5": "Cs5.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    D5: "D5.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "G#3": "Gs3.[mp3|ogg]",
    "G#4": "Gs4.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    "A#4": "As4.[mp3|ogg]",
  },

  harp: {
    C5: "C5.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    D6: "D6.[mp3|ogg]",
    D7: "D7.[mp3|ogg]",
    E1: "E1.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E5: "E5.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    F6: "F6.[mp3|ogg]",
    F7: "F7.[mp3|ogg]",
    G1: "G1.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G5: "G5.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    A6: "A6.[mp3|ogg]",
    B1: "B1.[mp3|ogg]",
    B3: "B3.[mp3|ogg]",
    B5: "B5.[mp3|ogg]",
    B6: "B6.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
  },

  organ: {
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    C6: "C6.[mp3|ogg]",
    "D#1": "Ds1.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    "D#5": "Ds5.[mp3|ogg]",
    "F#1": "Fs1.[mp3|ogg]",
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    "F#5": "Fs5.[mp3|ogg]",
    A1: "A1.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    A5: "A5.[mp3|ogg]",
    C1: "C1.[mp3|ogg]",
    C2: "C2.[mp3|ogg]",
  },

  piano: {
    A0: "A0.[mp3|ogg]",
    A1: "A1.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    A5: "A5.[mp3|ogg]",
    A6: "A6.[mp3|ogg]",
    "A#0": "As0.[mp3|ogg]",
    "A#1": "As1.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    "A#4": "As4.[mp3|ogg]",
    "A#5": "As5.[mp3|ogg]",
    "A#6": "As6.[mp3|ogg]",
    B0: "B0.[mp3|ogg]",
    B1: "B1.[mp3|ogg]",
    B2: "B2.[mp3|ogg]",
    B3: "B3.[mp3|ogg]",
    B4: "B4.[mp3|ogg]",
    B5: "B5.[mp3|ogg]",
    B6: "B6.[mp3|ogg]",
    C0: "C0.[mp3|ogg]",
    C1: "C1.[mp3|ogg]",
    C2: "C2.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    C6: "C6.[mp3|ogg]",
    C7: "C7.[mp3|ogg]",
    "C#0": "Cs0.[mp3|ogg]",
    "C#1": "Cs1.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    "C#5": "Cs5.[mp3|ogg]",
    "C#6": "Cs6.[mp3|ogg]",
    D0: "D0.[mp3|ogg]",
    D1: "D1.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    D5: "D5.[mp3|ogg]",
    D6: "D6.[mp3|ogg]",
    "D#0": "Ds0.[mp3|ogg]",
    "D#1": "Ds1.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    "D#4": "Ds4.[mp3|ogg]",
    "D#5": "Ds5.[mp3|ogg]",
    "D#6": "Ds6.[mp3|ogg]",
    E0: "E0.[mp3|ogg]",
    E1: "E1.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    E5: "E5.[mp3|ogg]",
    E6: "E6.[mp3|ogg]",
    F0: "F0.[mp3|ogg]",
    F1: "F1.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    F5: "F5.[mp3|ogg]",
    F6: "F6.[mp3|ogg]",
    "F#0": "Fs0.[mp3|ogg]",
    "F#1": "Fs1.[mp3|ogg]",
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    "F#5": "Fs5.[mp3|ogg]",
    "F#6": "Fs6.[mp3|ogg]",
    G0: "G0.[mp3|ogg]",
    G1: "G1.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    G5: "G5.[mp3|ogg]",
    G6: "G6.[mp3|ogg]",
    "G#0": "Gs0.[mp3|ogg]",
    "G#1": "Gs1.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "G#3": "Gs3.[mp3|ogg]",
    "G#4": "Gs4.[mp3|ogg]",
    "G#5": "Gs5.[mp3|ogg]",
    "G#6": "Gs6.[mp3|ogg]",
  },

  saxophone: {
    "D#4": "Ds4.[mp3|ogg]",
    E2: "E2.[mp3|ogg]",
    E3: "E3.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    "F#2": "Fs2.[mp3|ogg]",
    "F#3": "Fs3.[mp3|ogg]",
    "F#4": "Fs4.[mp3|ogg]",
    G2: "G2.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "G#3": "Gs3.[mp3|ogg]",
    "G#4": "Gs4.[mp3|ogg]",
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    B2: "B2.[mp3|ogg]",
    B3: "B3.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    "C#2": "Cs2.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    "C#4": "Cs4.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
  },

  trombone: {
    "A#2": "As2.[mp3|ogg]",
    C2: "C2.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
    "C#1": "Cs1.[mp3|ogg]",
    "C#3": "Cs3.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    "D#1": "Ds1.[mp3|ogg]",
    "D#2": "Ds2.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    F1: "F1.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    "G#1": "Gs1.[mp3|ogg]",
    "G#2": "Gs2.[mp3|ogg]",
    "A#0": "As0.[mp3|ogg]",
    "A#1": "As1.[mp3|ogg]",
  },

  trumpet: {
    C5: "C5.[mp3|ogg]",
    D4: "D4.[mp3|ogg]",
    "D#3": "Ds3.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    F3: "F3.[mp3|ogg]",
    F4: "F4.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    A2: "A2.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    "A#3": "As3.[mp3|ogg]",
    C3: "C3.[mp3|ogg]",
  },

  tuba: {
    "A#1": "As1.[mp3|ogg]",
    "A#2": "As2.[mp3|ogg]",
    D2: "D2.[mp3|ogg]",
    D3: "D3.[mp3|ogg]",
    "D#1": "Ds1.[mp3|ogg]",
    F0: "F0.[mp3|ogg]",
    F1: "F1.[mp3|ogg]",
    F2: "F2.[mp3|ogg]",
    "A#0": "As0.[mp3|ogg]",
  },

  violin: {
    A3: "A3.[mp3|ogg]",
    A4: "A4.[mp3|ogg]",
    A5: "A5.[mp3|ogg]",
    A6: "A6.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    C6: "C6.[mp3|ogg]",
    C7: "C7.[mp3|ogg]",
    E4: "E4.[mp3|ogg]",
    E5: "E5.[mp3|ogg]",
    E6: "E6.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    G5: "G5.[mp3|ogg]",
    G6: "G6.[mp3|ogg]",
  },

  xylophone: {
    C7: "C7.[mp3|ogg]",
    G3: "G3.[mp3|ogg]",
    G4: "G4.[mp3|ogg]",
    G5: "G5.[mp3|ogg]",
    G6: "G6.[mp3|ogg]",
    C4: "C4.[mp3|ogg]",
    C5: "C5.[mp3|ogg]",
    C6: "C6.[mp3|ogg]",
  },
};

// https://github.com/Tonejs/Tone.js/blob/dev/examples/monoSynth.html
const usePiano = (instrument: keyof typeof SAMPLES) => {
  const [synth, setSynth] = useState<Sampler | null>(null);

  useEffect(() => {
    const synth = new Tone.Sampler({
      baseUrl: `https://nbrosowsky.github.io/tonejs-instruments/samples/${instrument}/`,
      urls: Object.entries(SAMPLES[instrument]).reduce(
        (samples, [key, value]) =>
          Object.assign(samples, {
            [key]: value.replace("[mp3|ogg]", "mp3"),
          }),
        {}
      ),
      release: 1,
      onload: () => {
        // synth.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
        setSynth(synth);
      },
    }).toDestination();
  }, [instrument]);

  return synth;
};

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/piano.ts
export default function Piano() {
  const notes$ = useMemo(() => new Subject<Note[]>(), []);
  const [pressed, setPressed] = useState<string[]>(() => []);
  const [instrument, setInstrument] =
    useState<keyof typeof SAMPLES>("guitar-nylon");
  const synth = usePiano(instrument);

  const keyDown = useCallback(
    (note: string) => synth.triggerAttack(note),
    [synth]
  );
  const keyUp = useCallback(
    (note: string) => synth.triggerRelease(note),
    [synth]
  );

  useEffect(() => {
    const subscription = notes$.subscribe((notes) =>
      ((now) =>
        notes.forEach((note) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            now,
            note.velocity
          );
          Tone.Draw.schedule(() => {
            setPressed((pressed) => pressed.concat(note.name));
          }, now);
          Tone.Draw.schedule(() => {
            setPressed((pressed) =>
              pressed.filter((name) => name !== note.name)
            );
          }, now + note.duration);
        }))(Tone.now())
    );
    return () => subscription.unsubscribe();
  }, [notes$, synth, setPressed]);

  return (
    <div>
      Piano
      <select
        value={instrument}
        onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
          ({ target }) => setInstrument(target.value as keyof typeof SAMPLES),
          []
        )}
      >
        {Object.keys(SAMPLES).map((name, i) => (
          <option key={i} value={name}>
            {name}
          </option>
        ))}
      </select>
      <Roll notes$={notes$} />
      {synth && <Keyboard keyDown={keyDown} keyUp={keyUp} pressed={pressed} />}
      {/* <a href="#">https://musiclab.chromeexperiments.com/Shared-Piano/</a> */}
      {/* <div id="wrapper">
        <piano-banner></piano-banner>
        <header>
          {" "}
          <a
            id="back-button"
            aria-label="Go back to Chrome Music Lab"
            href="https://musiclab.chromeexperiments.com/"
          >
            {" "}
            <svg
              width="20"
              height="20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.333 8.833H5.135l6.522-6.521L10 .667.667 10 10 19.333l1.645-1.645-6.51-6.521h14.198V8.832z"
                fill="#666"
              ></path>
            </svg>{" "}
          </a>
          <piano-logo></piano-logo>
          <div id="header-config">
            <piano-button
              style="display:inline-flex"
              link="/Shared-Piano/"
              label="shared_piano_header_new-room_label"
              aria-label="Start a new room"
            >
              {" "}
              <svg
                width="18"
                height="18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style="margin-right:10px"
                display="block"
              >
                <path
                  d="M17.666 10.083h-7.583v7.584H7.916v-7.584H.333V7.917h7.583V.333h2.167v7.584h7.583v2.166z"
                  fill="currentColor"
                ></path>
              </svg>{" "}
            </piano-button>
            <piano-about></piano-about>
            <piano-mute></piano-mute>
            <piano-sounds></piano-sounds>
          </div>
        </header>
        <piano-full-room></piano-full-room>
        <piano-warning></piano-warning>
        <piano-jumpstart></piano-jumpstart>
        <div id="piano">
          <piano-input></piano-input>
          <piano-roll
            octaves="6"
            rootoctave="2"
            triggerline="380"
            padding="0"
          ></piano-roll>
          <piano-keyboard
            octaves="6"
            rootoctave="2"
            octave-count="4"
          ></piano-keyboard>
        </div>
        <save-chip></save-chip>
        <footer>
          <copresence-info></copresence-info>
          <div id="footer-config">
            <piano-instrument-selector></piano-instrument-selector>
            <div id="action-buttons">
              <piano-clear></piano-clear>
              <piano-settings style="--settings-height:65vh;"></piano-settings>
              <piano-share style="display:none;"></piano-share>
              <piano-save></piano-save>
            </div>
          </div>
        </footer>
      </div> */}
    </div>
  );
}

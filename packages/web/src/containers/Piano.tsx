import React, { useState } from "react";
import * as Tone from "tone";
import styles from "./Piano.module.scss";

// https://github.com/Tonejs/Tone.js/blob/dev/examples/monoSynth.html
const usePiano = () => {
  const [synth] = useState(() =>
    new Tone.PolySynth(Tone.MonoSynth, {
      volume: -8,
      oscillator: {
        type: "square8",
      },
      envelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
      },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.7,
        sustain: 0.1,
        release: 0.8,
        baseFrequency: 300,
        octaves: 4,
      },
    }).toDestination()
  );

  return synth;
};

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/note.ts
function Note({ note, color, synth }) {
  return (
    <button
      className={styles.Note}
      style={{ background: color, color: color === "black" ? "#ccc" : "black" }}
      onMouseDown={(e) => synth.triggerAttack(note)}
      onMouseUp={(e) => synth.triggerRelease(note)}
    >
      {note}
    </button>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/octave.ts
function Octave({ octave = 1, synth }) {
  const startNote = 12 * octave;
  const whiteNotes = [0, 2, 4, 5, 7, 9, 11].map((i) => i + startNote);
  const blackNotes = [0, 1, 3, 0, 6, 8, 10, 0].map((i) => {
    if (i) {
      return i + startNote;
    } else {
      return 0;
    }
  });
  return (
    <div className={styles.Octave}>
      <div className={styles.WhiteNotes}>
        {whiteNotes
          .map((note) => Tone.Midi(note).toNote())
          .map((note, key) => (
            <Note key={key} color="#aaa" note={note} synth={synth} />
          ))}
      </div>
      <div className={styles.BlackNotes}>
        {blackNotes
          .map((note) => Tone.Midi(note).toNote())
          .map((note, key) => (
            <Note key={key} color="black" note={note} synth={synth} />
          ))}
      </div>
    </div>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/keyboard.ts
function Keyboard({ rootoctave = 4, octaves = 4, synth }) {
  return (
    <div className={styles.Keyboard}>
      {[...Array(octaves)]
        .map((n, octave) => octave + rootoctave)
        .map((octave, key) => (
          <Octave key={key} octave={octave} synth={synth} />
        ))}
    </div>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/piano.ts
export default function () {
  const synth = usePiano();
  return (
    <div>
      Piano
      <Keyboard synth={synth} />
    </div>
  );
}

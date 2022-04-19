import React, { KeyboardEventHandler, useEffect } from "react";
import * as Tone from "tone";
import styles from "./styles.module.scss";

const keys = Object.entries({
  C5: "a",
  "C#5": "w",
  D5: "s",
  "D#5": "e",
  E5: "d",
  F5: "f",
  "F#5": "t",
  G5: "g",
  "G#5": "y",
  A5: "h",
  "A#5": "u",
  B5: "j",
  C6: "k",
  "C#6": "o",
  D6: "l",
  "D#6": "p",
  E6: ";",
  F6: "'",
}).reduce(
  (notes, [note, key]) =>
    Object.assign(notes, {
      [Tone.Midi(note).transpose(-24).toNote()]: key,
    }),
  {}
);

const useKeyboard = (keyDown, keyUp) => {
  const notes = Object.entries(keys).reduce(
    (notes, [note, key]) =>
      Object.assign(notes, {
        [{
          ";": "Semicolon",
          "'": "Quote",
        }[key] || `Key${key.toUpperCase()}`]: note,
      }),
    {}
  );

  useEffect(() => {
    const handleKeyDown: KeyboardEventHandler = (e) =>
      notes[e.code] && keyDown(notes[e.code]);
    const handleKeyUp: KeyboardEventHandler = (e) =>
      notes[e.code] && keyUp(notes[e.code]);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyDown, keyUp]);
};

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/note.ts
function Note({ note, color, keyDown, keyUp }) {
  // console.log({ note, synth });
  return note ? (
    <button
      className={styles.Note}
      style={{ background: color, color: color === "black" ? "#ccc" : "black" }}
      onMouseDown={(e) => keyDown(note)}
      onMouseUp={(e) => keyUp(note)}
    >
      {keys[note] && <i>{keys[note]}</i>}
      {note}
    </button>
  ) : (
    <span className={styles.Space}></span>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/octave.ts
function Octave({ octave = 1, keyDown, keyUp }) {
  const startNote = 12 * octave;
  const whiteNotes = [0, 2, 4, 5, 7, 9, 11].map((i) => i + startNote);
  const blackNotes = [0, 1, 3, 0, 6, 8, 10, 0].map((i) =>
    i ? i + startNote : 0
  );
  return (
    <div className={styles.Octave}>
      <div className={styles.WhiteNotes}>
        {whiteNotes
          .map((note) => Tone.Midi(note).toNote())
          .map((note, key) => (
            <Note
              key={key}
              color="white"
              note={note}
              keyDown={keyDown}
              keyUp={keyUp}
            />
          ))}
      </div>
      <div className={styles.BlackNotes}>
        {blackNotes
          .map((note) => note && Tone.Midi(note).toNote())
          .map((note, key) => (
            <Note
              key={key}
              color="black"
              note={note}
              keyDown={keyDown}
              keyUp={keyUp}
            />
          ))}
      </div>
    </div>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/keyboard.ts
export default function Keyboard({
  rootoctave = 4,
  octaves = 4,
  keyDown,
  keyUp,
}) {
  useKeyboard(keyDown, keyUp);

  return (
    <div className={styles.Keyboard}>
      {[...Array(octaves)]
        .map((_, octave) => octave + rootoctave)
        .map((octave, key) => (
          <Octave key={key} octave={octave} keyDown={keyDown} keyUp={keyUp} />
        ))}
    </div>
  );
}

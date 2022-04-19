import React, {
  KeyboardEventHandler,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Tone from "tone";
import cx from "classnames";
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

const useKeyboard = () => {
  const [pressed, setPressed] = useState(() => []);
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
      notes[e.code] && setPressed((pressed) => pressed.concat(notes[e.code]));
    const handleKeyUp: KeyboardEventHandler = (e) =>
      notes[e.code] &&
      setPressed((pressed) => pressed.filter((note) => note !== notes[e.code]));
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [setPressed]);

  return pressed;
};

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/note.ts
function Note({ note, keyDown, keyUp, pressed }) {
  const [{ enter, press }, setState] = useState({
    enter: false,
    press: false,
  });
  const state = useMemo(
    () => pressed || (enter && press),
    [enter, press, pressed]
  );

  useEffect(() => (state ? keyDown(note) : keyUp(note)), [state]);

  // console.log({ note, enter, press, state });

  return note ? (
    <span
      className={cx(styles.Note, state && styles.pressed)}
      onMouseEnter={(e) =>
        setState((state) => ({
          ...state,
          enter: true,
          press: e.buttons ? true : false,
        }))
      }
      onMouseLeave={() => setState((state) => ({ ...state, enter: false }))}
      onMouseDown={(e) => (
        e.preventDefault(), setState((state) => ({ ...state, press: true }))
      )}
      onMouseUp={() => setState((state) => ({ ...state, press: false }))}
    >
      {keys[note] && <i>{keys[note]}</i>}
      {note}
    </span>
  ) : (
    <span className={styles.Space}></span>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/octave.ts
function Octave({ octave = 1, keys, keyDown, keyUp }) {
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
              note={note}
              keyDown={keyDown}
              keyUp={keyUp}
              pressed={keys.includes(note)}
            />
          ))}
      </div>
      <div className={styles.BlackNotes}>
        {blackNotes
          .map((note) => note && Tone.Midi(note).toNote())
          .map((note, key) => (
            <Note
              key={key}
              note={note}
              keyDown={keyDown}
              keyUp={keyUp}
              pressed={keys.includes(note)}
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
  const keys = useKeyboard();

  return (
    <div className={styles.Keyboard}>
      {[...Array(octaves)]
        .map((_, octave) => octave + rootoctave)
        .map((octave, key) => (
          <Octave
            key={key}
            octave={octave}
            keys={keys}
            keyDown={keyDown}
            keyUp={keyUp}
          />
        ))}
    </div>
  );
}

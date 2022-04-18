import React, {
  UIEventHandler,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEventHandler,
} from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { Observable, Subject, of } from "rxjs";
import {
  expand,
  filter,
  map,
  pairwise,
  share,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { createAsset } from "use-asset";
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

// https://github.com/Tonejs/Tone.js/blob/dev/examples/monoSynth.html
const usePiano = () => {
  const [synth] = useState(
    () =>
      new Tone.Sampler({
        urls: {
          A0: "A0.mp3",
          C1: "C1.mp3",
          "D#1": "Ds1.mp3",
          "F#1": "Fs1.mp3",
          A1: "A1.mp3",
          C2: "C2.mp3",
          "D#2": "Ds2.mp3",
          "F#2": "Fs2.mp3",
          A2: "A2.mp3",
          C3: "C3.mp3",
          "D#3": "Ds3.mp3",
          "F#3": "Fs3.mp3",
          A3: "A3.mp3",
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
          C5: "C5.mp3",
          "D#5": "Ds5.mp3",
          "F#5": "Fs5.mp3",
          A5: "A5.mp3",
          C6: "C6.mp3",
          "D#6": "Ds6.mp3",
          "F#6": "Fs6.mp3",
          A6: "A6.mp3",
          C7: "C7.mp3",
          "D#7": "Ds7.mp3",
          "F#7": "Fs7.mp3",
          A7: "A7.mp3",
          C8: "C8.mp3",
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
          // synth.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
        },
      }).toDestination()
    // new Tone.PolySynth(Tone.MonoSynth, {
    //   volume: -8,
    //   oscillator: {
    //     type: "square8",
    //   },
    //   envelope: {
    //     attack: 0.05,
    //     decay: 0.3,
    //     sustain: 0.4,
    //     release: 0.8,
    //   },
    //   filterEnvelope: {
    //     attack: 0.001,
    //     decay: 0.7,
    //     sustain: 0.1,
    //     release: 0.8,
    //     baseFrequency: 300,
    //     octaves: 4,
    //   },
    // }).toDestination()
  );

  return synth;
};

const asset = createAsset(async () => {
  // https://freemidi.org/request-detail-1730
  return await Midi.fromUrl(
    // require("../../assets/midi/BillieEilish-Notimetodie.mid")
    // require("../../assets/midi/BillieEilish-Badguy.mid")
    require("../../assets/midi/Coldplay_-_Hymn_for_the_Weekend.mid").default
  );
});

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/note.ts
function Note({ note, color, synth }) {
  // console.log({ note, synth });
  return note ? (
    <button
      className={styles.Note}
      style={{ background: color, color: color === "black" ? "#ccc" : "black" }}
      onMouseDown={(e) => synth.triggerAttack(note)}
      onMouseUp={(e) => synth.triggerRelease(note)}
    >
      {keys[note] && <i>{keys[note]}</i>}
      {note}
    </button>
  ) : (
    <span className={styles.Space}></span>
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
            <Note key={key} color="white" note={note} synth={synth} />
          ))}
      </div>
      <div className={styles.BlackNotes}>
        {blackNotes
          .map((note) => note && Tone.Midi(note).toNote())
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
        .map((_, octave) => octave + rootoctave)
        .map((octave, key) => (
          <Octave key={key} octave={octave} synth={synth} />
        ))}
    </div>
  );
}

interface IFrameData {
  frameStartTime: number;
  deltaTime: number;
}

// https://www.learnrxjs.io/learn-rxjs/recipes/gameloop
const calculateStep: (prevFrame: IFrameData) => Observable<IFrameData> = (
  prevFrame: IFrameData
) => {
  return Observable.create((observer) => {
    requestAnimationFrame((frameStartTime) => {
      // Millis to seconds
      const deltaTime = prevFrame
        ? (frameStartTime - prevFrame.frameStartTime) / 1000
        : 0;
      observer.next({
        frameStartTime,
        deltaTime,
      });
    });
  });
};

const positionNote = (n: number, m = 12) =>
  n + ((k) => (k - (k % m)) / m)(n + 7) + ((k) => (k - (k % m)) / m)(n);

function RollNote({ note, synth }) {
  return (
    <button
      className={cx(styles.RollNote, note.name.match(/#/) && styles.sharp)}
      style={{
        position: "absolute",
        top: `${(note.ticks - note.durationTicks) / 10}px`,
        left: `${positionNote(note.midi - 48)}em`,
        height: `${note.durationTicks / 10}px`,
      }}
      onMouseDown={(e) => (
        e.preventDefault(),
        ((now) =>
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            now,
            note.velocity
          ))(Tone.now())
      )}
    >
      <span>{note.name}</span>
    </button>
  );
}

function Roll({ synth }) {
  const { name, duration, durationTicks, tracks } = asset.read();
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rollRef = useRef<HTMLDivElement>(null);
  const player$ = useMemo(() => new Subject<any>(), []);
  const scroll$ = useMemo(() => new Subject<any>(), []);
  const frames$ = useMemo(
    () =>
      of(undefined).pipe(
        expand((val) => calculateStep(val)),
        // Expand emits the first value provided to it, and in this
        //  case we just want to ignore the undefined input frame
        filter((frame) => frame !== undefined),
        map((frame: IFrameData) => frame.deltaTime),
        // bufferCount(5),
        share()
      ),
    []
  );

  console.log({ name, duration, tracks });

  const { notes } = useMemo(() => tracks[track], [tracks, track]);

  // console.log({notes})

  useEffect(() => {
    const subscription = frames$
      .pipe(
        withLatestFrom(player$),
        filter(([_, value]) => value)
      )
      .subscribe(() => {
        if (rollRef.current) {
          const target = rollRef.current;
          // console.log(target.scrollTop, target.scrollHeight, target.offsetHeight)
          if (target.scrollTop > 0) {
            target.scrollTop -= 2;
          } else {
            player$.next(false);
          }
        }
      });
    return () => subscription.unsubscribe();
  }, [frames$]);

  useEffect(() => {
    const subscription = scroll$
      .pipe(
        map((target) => target.scrollTop),
        pairwise(),
        map(([curr, prev]) =>
          notes.filter((note) =>
            ((that) => prev <= that && that < curr)(note.ticks / 10)
          )
        )
      )
      .subscribe((notes) =>
        ((now) =>
          notes.forEach((note) =>
            synth.triggerAttackRelease(
              note.name,
              note.duration,
              now,
              note.velocity
            )
          ))(Tone.now())
      );
    return () => subscription.unsubscribe();
  }, [scroll$]);

  useEffect(() => {
    const subscription = player$.subscribe((player) => {
      const target = rollRef.current;
      if (player && target && target.scrollTop === 0) {
        target.scrollTop = target.scrollHeight;
      }
      setPlaying(player);
    });
    return () => subscription.unsubscribe();
  }, [player$]);

  // console.log({ notes });

  return (
    <div>
      <fieldset>
        <label>
          <span>Track</span>
          <select
            value={track}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) => setTrack(Number(target.value)),
              []
            )}
          >
            {tracks.map(({ name }, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {playing ? (
          <button onClick={(e) => (e.stopPropagation(), player$.next(false))}>
            stop
          </button>
        ) : (
          <button onClick={(e) => (e.stopPropagation(), player$.next(true))}>
            play
          </button>
        )}
      </fieldset>
      <div
        ref={rollRef}
        className={styles.Roll}
        onScroll={useCallback<UIEventHandler<HTMLDivElement>>(
          ({ target }) => scroll$.next(target),
          []
        )}
      >
        <div
          className={styles.Inner}
          style={{
            height: `${durationTicks / 10}px`,
          }}
        >
          {notes.map((note, key) => (
            <RollNote key={key} note={note} synth={synth} />
          ))}
        </div>
      </div>
    </div>
  );
}

const useKeyboard = (synth) => {
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
      notes[e.code] && synth.triggerAttack(notes[e.code]);
    const handleKeyUp: KeyboardEventHandler = (e) =>
      notes[e.code] && synth.triggerRelease(notes[e.code]);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
};

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/piano.ts
export default function Piano() {
  const synth = usePiano();

  useKeyboard(synth);

  return (
    <div>
      Piano
      <Roll synth={synth} />
      <Keyboard synth={synth} />
      <div>
        <a href="#">https://musiclab.chromeexperiments.com/Shared-Piano/</a>
        <a href="#">
          https://github.com/Monika-After-Story/MonikaModDev/issues/5712
        </a>
        {/* <pre>{JSON.stringify(song, null, 2)}</pre> */}
      </div>
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

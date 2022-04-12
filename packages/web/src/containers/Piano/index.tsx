import React, {
  UIEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Tone from "tone";
import { Observable, Subject, of } from "rxjs";
import { expand, filter, map, share, withLatestFrom } from "rxjs/operators";
import styles from "./styles.module.scss";

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
  console.log({ note, synth });
  return note ? (
    <button
      className={styles.Note}
      style={{ background: color, color: color === "black" ? "#ccc" : "black" }}
      onMouseDown={(e) => synth.triggerAttack(note)}
      onMouseUp={(e) => synth.triggerRelease(note)}
    >
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
            <Note key={key} color="#aaa" note={note} synth={synth} />
          ))}
      </div>
      <div className={styles.BlackNotes}>
        {blackNotes
          // .filter(Boolean)
          .map(
            (note) =>
              Boolean(console.log({ note })) ||
              (note && Tone.Midi(note).toNote())
          )
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

function Roll({ notes }: { notes: string[] }) {
  const [playing, setPlaying] = useState(false);
  const rollRef = useRef<HTMLDivElement>(null);
  const player$ = useMemo(() => new Subject<any>(), []);
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
            target.scrollTop -= 1;
          }
        }
      });
    return () => subscription.unsubscribe();
  }, [frames$]);

  useEffect(() => {
    const subscription = player$.subscribe((player) => {
      setPlaying(player);
    });
    return () => subscription.unsubscribe();
  }, [player$]);

  return (
    <div>
      {playing ? (
        <button onClick={(e) => (e.stopPropagation(), player$.next(false))}>
          stop
        </button>
      ) : (
        <button onClick={(e) => (e.stopPropagation(), player$.next(true))}>
          play
        </button>
      )}
      <div
        ref={rollRef}
        className={styles.Roll}
        onScroll={useCallback<UIEventHandler<HTMLDivElement>>(
          ({ target }) =>
            console.log(
              target.scrollTop,
              target.scrollHeight,
              target.offsetHeight
            ),
          []
        )}
      >
        <div className={styles.Inner}>
          {notes
            .map((note) => note.replace(/(\d)SH/, "#$1"))
            .map((note, i) => (
              <div
                key={i}
                className={styles.RollNote}
                style={{
                  left: `${Tone.Midi(note).toMidi() - 48}em`,
                }}
              >
                <span alt={Tone.Midi(note).toMidi()}>{note}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/piano.ts
export default function () {
  const synth = usePiano();
  const song = {
    name: "Home",
    verse_list: [0, 10, 20, 30],
    pnm_list: [
      {
        text: "(playing home from undertale)",
        style: "monika_credits_text",
        notes: [
          // "C3",
          // "C4",
          // "C5",
          // "C6",
          // "B6",
          // "C3",
          // "C4",
          // "C5",
          // "C6",
          // "B6",
          "F4",
          "A4SH",
          "C5",
          "D5",
          "A4SH",
          "C5",
          "D5",
          "G4",
          "A4SH",
          "C5",
          "F5",
          "A4SH",
          "C5",
          "D5",
          "A4SH",
          "C5",
          "F5",
          "F4",
          "A4SH",
          "C5",
          "D5",
          "A4SH",
          "C5",
          "D5",
          "G4",
          "A4SH",
          "C5",
          "D5",
          "A4SH",
          "C5",
          "D5",
          "A4",
          "A4SH",
          "C5",
          "F5",
          "A4SH",
          "C5",
          "D5",
        ],
        express: "1eub",
        postexpress: "1eua",
        vis_timeout: 2.0,
        verse: 0,
        posttext: true,
      },
      {
        text: "(Playing home from undertale)",
        style: "monika_credits_text",
        notes: [
          "A4SH",
          "C5",
          "A4SH",
          "F4",
          "A4SH",
          "C5",
          "D5",
          "A4SH",
          "C5",
          "D5",
          "G4",
          "A4SH",
          "C5",
          "D5",
          "A4SH",
          "C5",
          "D5",
          "F4SH",
          "A4SH",
          "C5",
          "D5",
        ],
        postnotes: ["F4SH", "A4SH", "D5", "A4SH", "A4SH", "C5", "A4SH"],
        express: "1eub",
        postexpress: "1eua",
        ev_timeout: 1.0,
      },
    ],
  };
  return (
    <div>
      Piano
      <Roll notes={song.pnm_list[0].notes} />
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
      <Keyboard synth={synth} />
    </div>
  );
}

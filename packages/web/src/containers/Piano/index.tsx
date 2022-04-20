import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as Tone from "tone";
import { Subject } from "rxjs";
import Keyboard from "./Keyboard";
import Roll from "./Roll";

// https://github.com/Tonejs/Tone.js/blob/dev/examples/monoSynth.html
const usePiano = () => {
  const [synth] = useState(() =>
    true
      ? new Tone.Sampler({
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
      : new Tone.PolySynth(Tone.MonoSynth, {
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

// https://github.com/Tonejs/ui/blob/master/src/gui/piano/piano.ts
export default function Piano() {
  const notes$ = useMemo(() => new Subject<any>(), []);
  const [pressed, setPressed] = useState(() => []);
  const synth = usePiano();

  const keyDown = useCallback((note) => synth.triggerAttack(note), [synth]);
  const keyUp = useCallback((note) => synth.triggerRelease(note), [synth]);

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
  }, [notes$, setPressed]);

  return (
    <div>
      Piano
      <Roll notes$={notes$} />
      <Keyboard keyDown={keyDown} keyUp={keyUp} pressed={pressed} />
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

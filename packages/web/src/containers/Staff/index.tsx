import React, { useEffect, useRef, useState } from "react";
import * as mm from "@magenta/music/esm/core.js";
import { NoteSequence } from "@magenta/music/esm/protobuf.js";
import { createAsset } from "use-asset";
import styles from "./styles.module.scss";

const MIDI =
  "https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/twinkle_twinkle.mid";

const music = createAsset(async () => await mm.urlToNoteSequence(MIDI));

function Player() {
  const sequence = music.read();
  const [playing, setPlaying] = useState(false);

  const scoreRef = useRef(null);
  const playerRef = useRef<mm.Player | null>(null);

  const config = {};

  console.log({ sequence });

  useEffect(() => {
    const scoreDiv = scoreRef.current;
    if (scoreDiv) {
      const visualizer = new mm.StaffSVGVisualizer(sequence, scoreDiv, config);
      playerRef.current = new mm.Player(false, {
        run: (note: NoteSequence.INote) => {
          visualizer.redraw(note);
        },
        stop: () => {
          setPlaying(false);
        },
      });
    }
  }, [scoreRef, playerRef, sequence]);

  return (
    <div>
      <div ref={scoreRef}></div>
      {playing ? (
        <button onClick={(e) => (setPlaying(false), playerRef.current?.stop())}>
          stop
        </button>
      ) : (
        <button
          onClick={(e) => (
            setPlaying(true), playerRef.current?.start(sequence, undefined, 0)
          )}
        >
          play
        </button>
      )}
    </div>
  );
}

export default function Section() {
  const [started, setStarted] = useState(false);

  return (
    <section className={styles.Section}>
      <h3>Staff</h3>
      {started ? (
        <Player />
      ) : (
        <button onClick={(e) => (e.preventDefault(), setStarted(true))}>
          start
        </button>
      )}
    </section>
  );
}

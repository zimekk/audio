import React, { useMemo } from "react";
// import Guitar from 'react-guitar'
import { standard } from "react-guitar-tunings";
import useSound from "react-guitar-sound";
import styles from "./styles.module.scss";

function Guitar({
  onPlay,
  onStrum,
  strings,
}: {
  onPlay: Function;
  onStrum: Function;
  strings: number[];
}) {
  return (
    <div>
      <button onClick={(e) => (e.preventDefault(), onStrum())}>down</button>
      <button onClick={(e) => (e.preventDefault(), onStrum(true))}>up</button>
      <ul>
        {strings.map((string, i) => (
          <li key={i}>
            {string}{" "}
            <a href="#" onMouseEnter={(e) => (e.preventDefault(), onPlay(i))}>
              ----------------
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// https://github.com/4lejandrito/react-guitar
function SampleGuitarWithSound() {
  const strings = useMemo(() => [0, 1, 2, 2, 0, -1], []);
  const { play, strum } = useSound({ fretting: strings, tuning: standard });

  return <Guitar strings={strings} onPlay={play} onStrum={strum} />;
}

export default function Section() {
  return (
    <section className={styles.Section}>
      <h3>Guitar</h3>
      <SampleGuitarWithSound />
    </section>
  );
}

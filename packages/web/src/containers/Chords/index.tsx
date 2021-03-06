import React, { ChangeEventHandler, useCallback, useState } from "react";
import Chord from "@tombatossals/react-chords/lib/Chord";
import ChordsDb from "@tombatossals/chords-db/lib/guitar.json";
import { standard } from "react-guitar-tunings";
import useSound from "react-guitar-sound";
import cx from "classnames";
import styles from "./styles.module.scss";

// https://tombatossals.github.io/react-chords/guitar
const MyChord = ({
  chord,
}: {
  chord: {
    frets: number[];
    fingers: number[];
    barres: number[];
    capo: boolean;
  };
}) => {
  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: "Guitar",
    keys: [],
    tunings: {
      standard: ["E", "A", "D", "G", "B", "E"],
    },
  };
  const lite = false; // defaults to false if omitted

  const { play, strum } = useSound({
    fretting: chord.fingers,
    tuning: standard,
  });

  return (
    <div>
      <div className={styles.Guitar}>
        <span onMouseEnter={(e) => strum()} className={styles.Strum}>
          <i>down</i>
        </span>
        <span
          onMouseEnter={(e) => strum(true)}
          className={cx(styles.Strum, styles.Up)}
        >
          <i>up</i>
        </span>
        <span className={styles.Strings}>
          {chord.fingers.map((string, i, strings) => (
            <i key={i} onMouseEnter={(e) => play(strings.length - i - 1)}>
              {string}
            </i>
          ))}
        </span>
      </div>
      <a href="#" onClick={(e) => (e.preventDefault(), strum())}>
        <Chord chord={chord} instrument={instrument} lite={lite} />
      </a>
    </div>
  );
};

console.log({ ChordsDb });

export default function Section() {
  const {
    chords,
  }: {
    chords: Record<
      string,
      {
        key: string;
        suffix: string;
        positions: any[];
      }[]
    >;
  } = ChordsDb;
  const [key, setKey] = useState(() => Object.keys(chords)[0]);
  // const [suffix, setSuffix] = useState(() => chords[key][0].suffix);
  const [chord, setChord] = useState(() => ({
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    barres: [1],
    capo: false,
  }));

  return (
    <section className={styles.Section}>
      <h3>Chords</h3>
      <fieldset>
        <label>
          <span>Key</span>
          <select
            value={key}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) => setKey(target.value),
              []
            )}
          >
            {Object.keys(chords).map((name, i) => (
              <option key={i} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <div className={styles.Columns}>
        <ul className={styles.Chords}>
          {chords[key].map(({ key, suffix, positions }, i) => (
            <li key={i}>
              <strong>{key}</strong>
              {suffix}
              {positions.map((chord, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => (e.preventDefault(), setChord(chord))}
                >
                  {i}
                </a>
              ))}
            </li>
          ))}
        </ul>
        <MyChord chord={chord} />
      </div>
    </section>
  );
}

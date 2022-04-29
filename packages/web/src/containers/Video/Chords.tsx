import React from "react";
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
    ...ChordsDb.main,
    // strings: 6,
    // fretsOnChord: 4,
    // name: "Guitar",
    // keys: [],
    tunings: {
      standard: ["E", "A", "D", "G", "B", "E"],
    },
  };
  const lite = false; // defaults to false if omitted

  const { strum } = useSound({
    fretting: chord.fingers,
    tuning: standard,
  });

  return (
    <div className={styles.Chord} onMouseEnter={(e) => strum()}>
      <Chord chord={chord} instrument={instrument} lite={lite} />
    </div>
  );
};

console.log({ ChordsDb });

// https://github.com/Jozwiaczek/guitar-book/blob/master/gatsby-theme-guitar-book/src/components/chords.js
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

  return (
    <div className={styles.Chords}>
      Em
      <MyChord
        chord={
          chords["E"].find(({ suffix }) => suffix === "minor")?.positions[0]
        }
      />
      C
      <MyChord
        chord={chords["C"].find(({ suffix }) => suffix === "/E")?.positions[0]}
      />
      D
      <MyChord
        chord={
          chords["D"].find(({ suffix }) => suffix === "major")?.positions[0]
        }
      />
      Bm
      <MyChord
        chord={
          chords["B"].find(({ suffix }) => suffix === "minor")?.positions[0]
        }
      />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import useSound from "use-sound";
import cx from "classnames";
import { Waveform } from "./Waveform";
import styles from "./styles.module.scss";

// https://github.com/goldfire/howler.js/tree/master/examples/player/audio
const track = require("./assets/running_out.mp3").default;
// const track = require("./assets/running_out.webm").default;

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const [play, { sound, stop }] = useSound(track);

  useEffect(() => {
    if (sound) {
      sound.on("play", () => setIsPlaying(true));
      sound.on("stop", () => setIsPlaying(false));
      sound.on("end", () => setIsPlaying(false));
      const interval = setInterval(
        () =>
          setProgress(sound.duration() ? sound.seek() / sound.duration() : 0),
        1000
      );
      return () => {
        clearInterval(interval);
        sound.off("play");
        sound.off("stop");
        sound.off("end");
        sound.unload();
      };
    }
  }, [setIsPlaying, sound]);

  return (
    <div className={styles.Player}>
      Player{" "}
      <div className={styles.Container}>
        {isPlaying ? (
          <button
            onClick={(e) => stop()}
            className={cx(styles.Button, styles.Button__Stop)}
          >
            Stop
          </button>
        ) : (
          <button
            onClick={(e) => play()}
            className={cx(styles.Button, styles.Button__Play)}
          >
            Play
          </button>
        )}
        <Waveform src={track} progress={progress} />
      </div>
    </div>
  );
}

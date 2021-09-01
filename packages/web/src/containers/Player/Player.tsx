import React, { useEffect, useState } from "react";
import useSound from "use-sound";
import styles from "./styles.module.scss";

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);

  const [play, { sound, stop }] = useSound(
    require("./assets/running_out.webm").default
  );

  useEffect(() => {
    if (sound) {
      sound.on("play", () => setIsPlaying(true));
      sound.on("stop", () => setIsPlaying(false));
      const interval = setInterval(
        () => console.log({ seek: sound.seek() }),
        1000
      );
      return () => {
        clearInterval(interval);
        sound.off("play");
        sound.off("stop");
        sound.unload();
      };
    }
  }, [setIsPlaying, sound]);

  return (
    <div className={styles.Player}>
      Player{" "}
      {isPlaying ? (
        <button onClick={(e) => stop()}>Stop</button>
      ) : (
        <button onClick={(e) => play()}>Play</button>
      )}
    </div>
  );
}

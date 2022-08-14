import React, { useEffect, useRef, useState } from "react";
import YouTubePlayer from "youtube-player";
import styles from "./styles.module.scss";

export default function Player({ id }: { id: string }) {
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (playerRef.current) {
      const player = YouTubePlayer(playerRef.current, {
        videoId: id,
      });

      player.on("ready", function () {
        console.log("Player1 is ready.");
      });

      const updateProgress = async () => {
        setProgress(
          (100 * (await player.getCurrentTime())) / (await player.getDuration())
        );
      };

      player.on("stateChange", function (event) {
        updateProgress();

        if (event.data === 1) {
          interval = setInterval(updateProgress, 1000);
        } else if ([0, 2].includes(event.data)) {
          clearInterval(interval);
        }
      });
    }
    return () => {
      clearInterval(interval);
    };
  }, [playerRef, setProgress]);

  return (
    <div>
      <div ref={playerRef}></div>
      <div className={styles.Progress}>
        <i
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

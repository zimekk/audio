import React, { useEffect, useRef, useState } from "react";
import { decodeAudioData } from "standardized-audio-context";
import Spectro from "spectrogram";
import chroma from "chroma-js";
import styles from "./styles.module.scss";

const AudioContext = window.AudioContext || window.webkitAudioContext;

export function Spectrogram({ src, progress }) {
  const [state, setState] = useState("");
  const canvasRef = useRef(null);
  const spectroRef = useRef(null);

  useEffect(() => {
    const nativeAudioContext = new AudioContext();

    const spectro = (spectroRef.current = Spectro(canvasRef.current, {
      audio: {
        enable: true,
      },
      colors: (steps) => {
        const baseColors = [
          [0, 0, 255, 1],
          [0, 255, 255, 1],
          [0, 255, 0, 1],
          [255, 255, 0, 1],
          [255, 0, 0, 1],
        ];
        const positions = [0, 0.15, 0.3, 0.5, 0.75];

        const scale = new chroma.scale(baseColors, positions).domain([
          0,
          steps,
        ]);

        const colors = [];

        for (let i = 0; i < steps; ++i) {
          const color = scale(i);
          colors.push(color.hex());
        }

        return colors;
      },
    }));

    Object.assign(window, { spectro });

    fetch(src)
      .then((response) => response.arrayBuffer())
      // https://stackoverflow.com/questions/66450267/webaudioapi-decodeaudiodata-giving-null-error-on-ios-14-safari
      .then((arrayBuffer) => decodeAudioData(nativeAudioContext, arrayBuffer))
      // https://dzone.com/articles/exploring-html5-web-audio
      .then((audioBuffer) => {
        spectro.connectSource(audioBuffer, nativeAudioContext);
        console.log({ spectro });
        // spectro.start();
      })
      .catch(console.error);
  }, [src]);

  useEffect(() => {
    switch (state) {
      case "playing":
        spectroRef.current[spectroRef.current._paused ? "resume" : "start"]();
        break;
      case "paused":
        spectroRef.current.pause();
        break;
    }
  }, [state]);

  return (
    <div className={styles.Spectrogram}>
      {
        {
          [""]: <button onClick={() => setState("playing")}>Play</button>,
          ["playing"]: (
            <button onClick={() => setState("paused")}>Pause</button>
          ),
          ["paused"]: (
            <button onClick={() => setState("playing")}>Resume</button>
          ),
        }[state]
      }
      <div
        className={styles.Progress}
        style={{ width: `${100 * progress}%` }}
      ></div>
      <canvas ref={canvasRef} id="canvas" />
    </div>
  );
}

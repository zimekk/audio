import React, { useCallback, useEffect, useRef, useState } from "react";
import { decodeAudioData } from "standardized-audio-context";
import Spectro from "spectrogram";
import chroma from "chroma-js";
import styles from "./styles.module.scss";

const AudioContext = window.AudioContext || window.webkitAudioContext;

// https://github.com/tensorflow/tfjs-models/blob/b5d49c0f5ba2057cc29b40317126c5f182495f96/speech-commands/demo/ui.js#L91
export async function plotSpectrogram(
  canvas,
  frequencyData,
  fftSize,
  fftDisplaySize,
  config
) {
  if (fftDisplaySize == null) {
    fftDisplaySize = fftSize;
  }
  if (config == null) {
    config = {};
  }

  // Get the maximum and minimum.
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < frequencyData.length; ++i) {
    const x = frequencyData[i];
    if (x !== -Infinity) {
      if (x < min) {
        min = x;
      }
      if (x > max) {
        max = x;
      }
    }
  }
  if (min >= max) {
    return;
  }

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  const numFrames = frequencyData.length / fftSize;
  if (config.pixelsPerFrame != null) {
    let realWidth = Math.round(config.pixelsPerFrame * numFrames);
    if (config.maxPixelWidth != null && realWidth > config.maxPixelWidth) {
      realWidth = config.maxPixelWidth;
    }
    canvas.width = realWidth;
  }

  const pixelWidth = canvas.width / numFrames;
  const pixelHeight = canvas.height / fftDisplaySize;
  for (let i = 0; i < numFrames; ++i) {
    const x = pixelWidth * i;
    const spectrum = frequencyData.subarray(i * fftSize, (i + 1) * fftSize);
    if (spectrum[0] === -Infinity) {
      break;
    }
    for (let j = 0; j < fftDisplaySize; ++j) {
      const y = canvas.height - (j + 1) * pixelHeight;

      let colorValue = (spectrum[j] - min) / (max - min);
      colorValue = Math.pow(colorValue, 3);
      colorValue = Math.round(255 * colorValue);
      const fillStyle = `rgb(${colorValue},${255 - colorValue},${
        255 - colorValue
      })`;
      context.fillStyle = fillStyle;
      context.fillRect(x, y, pixelWidth, pixelHeight);
    }
  }

  if (config.markKeyFrame) {
    const keyFrameIndex =
      config.keyFrameIndex == null
        ? await SpeechCommands.getMaxIntensityFrameIndex({
            data: frequencyData,
            frameSize: fftSize,
          }).data()
        : config.keyFrameIndex;
    // Draw lines to mark the maximum-intensity frame.
    context.strokeStyle = "black";
    context.beginPath();
    context.moveTo(pixelWidth * keyFrameIndex, 0);
    context.lineTo(pixelWidth * keyFrameIndex, canvas.height * 0.1);
    context.stroke();
    context.beginPath();
    context.moveTo(pixelWidth * keyFrameIndex, canvas.height * 0.9);
    context.lineTo(pixelWidth * keyFrameIndex, canvas.height);
    context.stroke();
  }
}

export function Spectrogram({ src, progress }) {
  const [state, setState] = useState("");
  const [data, setData] = useState(null);
  const [frameSize, setFrameSize] = useState(100);
  const [frameSize2, setFrameSize2] = useState(100);
  const [duration, setDuration] = useState(2);
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
        // console.log({ spectro });
        // spectro.start();
        setData(audioBuffer.getChannelData(0));
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

  useEffect(() => {
    if (data) {
      const audioBuffer = { sampleRate: 44100, duration: 120, length: 5292000 };
      // plotSpectrogram(canvasRef.current, data.slice(0, audioBuffer.sampleRate*Number(duration)/10), Number(frameSize), Number(frameSize2), {pixelsPerFrame: 2});
      plotSpectrogram(
        canvasRef.current,
        data.slice(0, (audioBuffer.sampleRate * Number(duration)) / 10),
        Number(frameSize)
      );
    }
  }, [data, frameSize, frameSize2, duration]);

  return (
    <div className={styles.Spectrogram}>
      <div>
        <input
          type="range"
          min={10}
          max={1000}
          value={frameSize}
          onChange={({ target }) => setFrameSize(target.value)}
        />{" "}
        {frameSize}
        <input
          type="range"
          min={10}
          max={1000}
          value={frameSize2}
          onChange={({ target }) => setFrameSize2(target.value)}
        />{" "}
        {frameSize2}
        <input
          type="range"
          min={1}
          max={120}
          value={duration}
          onChange={({ target }) => setDuration(target.value)}
        />{" "}
        {duration}
      </div>
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
      <div id="word-div"></div>
    </div>
  );
}

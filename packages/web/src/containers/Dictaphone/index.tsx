import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "classnames";
import styles from "./styles.module.scss";

interface SoundClipType {
  name: string | null;
  blob: Blob;
}

// https://github.com/mdn/dom-examples/tree/main/media/web-dictaphone
function Dictaphone() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recording, setRecording] = useState(false);
  const [soundClips, setSoundClips] = useState<SoundClipType[]>([]);

  const handleRecordClick = useCallback(() => {
    if (!mediaRecorder) {
      return;
    }
    mediaRecorder.start();
    console.log(mediaRecorder.state);
    console.log("Recorder started.");
    setRecording(true);
  }, [mediaRecorder]);

  const handleStopClick = useCallback(() => {
    if (!mediaRecorder) {
      return;
    }
    setRecording(false);
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    console.log("Recorder stopped.");
  }, [mediaRecorder]);

  useEffect(() => {
    // Main block for doing the audio recording
    if (navigator.mediaDevices.getUserMedia) {
      console.log("The mediaDevices.getUserMedia() method is supported.");

      const constraints = { audio: true };
      let chunks: BlobEvent["data"][] = [];

      let onSuccess = function (stream: MediaStream) {
        const mediaRecorder = new MediaRecorder(stream);

        setMediaRecorder(mediaRecorder);

        visualize(stream);

        mediaRecorder.onstop = function (e) {
          console.log("Last data to read (after MediaRecorder.stop() called).");

          const name = prompt(
            "Enter a name for your sound clip?",
            "My unnamed clip",
          );

          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });

          setSoundClips((list) =>
            list.concat({
              name,
              blob,
            }),
          );

          chunks = [];
          console.log("recorder stopped");
        };

        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };
      };

      let onError = function (err: Error) {
        console.log("The following error occured: " + err);
      };

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
      console.log("MediaDevices.getUserMedia() not supported on your browser!");
    }

    function visualize(stream: MediaStream) {
      const canvas = canvasRef.current;

      // Visualiser setup - create web audio api context and canvas
      let audioCtx;

      if (!audioCtx) {
        audioCtx = new AudioContext();
      }

      const source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      draw();

      function draw() {
        if (!canvas) {
          return;
        }
        const canvasCtx = canvas.getContext("2d");

        if (!canvasCtx) {
          return;
        }

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "rgb(200, 200, 200)";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = "rgb(0, 0, 0)";

        canvasCtx.beginPath();

        let sliceWidth = (WIDTH * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = dataArray[i] / 128.0;
          let y = (v * HEIGHT) / 2;

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      }
    }
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainSectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    function updateSize() {
      if (canvasRef.current && mainSectionRef.current) {
        canvasRef.current.width = mainSectionRef.current.offsetWidth;
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <section>
      <section className="main-controls" ref={mainSectionRef}>
        <canvas className="visualizer" height="60px" ref={canvasRef}></canvas>
        <div id="buttons">
          <button
            className={cx(styles.Record, recording && styles.Recording)}
            onClick={handleRecordClick}
            disabled={recording}
          >
            Record
          </button>
          <button
            className={styles.Stop}
            onClick={handleStopClick}
            disabled={!recording}
          >
            Stop
          </button>
        </div>
      </section>
      <section className="sound-clips">
        {soundClips.map((clip, index) => (
          <SoundClip
            key={index}
            clip={clip}
            onChangeName={(name: string) =>
              setSoundClips((list) =>
                list.map((item, key) =>
                  key === index ? { ...item, name } : item,
                ),
              )
            }
            onDelete={() =>
              setSoundClips((list) => list.filter((_, key) => key !== index))
            }
          />
        ))}
      </section>
    </section>
  );
}

function SoundClip({
  clip,
  onChangeName,
  onDelete,
}: {
  clip: SoundClipType;
  onChangeName: (name: string) => void;
  onDelete: () => void;
}) {
  const { name, blob } = clip;

  const handleDeleteClick = useCallback(() => {
    onDelete();
  }, []);

  const handleNameClick = useCallback(() => {
    const newClipName = prompt(
      "Enter a new name for your sound clip?",
      name || "",
    );
    if (newClipName) {
      onChangeName(newClipName);
    }
  }, [name]);

  const audioURL = useMemo(() => window.URL.createObjectURL(blob), [blob]);

  return (
    <article className={styles.Clip}>
      <audio src={audioURL} controls />
      <p onClick={handleNameClick}>{name || "My unnamed clip"}</p>
      <button className={styles.Delete} onClick={handleDeleteClick}>
        Delete
      </button>
    </article>
  );
}

export default function Section() {
  return (
    <section className={styles.Section}>
      <h3>Dictaphone</h3>
      <Dictaphone />
    </section>
  );
}

import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WebMidi } from "webmidi";
import * as Tone from "tone";

// https://github.com/Tonejs/Tone.js/blob/dev/examples/sampler.html
const sampler = new Tone.Sampler({
  urls: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// https://webmidijs.org/docs/
export default function Input() {
  const [devices, setDevices] = useState<
    { id: string; manufacturer: string; name: string; type: string }[]
  >([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    // Display available MIDI input devices
    const updateDevices = () =>
      setDevices(
        WebMidi.inputs.map(({ id, manufacturer, name, type }) => ({
          id,
          manufacturer,
          name,
          type,
        }))
      );

    // Function triggered when WebMidi.js is ready
    const onConnect = ({ target, type }: any) => {
      console.log({ target, type });
      updateDevices();
    };

    // Enable WebMidi.js and trigger the onEnabled() function when ready
    WebMidi.addListener("connected", onConnect);
    WebMidi.addListener("disconnected", onConnect);
    WebMidi.enable().then(updateDevices).catch(console.error);

    return () => {
      WebMidi.removeListener("connected", onConnect);
      WebMidi.removeListener("disconnected", onConnect);
    };
  }, []);

  const synth = useMemo(
    () => (input ? WebMidi.getInputById(input) : null),
    [input]
  );

  useEffect(() => {
    if (synth) {
      // Listen to 'note on' events
      const onNote = (e: any) => {
        console.info(e);
        sampler.triggerAttack(`${e.note.name}${e.note.octave}`);
      };
      const onNoteOff = (e: any) => {
        console.info(e);
        sampler.triggerRelease(`${e.note.name}${e.note.octave}`);
      };

      // https://github.com/Tonejs/Tone.js/blob/dev/examples/js/tone-ui.js
      synth.addListener("noteon", onNote);
      synth.addListener("noteoff", onNoteOff);
      return () => {
        synth.removeListener("noteon", onNote);
        synth.removeListener("noteoff", onNoteOff);
      };
    }
  }, [synth]);

  return (
    <div>
      <label>
        <span>midi in:</span>
      </label>
      <select
        value={input}
        onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
          ({ target }) => setInput(target.value),
          []
        )}
      >
        <option value="">none</option>
        {devices.map(({ id, manufacturer, name, type }) => (
          <option key={id} value={id}>
            {manufacturer} {name} ({type})
          </option>
        ))}
      </select>
    </div>
  );
}

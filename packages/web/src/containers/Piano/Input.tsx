import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WebMidi } from "webmidi";

// https://webmidijs.org/docs/
export default function Input({
  keyDown,
  keyUp,
}: {
  keyDown: Function;
  keyUp: Function;
}) {
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
        keyDown(e.note.identifier);
      };
      const onNoteOff = (e: any) => {
        console.info(e);
        keyUp(e.note.identifier);
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

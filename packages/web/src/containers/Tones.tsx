import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

// https://github.com/Tonejs/Tone.js#transport
const useSynth = () => {
  const [synth] = useState(() => {
    Tone.Transport.start();
    return [
      new Tone.FMSynth().toDestination(),
      new Tone.AMSynth().toDestination(),
    ];
  });
  return synth;
};

function Note({ synth, start, tone = "C2" }) {
  const [checked, setChecked] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const loop = new Tone.Loop((time) => {
      if (ref && ref.current && ref.current.checked) {
        synth.triggerAttackRelease(tone, "8n", time);
      }
    }, "1n").start(start);
  }, [ref]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(e) => setChecked((checked) => !checked)}
    />
  );
}

export default function () {
  const synth = useSynth();
  return (
    <div>
      Tones
      {synth.map((synth, key) => (
        <div key={key}>
          {[...Array(16)].map((item, key) => (
            <Note key={key} synth={synth} start={key ? `${key}n` : "0"} />
          ))}
        </div>
      ))}
    </div>
  );
}

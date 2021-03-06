import React, { useEffect, useState } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { createAsset } from "use-asset";
import Input from "./Input";
import styles from "./styles.module.scss";

const asset = createAsset(async () => {
  // https://github.com/Tonejs/Midi/raw/master/examples/
  // return await Midi.fromUrl(require('../../assets/midi/bach_846.mid').default)
  // https://www.mididb.com/billie-eilish/bad-guy-midi/
  // return await Midi.fromUrl(require('../../assets/midi/AUD_MB1582.mid').default)
  // https://www.nonstop2k.com/midi-files/14743-billie-eilish-bad-guy-midi.html
  // return await Midi.fromUrl(
  //   require("../../assets/midi/Billie-Eilish-Bad-Guy-Anonymous-20220216212718-nonstop2k.com.mid")
  //     .default
  // );
  // https://www.nonstop2k.com/midi-files/17501-nintendo-super-mario-bros-theme-midi.html
  // return await Midi.fromUrl(
  //   require("../../assets/midi/Nintendo-Super-Mario-Bros-Theme-Anonymous-20220413125321-nonstop2k.com.mid")
  //     .default
  // );
  // https://www.mididb.com/billie-eilish/everything-i-wanted-midi/
  // return await Midi.fromUrl(
  //   require("../../assets/midi/AUD_MB1608.mid")
  //     .default
  // );
  // https://www.midi.com.au/billie-eilish/everything-i-wanted-midi/
  // return await Midi.fromUrl(
  //   require("../../assets/midi/AUD_MB1608.mid")
  //     .default
  // );
  // https://freemidi.org/request-detail-1730
  return await Midi.fromUrl(
    require("../../assets/midi/Coldplay_-_Hymn_for_the_Weekend.mid").default
  );
  // https://freemidi.org/request-detail-2900
  // return await Midi.fromUrl(
  //   require("../../assets/midi/BillieEilish-Badguy.mid")
  //     .default
  // );
  // https://freemidi.org/request-detail-2932
  // return await Midi.fromUrl(
  //   require("../../assets/midi/BillieEilish-Notimetodie.mid")
  //     .default
  // );
});

// https://github.com/Tonejs/Midi
export default function Section() {
  const { name, duration, durationTicks, tracks } = asset.read();
  const [playing, setPlaying] = useState<boolean>(false);
  // const synthsRef = useRef<Tone.PolySynth[]>([]);

  console.log({ name, duration, durationTicks, tracks });

  useEffect(() => {
    // synth playback
    if (playing) {
      const synths: Tone.PolySynth[] = [];
      const now = Tone.now() + 0.5;
      tracks.forEach((track) => {
        // create a synth for each track
        const synth = new Tone.PolySynth(Tone.Synth, {
          // volume: -8,
          // oscillator: {
          //   type: "square8",
          // },
          // envelope: {
          //   attack: 0.05,
          //   decay: 0.3,
          //   sustain: 0.4,
          //   release: 0.8,
          // },
          // filterEnvelope: {
          //   attack: 0.001,
          //   decay: 0.7,
          //   sustain: 0.1,
          //   release: 0.8,
          //   baseFrequency: 300,
          //   octaves: 4,
          // },
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).toDestination();

        synths.push(synth);
        // schedule all of the events
        track.notes.forEach((note) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            note.time + now,
            note.velocity
          );
        });
      });
      return () => {
        // dispose the synth and make a new one
        while (synths.length) {
          const synth = synths.pop();
          if (synth) {
            // https://stackoverflow.com/questions/66590335/tone-js-problems-with-changing-tone-polysynth/71036551#71036551
            synth.context._timeouts.cancel(0);
            synth.dispose();
          }
        }
      };
    }
  }, [playing, tracks]);

  return (
    <div className={styles.Section}>
      <h3>Midi</h3>
      <div>{name}</div>
      <div>
        {playing ? (
          <button onClick={(e) => (e.preventDefault(), setPlaying(false))}>
            Stop
          </button>
        ) : (
          <button onClick={(e) => (e.preventDefault(), setPlaying(true))}>
            Play
          </button>
        )}
      </div>
      <Input />
    </div>
  );
}

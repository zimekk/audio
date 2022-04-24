import React, {
  UIEventHandler,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEventHandler,
} from "react";
import { Observable, Subject, of } from "rxjs";
import {
  expand,
  filter,
  map,
  pairwise,
  share,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { Midi } from "@tonejs/midi";
import { createAsset } from "use-asset";
import cx from "classnames";
import styles from "./styles.module.scss";

import type { Note } from "@tonejs/midi/dist/note";

interface IFrameData {
  frameStartTime: number;
  deltaTime: number;
}

// https://www.learnrxjs.io/learn-rxjs/recipes/gameloop
const calculateStep: (prevFrame: IFrameData) => Observable<IFrameData> = (
  prevFrame: IFrameData
) => {
  return Observable.create((observer) => {
    requestAnimationFrame((frameStartTime) => {
      // Millis to seconds
      const deltaTime = prevFrame
        ? (frameStartTime - prevFrame.frameStartTime) / 1000
        : 0;
      observer.next({
        frameStartTime,
        deltaTime,
      });
    });
  });
};

const positionNote = (n: number, m = 12) =>
  n + ((k) => (k - (k % m)) / m)(n + 7) + ((k) => (k - (k % m)) / m)(n);

const FILES = [
  require("../../assets/midi/Coldplay_-_Hymn_for_the_Weekend.mid").default,
  require("../../assets/midi/BillieEilish-Notimetodie.mid").default,
  require("../../assets/midi/BillieEilish-Badguy.mid").default,
  require("../../assets/midi/bach_846.mid").default,
];

const asset = createAsset(async (file) => {
  try {
    return await Midi.fromUrl(file);
  } catch (e) {
    console.error(e);
    return {
      name: e.message,
      duration: 0,
      durationTicks: 0,
      tracks: [],
    };
  }
});

function RollNote({
  note,
  durationTicks,
  ...props
}: {
  note: Note;
  durationTicks: number;
  onMouseDown?: MouseEventHandler;
}) {
  return (
    <button
      className={cx(styles.RollNote, note.name.match(/#/) && styles.sharp)}
      style={{
        position: "absolute",
        top: `${(durationTicks - note.ticks - note.durationTicks) / 10}px`,
        left: `${positionNote(note.midi - 48)}em`,
        height: `${note.durationTicks / 10}px`,
      }}
      {...props}
    >
      <span>{note.name}</span>
    </button>
  );
}

export default function Roll({ notes$ }: { notes$: Subject<Note[]> }) {
  const [files, setFiles] = useState(() => FILES);
  const [file, setFile] = useState(() => files[0]);
  const { name, duration, durationTicks, tracks } = asset.read(file);
  const [selected, setSelected] = useState(() => [0]);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const speedRef = useRef(speed);
  const rollRef = useRef<HTMLDivElement>(null);
  const player$ = useMemo(() => new Subject<any>(), []);
  const scroll$ = useMemo(() => new Subject<any>(), []);
  const frames$ = useMemo(
    () =>
      of(undefined).pipe(
        expand((val) => calculateStep(val)),
        // Expand emits the first value provided to it, and in this
        //  case we just want to ignore the undefined input frame
        filter((frame) => frame !== undefined),
        map((frame: IFrameData) => frame.deltaTime),
        // bufferCount(5),
        share()
      ),
    []
  );

  console.log({ name, duration, tracks, selected });

  useEffect(() => {
    speedRef.current = speed;
  }, [frames$, speedRef, speed]);

  useEffect(() => {
    const subscription = frames$
      .pipe(
        withLatestFrom(player$),
        filter(([_, value]) => value)
      )
      .subscribe(() => {
        if (rollRef.current) {
          const target = rollRef.current;
          // console.log(target.scrollTop, target.scrollHeight, target.offsetHeight)
          if (target.scrollTop > 0) {
            target.scrollTop -= speedRef.current;
          } else {
            player$.next(false);
          }
        }
      });
    return () => subscription.unsubscribe();
  }, [frames$, speedRef]);

  useEffect(() => {
    const subscription = scroll$
      .pipe(
        map((target) => target.scrollTop),
        pairwise(),
        map(([curr, prev]) =>
          tracks
            .filter((_, i) => selected.includes(i))
            .map(({ notes }) =>
              notes.filter((note) =>
                ((that) => prev <= that && that < curr)(
                  (durationTicks - note.ticks) / 10
                )
              )
            )
            .flat()
        )
      )
      .subscribe((notes) => notes$.next(notes));
    return () => subscription.unsubscribe();
  }, [scroll$, notes$, tracks, selected, durationTicks]);

  useEffect(() => {
    const subscription = player$.subscribe((player) => {
      const target = rollRef.current;
      if (player && target && target.scrollTop === 0) {
        target.scrollTop = target.scrollHeight;
      }
      setPlaying(player);
    });
    return () => subscription.unsubscribe();
  }, [player$]);

  const onChangeTrack = useCallback<ChangeEventHandler<HTMLInputElement>>(
    ({ target }) =>
      setSelected((selected) =>
        Boolean(console.log({ selected, value: target.value })) ||
        target.checked
          ? selected.concat(Number(target.value))
          : selected.filter((i) => i !== Number(target.value))
      ),
    [setSelected]
  );

  return (
    <div>
      <fieldset>
        <div>
          <label>
            <span>Midi</span>
            <select
              value={file}
              onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
                ({ target }) => (setFile(target.value), setSelected([0])),
                []
              )}
            >
              {files.map((name, i) => (
                <option key={i} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={(e) => (
              e.stopPropagation(),
              ((file) =>
                file?.match(/.+$/) &&
                (setFiles((files) => files.concat(file)),
                setFile(file),
                setSelected([0])))(
                prompt(
                  "Midi file URL",
                  "https://www.midiworld.com/download/3731"
                )
              )
            )}
          >
            add
          </button>
        </div>
        <div>
          <span>Track</span>
          {tracks.map(({ name }, i) => (
            <label key={i}>
              <input
                type="checkbox"
                value={i}
                checked={selected.includes(i)}
                onChange={onChangeTrack}
              />
              <span>{`#${i} ${name}`}</span>
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              checked={selected.length === tracks.length}
              onChange={useCallback<ChangeEventHandler<HTMLInputElement>>(
                ({ target }) =>
                  setSelected(target.checked ? tracks.map((_, i) => i) : []),
                [tracks]
              )}
            />
            <strong>toggle all</strong>
          </label>
        </div>
        <div>
          <label>
            <span>Speed</span>
            <select
              value={speed}
              onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
                ({ target }) => setSpeed(Number(target.value)),
                []
              )}
            >
              {[1, 2, 3, 4].map((value, i) => (
                <option key={i} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          {playing ? (
            <button onClick={(e) => (e.stopPropagation(), player$.next(false))}>
              stop
            </button>
          ) : (
            <button onClick={(e) => (e.stopPropagation(), player$.next(true))}>
              play
            </button>
          )}
        </div>
      </fieldset>
      <div
        ref={rollRef}
        className={styles.Roll}
        onScroll={useCallback<UIEventHandler<HTMLDivElement>>(
          ({ target }) => scroll$.next(target),
          []
        )}
      >
        <div
          className={styles.Inner}
          style={{
            height: `${durationTicks / 10}px`,
          }}
        >
          {tracks
            .filter((_, i) => selected.includes(i))
            .map(({ notes }) =>
              notes.map((note, key) => (
                <RollNote
                  key={key}
                  note={note}
                  durationTicks={durationTicks}
                  onMouseDown={(e) => (e.preventDefault(), notes$.next([note]))}
                />
              ))
            )}
        </div>
      </div>
    </div>
  );
}

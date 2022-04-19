import React, {
  UIEventHandler,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

const asset = createAsset(async () => {
  // https://freemidi.org/request-detail-1730
  return await Midi.fromUrl(
    // require("../../assets/midi/BillieEilish-Notimetodie.mid")
    // require("../../assets/midi/BillieEilish-Badguy.mid")
    require("../../assets/midi/Coldplay_-_Hymn_for_the_Weekend.mid").default
    // require("../../assets/midi/bach_846.mid").default
  );
});

function RollNote({ note, notes$ }) {
  return (
    <button
      className={cx(styles.RollNote, note.name.match(/#/) && styles.sharp)}
      style={{
        position: "absolute",
        top: `${(note.ticks - note.durationTicks) / 10}px`,
        left: `${positionNote(note.midi - 48)}em`,
        height: `${note.durationTicks / 10}px`,
      }}
      onMouseDown={(e) => (e.preventDefault(), notes$.next([note]))}
    >
      <span>{note.name}</span>
    </button>
  );
}

export default function Roll({ notes$ }) {
  const { name, duration, durationTicks, tracks } = asset.read();
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
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

  console.log({ name, duration, tracks });

  const { notes } = useMemo(() => tracks[track], [tracks, track]);

  // console.log({notes})

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
            target.scrollTop -= 2;
          } else {
            player$.next(false);
          }
        }
      });
    return () => subscription.unsubscribe();
  }, [frames$]);

  useEffect(() => {
    const subscription = scroll$
      .pipe(
        map((target) => target.scrollTop),
        pairwise(),
        map(([curr, prev]) =>
          notes.filter((note) =>
            ((that) => prev <= that && that < curr)(note.ticks / 10)
          )
        )
      )
      .subscribe((notes) => notes$.next(notes));
    return () => subscription.unsubscribe();
  }, [scroll$, notes$, notes]);

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

  // console.log({ notes });

  return (
    <div>
      <fieldset>
        <label>
          <span>Track</span>
          <select
            value={track}
            onChange={useCallback<ChangeEventHandler<HTMLSelectElement>>(
              ({ target }) => setTrack(Number(target.value)),
              []
            )}
          >
            {tracks.map(({ name }, i) => (
              <option key={i} value={i}>
                {name}
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
          {notes.map((note, key) => (
            <RollNote key={key} note={note} notes$={notes$} />
          ))}
        </div>
      </div>
    </div>
  );
}

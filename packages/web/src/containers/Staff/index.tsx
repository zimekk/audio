import React, { useEffect, useRef } from "react";
import { ScrollType, StaffInfo, StaffSVGRender } from "staffrender";
import styles from "./styles.module.scss";

export default function Section() {
  const scoreRef = useRef(null);

  const config = {
    noteHeight: 15,
    pixelsPerTimeStep: 0,
    instruments: [0],
    defaultKey: 0,
    scrollType: ScrollType.BAR,
  };

  const data: StaffInfo = {
    notes: [
      { start: 0, length: 1, pitch: 69, intensity: 127 },
      { start: 1, length: 1, pitch: 71, intensity: 127 },
      { start: 2, length: 1, pitch: 72, intensity: 127 },
      { start: 3, length: 1, pitch: 74, intensity: 127 },
    ],
  };

  useEffect(() => {
    const scoreDiv = scoreRef.current;
    if (scoreDiv) {
      new StaffSVGRender(data, config, scoreDiv);
    }
  }, [scoreRef, data]);

  return (
    <section className={styles.Section}>
      <h3>Staff</h3>
      <div ref={scoreRef}></div>
    </section>
  );
}

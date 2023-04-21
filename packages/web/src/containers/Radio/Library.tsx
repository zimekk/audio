import React, { useState } from "react";
import { createAsset } from "use-asset";
import { ReactMp3Player } from "./Player";

const listAsset = createAsset(() =>
  fetch("api/stream/library.json").then<string[]>((res) => res.json())
);

function useLibrary() {
  const list = listAsset.read();
  const [src, setSrc] = useState("");

  return {
    src,
    setSrc,
    list: list.map((name) => ({
      name,
      href: `api/stream/${encodeURIComponent(name)}`,
    })),
  };
}

export default function Library() {
  const library = useLibrary();
  return (
    <div>
      <h4>Library</h4>
      <ul>
        {library.list.map(({ name, href }, key) => (
          <li key={key}>
            <a
              href={href}
              onClick={(e) => (e.preventDefault(), library.setSrc(href))}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
      <ReactMp3Player src={library.src} autoPlay controls loop />
    </div>
  );
}

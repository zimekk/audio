import React, { useEffect, useRef, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { Waveform } from "../Player/Waveform";
import { Beats } from "./Beats";
import styles from "./styles.module.scss";

// https://github.com/JMPerez/spotify-web-api-js#usage
const spotifyApi = new SpotifyWebApi();

function Audio({ src: track }) {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef();
  const requestRef = useRef();

  useEffect(() => {
    const audioTag = audioRef.current;

    function updateProgressState() {
      if (audioTag.paused) {
        return;
      }
      if (audioTag.duration) {
        setProgress(audioTag.currentTime / audioTag.duration);
      }
      requestRef.current = requestAnimationFrame(updateProgressState);
    }

    audioTag.addEventListener("play", updateProgressState);
    audioTag.addEventListener("playing", updateProgressState);

    return () => {
      audioTag.removeEventListener("play", updateProgressState);
      audioTag.removeEventListener("playing", updateProgressState);
      // https://css-tricks.com/using-requestanimationframe-with-react-hooks/
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div>
      <video ref={audioRef} controls={true} autoPlay={false}>
        <source src={track} type="audio/mpeg" />
      </video>
      <Waveform src={track} progress={progress} />
      <Beats src={track} progress={progress} />
    </div>
  );
}

export default function Search() {
  const [token, setToken] = useState(null);
  const [track, setTrack] = useState(null);
  const [query, setQuery] = useState(null);
  const [data, setData] = useState(null);
  const queryRef = useRef();
  const tokenRef = useRef();

  useEffect(() => {
    if (!token || !query) {
      return;
    }
    // https://github.com/JMPerez/spotify-web-api-js#more-examples
    spotifyApi.setAccessToken(token);
    spotifyApi.searchTracks(query).then(setData, console.error);
  }, [token, query]);

  return (
    <div className={styles.Search}>
      <h2>Search</h2>
      <div>
        <label>
          <span>Token</span>
          <input
            ref={tokenRef}
            defaultValue={process.env.SPOTIFY_TOKEN || ""}
            onFocus={(e) => e.target.select()}
          />
        </label>
      </div>
      <div>
        <label>
          <span>Query</span>
          <input ref={queryRef} defaultValue="artist:Beyoncé" />
        </label>
        <button
          onClick={(e) =>
            setToken(tokenRef.current.value.trim()) ||
            setQuery(queryRef.current.value.trim())
          }
        >
          Find
        </button>
      </div>
      {track && <Audio key={track} src={track} />}
      <ul>
        {data?.tracks?.items.map(({ album, id, name, preview_url, type }) => (
          <li key={id}>
            <div>
              id: {type} {id}
            </div>
            <div>name: {name}</div>
            <div>
              preview_url:{" "}
              <a
                href={preview_url}
                onClick={(e) => e.preventDefault() || setTrack(preview_url)}
              >
                {preview_url}
              </a>
            </div>
            {(({ artists, id, images, name, type }) => (
              <div>
                <div>
                  id: {type} {id}
                </div>
                <div>artists: {artists.map(({ name }) => name).join(", ")}</div>
                <div>name: {name}</div>
                <div>
                  {images
                    .sort(({ width: a }, { width: b }) => a - b)
                    .slice(0, 1)
                    .map(({ width, height, url }, key) => (
                      <img
                        key={key}
                        src={url}
                        width={width}
                        height={height}
                        alt={name}
                      />
                    ))}
                </div>
              </div>
            ))(album)}
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

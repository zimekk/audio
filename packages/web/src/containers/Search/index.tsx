import React, { useEffect, useRef, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "./styles.module.scss";

// https://github.com/JMPerez/spotify-web-api-js#usage
const spotifyApi = new SpotifyWebApi();

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
    // search tracks whose artist's name contains 'Love'
    spotifyApi
      .searchTracks(query)
      .then(
        (data) =>
          Boolean(
            console.log(`Search tracks by "${query}" in the artist name`, data)
          ) || setData(data),
        console.error
      );
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
      {track && (
        <div>
          <video key={track} controls={true} autoPlay={false} name="media">
            <source src={track} type="audio/mpeg" />
          </video>
        </div>
      )}
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
                    .sort(({ width: a }, { width: b }) => (a > b ? 1 : -1))
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

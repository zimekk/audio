import React, { useEffect, useRef, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import styles from "./styles.module.scss";

export default function Search() {
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const tokenRef = useRef();

  useEffect(() => {
    if (!token) {
      return;
    }
    // https://github.com/JMPerez/spotify-web-api-js#usage
    const spotifyApi = new SpotifyWebApi();

    console.log({ spotifyApi });

    spotifyApi.setAccessToken(token);

    // get Elvis' albums, using Promises through Promise, Q or when
    spotifyApi.getArtistAlbums("43ZHCT0cAZBISjO8DG9PnE").then(
      function (data) {
        console.log("Artist albums", data);
        setData(data);
      },
      function (err) {
        console.error(err);
      }
    );
  }, [token]);

  return (
    <div className={styles.Search}>
      <h2>Search</h2>
      <div>
        <input
          ref={tokenRef}
          defaultValue=""
          onFocus={(e) => e.target.select()}
        />
        <button onClick={(e) => setToken(tokenRef.current.value.trim())}>
          setToken
        </button>
      </div>
      <ul>
        {data?.items.map(({ artists, id, images, name }) => (
          <li key={id}>
            <div>id: {id}</div>
            <div>artists: {artists.map(({ name }) => name).join(", ")}</div>
            <div>name: {name}</div>
            <div>
              {images
                .sort(({ width: a }, { width: b }) => (a > b ? 1 : -1))
                .splice(0, 1)
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
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

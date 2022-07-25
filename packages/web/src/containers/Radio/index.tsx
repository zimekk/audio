import React, { RefObject, useEffect, useRef } from "react";
// import ReactHlsPlayer from 'react-hls-player';
import { createAsset } from "use-asset";
import Hls from "hls.js";
import { format } from "date-fns";
import { z } from "zod";
import styles from "./styles.module.scss";

const RADIO =
  "https://radio.stream.smcdn.pl/icradio-p/2380-1.aac/playlist.m3u8";

const asset = createAsset(async () => {
  const res = await fetch("/api/mobile/station/2380/now_playing/", {
    mode: "cors",
  });
  return z
    .object({
      media_id: z.number(),
      image: z.string(),
      start_time: z.string(),
      artists: z.array(z.object({ id: z.number(), name: z.string() })),
      end_time: z.string().nullable(),
      thumb: z.string(),
      name: z.string(),
    })
    .array()
    .parse(
      await res.json().catch((e) => [
        {
          name: "Hey Mama",
          media_id: 138945,
          thumb:
            "https://cdn.music.smcloud.net/t/covers/Hey-Mama_so-UR5a-qP76-ndCA_cover_100x100.jpg",
          start_time: "2022-07-06T20:31:51+00:00",
          artists: [
            { name: "David Guetta", id: 194 },
            { name: "Nicki Minaj", id: 2114 },
            { name: "Bebe Rexha", id: 3272 },
            { name: "Afrojack", id: 3269 },
          ],
          image:
            "https://cdn.music.smcloud.net/t/covers/Hey-Mama_so-UR5a-qP76-ndCA_cover.jpg",
          end_time: "2022-07-06T20:35:00+00:00",
        },
        {
          name: "As It Was",
          media_id: 156917,
          thumb:
            "https://cdn.music.smcloud.net/t/covers/As-It-Was_so-UAEB-jsky-Prx4_cover_100x100.jpg",
          start_time: "2022-07-06T20:29:12+00:00",
          artists: [{ name: "Harry Styles", id: 6176 }],
          image:
            "https://cdn.music.smcloud.net/t/covers/As-It-Was_so-UAEB-jsky-Prx4_cover.jpg",
          end_time: "2022-07-06T20:31:49+00:00",
        },
        {
          name: "As It Was",
          media_id: 156917,
          thumb:
            "https://cdn.music.smcloud.net/t/covers/As-It-Was_so-UAEB-jsky-Prx4_cover_100x100.jpg",
          start_time: "2022-07-06T20:29:12+00:00",
          artists: [{ name: "Harry Styles", id: 6176 }],
          image:
            "https://cdn.music.smcloud.net/t/covers/As-It-Was_so-UAEB-jsky-Prx4_cover.jpg",
          end_time: "2022-07-06T20:31:49+00:00",
        },
      ])
    );
});

function Playlist() {
  const list = asset.read();

  return (
    <ul>
      {list.map(
        ({ artists, name, thumb, start_time, end_time, ...item }, key) => (
          <li key={key} style={{ clear: "both" }}>
            <img
              src={thumb}
              width="50"
              height="50"
              style={{ float: "left", margin: 5 }}
            />
            <div style={{ float: "left" }}>
              <div>
                {[start_time, end_time]
                  .filter(Boolean)
                  .map((time) => format(new Date(time), "yyyy-MM-dd, HH:mm:ss"))
                  .join(" - ")}
              </div>
              <div>
                <strong>{name}</strong>
              </div>
              {artists.map(({ name }, key) => (
                <div key={key}>{name}</div>
              ))}
            </div>
          </li>
        )
      )}
    </ul>
  );
}

// https://github.com/devcshort/react-hls/blob/master/src/index.tsx
export interface HlsPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  hlsConfig?: object;
  playerRef?: RefObject<HTMLVideoElement>;
  src: string;
}

function ReactHlsPlayer({
  hlsConfig,
  playerRef = React.createRef<HTMLVideoElement>(),
  src,
  autoPlay,
  ...props
}: HlsPlayerProps) {
  useEffect(() => {
    let hls: Hls;

    function _initPlayer() {
      if (hls != null) {
        hls.destroy();
      }

      const newHls = new Hls({
        enableWorker: false,
        ...hlsConfig,
      });

      if (playerRef.current != null) {
        newHls.attachMedia(playerRef.current);
      }

      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(src);

        newHls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            playerRef?.current
              ?.play()
              .catch(() =>
                console.log(
                  "Unable to autoplay prior to user interaction with the dom."
                )
              );
          }
        });
      });

      newHls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              newHls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              newHls.recoverMediaError();
              break;
            default:
              _initPlayer();
              break;
          }
        }
      });

      hls = newHls;
    }

    // Check for Media Source support
    if (Hls.isSupported()) {
      _initPlayer();
    }

    return () => {
      if (hls != null) {
        hls.destroy();
      }
    };
  }, [autoPlay, hlsConfig, playerRef, src]);

  // If Media Source is supported, use HLS.js to play video
  if (Hls.isSupported()) return <audio ref={playerRef} {...props} />;

  // Fallback to using a regular video player if HLS is supported by default in the user's browser
  return <audio ref={playerRef} src={src} autoPlay={autoPlay} {...props} />;
}

function ReactMp3Player({
  playerRef = React.createRef<HTMLVideoElement>(),
  src,
  autoPlay,
  ...props
}: HlsPlayerProps) {
  return <audio ref={playerRef} src={src} autoPlay={autoPlay} {...props} />;
}

export default function Section() {
  const playerRef = useRef(null);
  return (
    <section className={styles.Section}>
      <h3>Radio</h3>
      <div>
        <h4>Radio Zet</h4>
        <ReactMp3Player
          src="https://zt.cdn.eurozet.pl/zet-net.mp3"
          autoPlay={false}
          controls={true}
        />
      </div>
      <div>
        <h4>Radio ChilliZet</h4>
        <ReactMp3Player
          src="https://ch01.cdn.eurozet.pl/chi-net.mp3"
          autoPlay={false}
          controls={true}
        />
      </div>
      <div>
        <h4>AntyRadio</h4>
        <ReactMp3Player
          src="https://an01.cdn.eurozet.pl/ant-waw.mp3"
          autoPlay={false}
          controls={true}
        />
      </div>
      <div>
        <h4>Radio Eska</h4>
        <ReactHlsPlayer
          playerRef={playerRef}
          src={RADIO}
          autoPlay={false}
          controls={true}
        />
      </div>
      <Playlist />
    </section>
  );
}

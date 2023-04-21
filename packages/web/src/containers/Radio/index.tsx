import React, { useRef } from "react";
// import ReactHlsPlayer from 'react-hls-player';
import { createAsset } from "use-asset";
import { format } from "date-fns";
import { z } from "zod";
import { ReactHlsPlayer, ReactMp3Player } from "./Player";
import Stations from "./Stations";
import Library from "./Library";
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
      thumb: z.string().nullable(),
      name: z.string().nullable(),
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
          <li key={key}>
            {thumb && <img src={thumb} width="50" height="50" />}
            <div>
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

const rdsAsset = createAsset(async (url: string) => {
  const res = await fetch(url, {
    mode: "cors",
  });
  return z
    .object({
      now: z
        .object({
          id: z.string(),
          title: z.string().default(""),
          artist: z.string(),
          startDate: z.string().transform((date) => date.replace(" ", "T")),
          duration: z.string().transform(Number),
          img: z.string(),
        })
        .transform(({ artist, title, startDate, duration, img }) => ({
          artists: [{ name: artist }],
          name: title,
          start_time: startDate,
          end_time: duration
            ? new Date(
                new Date(startDate).getTime() + duration * 1000
              ).toISOString()
            : null,
          thumb: img,
        })),
    })
    .transform(({ now }) => [now])
    .parse(
      await res.json().catch((e) => ({
        now: {
          id: "9497-19",
          title: "THE WAY I ARE",
          artist: "TIMBALAND / KERI HILSON",
          startDate: "2022-07-25 19:46:40",
          duration: "179",
          img: "https://s.eurozet.pl/music/9497-19.jpg",
        },
      }))
    );
});

function RdsData({ src }: { src: string }) {
  const list = rdsAsset.read(src);

  return (
    <ul>
      {list
        // .map(({ title, artist, startDate, img }) => ({
        //   artists: [{ name: artist }],
        //   name: title,
        //   start_time: startDate,
        //   end_time: startDate,
        //   thumb: img,
        // }))
        .map(({ artists, name, thumb, start_time, end_time }, key) => (
          <li key={key}>
            <img src={thumb} width="50" height="50" />
            <div>
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
        ))}
    </ul>
  );
}

const scheduleAsset = createAsset(async (url: string) => {
  const res = await fetch(url, {
    mode: "cors",
  });
  return z
    .object({
      start: z.number(),
      end: z.number(),
      people: z
        .object({
          name: z.string(),
        })
        .array(),
      program: z.object({
        image: z
          .object({
            original: z.string(),
          })
          .transform(({ original }) => original),
        name: z.string(),
      }),
    })
    .array()
    .parse(await res.json().catch((e) => []));
});

function Schedule({ src }: { src: string }) {
  const list = scheduleAsset.read(src);

  return (
    <ul>
      {list.map(({ people, program: { image, name } }, key) => (
        <li key={key}>
          <img src={image} width="50" height="50" />
          <div>
            <div>
              <strong>{name}</strong>
            </div>
            {people.map(({ name }, key) => (
              <div key={key}>{name}</div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Section() {
  const playerRef = useRef(null);
  return (
    <section className={styles.Section}>
      <h3>Radio</h3>
      <Library />
      <div>
        <h4>Radio Zet</h4>
        <ReactMp3Player
          src="https://zt.cdn.eurozet.pl/zet-net.mp3"
          autoPlay={false}
          controls={true}
        />
        <RdsData src="/api/reader/var/radiozet.json" />
      </div>
      <div>
        <h4>Radio ChilliZet</h4>
        <ReactMp3Player
          src="https://ch01.cdn.eurozet.pl/chi-net.mp3"
          autoPlay={false}
          controls={true}
        />
        <RdsData src="/api/reader/var/zetchilli.json" />
        <Schedule src="https://player.chillizet.pl/api/chillizet-radio/schedule/(station)/chillizet" />
      </div>
      <div>
        <h4>AntyRadio</h4>
        <ReactMp3Player
          src="https://an01.cdn.eurozet.pl/ant-waw.mp3"
          autoPlay={false}
          controls={true}
        />
        <RdsData src="/api/reader/var/antyradio.json" />
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
      <Stations />
    </section>
  );
}

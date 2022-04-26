import React, { useEffect, useRef, useState } from "react";
import YouTubePlayer from "youtube-player";
import styles from "./styles.module.scss";

const VIDEO_ID = "q0hyYWKXF0Q";

// https://guitar-book.netlify.app/english/dance-monkey/
const TEXT = `Capo 2



[Intro]

EmCDBm


[Verse]

         Em                         C
They say oh my god I see the way you shine

          D                                    Bm
Take your hand, my dear, and place them both in mine

             Em                                C
You know you stopped me dead when I was passing by

          D                                 Bm
And now I beg to see you dance just one more time



[Pre-chorus]

     Em                             C
Oh I see you, see you, see you every time

         D                    Bm
And oh my I, I, I, I like your style

         Em                             C
You, you make me, make me, make me wanna try

        D                                 N.C.

And now I beg to see you dance just one more time



[Chorus]

N.C.     Em

So I say Dance for me Dance for me

                     C
Dance for me, oh oh oh

           D                                  Bm
I've never seen anybody do the things you do before

         Em
They say move for me move for me

                   C
Move for me, ay ay ay

                D                            Bm
And when you're done I'll make you do it all again



[Verse]

       Em                         C
I said oh my god I see you walking by

        D                                Bm
Take my hands, my dear, and look me in my eyes

            Em                               C
Just like a monkey I've been dancing my whole life

             D                                Bm
And you just beg to see me dance just one more time



[Pre-chorus]

     Em                             C
Oh I see you, see you, see you every time

         D                    Bm
And oh my I, I, I, I like your style

         Em                             C
You, you make me, make me, make me wanna try

        D                                 N.C.

And now I beg to see you dance just one more time



[Chorus]

N.C.     Em

So I say Dance for me Dance for me

                     C
Dance for me, oh oh oh

           D                                  Bm
I've never seen anybody do the things you do before

         Em
They say move for me move for me

                   C
Move for me, ay ay ay

                D                            Bm
And when you're done I'll make you do it all again



         Em
So I say Dance for me Dance for me

                     C
Dance for me, oh oh oh

           D                                  Bm
I've never seen anybody do the things you do before

         Em
They say move for me move for me

                   C
Move for me, ay ay ay

                D                            Bm
And when you're done I'll make you do it all again



[Interlude]

Em      C         D
Ooh (all again, all again)

     Bm
Woah-oh, woah-oh, oh

Em      C         D
Ooh (all again, all again)

 N.C.

Ah ah, ah ah, ay



[Chorus]

N.C.     Em

So I say Dance for me Dance for me

                     C
Dance for me, oh oh oh

           D                                  Bm
I've never seen anybody do the things you do before

         Em
They say move for me move for me

                   C
Move for me, ay ay ay

                D                            Bm
And when you're done I'll make you do it all again



         Em
So I say Dance for me Dance for me

                     C
Dance for me, oh oh oh

           D                                  Bm
I've never seen anybody do the things you do before

         Em
They say move for me move for me

                   C
Move for me, ay ay ay

                D                  N.C.

And when you're done I'll make you do it all again`;

// https://developers.google.com/youtube/iframe_api_reference#Events
const stateNames = {
  "-1": "unstarted",
  0: "ended",
  1: "playing",
  2: "paused",
  3: "buffering",
  5: "video cued",
};

function Player() {
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      const player = YouTubePlayer(playerRef.current, {
        videoId: VIDEO_ID,
      });

      player.on("ready", function () {
        console.log("Player1 is ready.");
      });

      player
        // Play video is a Promise.
        // "playVideo" is queued and will execute as soon as player is ready.
        .playVideo()
        .then(function () {
          console.log(
            "Starting to play player1. It will take some time to buffer video before it actually starts playing."
          );
        });

      let interval: NodeJS.Timer;

      const updateProgress = async () => {
        setProgress(
          (100 * (await player.getCurrentTime())) / (await player.getDuration())
        );
      };

      player.on("stateChange", function (event) {
        if (!stateNames[event.data]) {
          throw new Error("Unknown state (" + event.data + ").");
        }

        console.log(
          "State: " + stateNames[event.data] + " (" + event.data + ")."
        );

        updateProgress();

        if (event.data === 1) {
          interval = setInterval(updateProgress, 1000);
        } else if ([0, 2].includes(event.data)) {
          clearInterval(interval);
        }
      });
    }
  }, [playerRef, setProgress]);

  return (
    <div>
      <div ref={playerRef}></div>
      <div className={styles.Progress}>
        <i
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}

function Text() {
  return <pre className={styles.Text}>{TEXT}</pre>;
}

export default function Section() {
  return (
    <section className={styles.Section}>
      <h3>Video</h3>
      <Player />
      <Text />
    </section>
  );
}

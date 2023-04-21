import { createReadStream, statSync } from "fs";
import { glob } from "glob";
import { Router } from "express";
import { dirname, resolve } from "path";

const { LIBRARY_PATH = "" } = process.env;

const cwd = resolve(dirname(require.resolve("../../../.env")), LIBRARY_PATH);

export const stream = () =>
  Router()
    .get("/library.json", (_, res) =>
      glob("**/*.flac", {
        cwd,
      }).then((list) => res.send(list))
    )
    .get("/:filename", ({ headers, params }, res) => {
      const { filename } = params;
      const filepath = `${cwd}/${filename}`;

      // https://medium.com/@yelee2369/node-js-streaming-audio-files-10dd5e8670d0
      // https://gist.github.com/DingGGu/8144a2b96075deaf1bac
      const music = filepath;

      const { size } = statSync(music);
      const { range } = headers;

      let readStream;
      if (range !== undefined) {
        const [partial_start, partial_end] = range
          .replace(/bytes=/, "")
          .split("-");

        if (partial_start.length > 1 || partial_end.length > 1) {
          // return res.sendStatus(500); // ERR_INCOMPLETE_CHUNKED_ENCODING
        }

        var start = parseInt(partial_start, 10);
        var end = partial_end ? parseInt(partial_end, 10) : size - 1;
        var content_length = end - start + 1;

        res.status(206).header({
          // 'Content-Type': 'audio/mpeg',
          "Content-Type": "audio/flac",
          "Content-Length": content_length,
          "Content-Range": "bytes " + start + "-" + end + "/" + size,
        });
        readStream = createReadStream(music, { start, end });
      } else {
        res.header({
          // 'Content-Type': 'audio/mpeg',
          "Content-Type": "audio/flac",
          "Content-Length": size,
        });
        readStream = createReadStream(music);
      }
      readStream.pipe(res);
    });

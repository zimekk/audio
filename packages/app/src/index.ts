import express, { Router } from "express";
import fetch from "isomorphic-fetch";
import cors from "cors";
import path from "path";

const web =
  process.env.NODE_ENV === "development"
    ? (({ entry, ...config }) => {
        const compiler = require("webpack")({
          mode: "development",
          entry: ["webpack-hot-middleware/client"].concat(entry),
          ...config,
        });

        return Router()
          .use(
            require("webpack-dev-middleware")(compiler, {
              publicPath: config.output?.publicPath,
            })
          )
          .use(require(`webpack-hot-middleware`)(compiler, {}));
      })(require("@dev/web/webpack.config").default)
    : Router().use(
        express.static(
          path.resolve(
            path.dirname(require.resolve("@dev/web/package")),
            "public"
          )
        )
      );

const PORT = 8080;

export default express()
  .use(require("morgan")("combined"))
  .use(cors({ origin: "*" }))
  .get("/api/mobile/station/2380/now_playing/", (req, res) =>
    fetch("https://www.eska.pl/api/mobile/station/2380/now_playing/")
      .then((res) => res.json())
      .then((json) => res.json(json))
  )
  .get("/api/reader/var/(:station)", (req, res) =>
    fetch(
      `https://rds.eurozet.pl/reader/var/${req.params.station}?callback=rdsData`
    )
      .then((res) => res.text())
      .then((text) =>
        JSON.parse(unescape((text.match(/^\w+\((.*)\)$/) || [])[1]))
      )
      .then((json) => res.json(json))
  )
  .use(web)
  .listen(PORT, (...args) =>
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
  );

const express = require("express");
const api = express.Router();
//const app = express();
//app.use(express.json());

const songRouter = require("./songlist.route");
const movieRouter = require("./movies.route");
const userRouter = require("./users.route");

api.use("/songs", songRouter);
api.use("/movies", movieRouter);
api.use("/users", userRouter);

api.get("/", (req, res) => {
  res.status(200).send("Version 1 of songs API");
});

module.exports = api;

const express = require("express");
const router = express.Router();
//const Joi = require("@hapi/joi");
const {
  //createOne,
  createOneSong,
  findAllSongs,
  findOneSong,
  findOneSongAndUpdate,
  deleteOneSong,
  deleteAllSongs,
  //nextID,
} = require("../controllers/song.controller");

const checkJSON = (req, res, next) => {
  if (req.headers["content-type"] != "application/json") {
    const err = new Error("Please provide json!");
    err.statusCode = 400;
    next(err);
  } else {
    //console.log(req.body);
    //console.log("checkJSON is called and the object is JSON");
    next();
  }
};

router.get("/", findAllSongs);
router.post("/", checkJSON, createOneSong);
router.get("/:id", findOneSong);
router.put("/:id", findOneSongAndUpdate);
router.delete("/:id", deleteOneSong);
router.delete("/", deleteAllSongs);

module.exports = router;

// router.get("/", async (req, res) => {
//   // console.log("Inside all songs");
//   // const result = songs.filter((songfilter) => {
//   //   for (key in req.query) {
//   //     if (songfilter[key] && String(songfilter[key]) !== req.query[key]) {
//   //       //This means that value in database/datafile does not match
//   //       return false;
//   //     }
//   //   }
//   //   return true;
//   // });

//   const result = await findAllSongs();
//   //console.log(result);
//   res.json(result);
// });

// router.get("/:id", async (req, res, next) => {
//   const id = req.params.id;
//   const result = await findOneSong(id);
//   //res.status(200).json(songs.filter((song) => String(song.id) === id)[0]);
//   //console.log(result);
//   if (!!result) {
//     res.status(200).json(result);
//   } else {
//     const err = new Error("No data found");
//     err.statusCode = 404;
//     next(err);
//   }
//   //res.status(200).json(result);
// });

// router.put("/:id", async (req, res) => {
//   const id = req.params.id;
//   const name = req.body.name;
//   const artist = req.body.artist;
//   // let updatedSong = {};
//   // const updatedSongs = songs.map((song) => {
//   //   if (String(song.id) === id) {
//   //     song.name = name;
//   //     song.artist = artist;
//   //     updatedSong = {
//   //       id: id,
//   //       name: song.name,
//   //       artist: song.artist,
//   //     };
//   //   }
//   //   return song;
//   // });

//   // songs = [...updatedSongs];

//   const updatedSongs = await findOneSongAndUpdate(
//     { id: id },
//     { name: name, artist: artist }
//   ).then((data) => {
//     //console.log(data);
//     return data;
//   });

//   res.status(200).send(updatedSongs);
// });

// router.delete("/:id", async (req, res, next) => {
//   const id = req.params.id;
//   // const deletedSong = songs.filter((song) => String(song.id) === id)[0];

//   // const remainingSongs = songs.filter((song) => String(song.id) !== id);

//   // songs = [...remainingSongs];

//   const deletedSong = await deleteOneSong({ id: id }).then((data) => {
//     //console.log(data);
//     return data;
//   });

//   if (!!deletedSong) {
//     res.status(200).json(deletedSong);
//   } else {
//     const err = new Error("Nothing to delete");
//     err.statusCode = 404;
//     next(err);
//   }
// });

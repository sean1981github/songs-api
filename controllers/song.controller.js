const SimpleSongs = require("../models/songs.model");
const wrapAsync = require("../utils/wrapAsync");
const Joi = require("@hapi/joi");

const songSchema = Joi.object({
  name: Joi.string()
    //.alphanum() //must contain only alphanumeric characters
    .min(3)
    .max(30) //at least 3 characters long but no more than 30
    .required(),
  artist: Joi.string()
    //.alphanum() //must contain only alphanumeric characters
    .min(3)
    .max(30) //at least 3 characters long but no more than 30
    .required(),
});

const createOne = async (songobj) => {
  try {
    const newSong = new SimpleSongs(songobj);
    await newSong.save();
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }
};

const findAllSongs = wrapAsync(async (req, res) => {
  const foundSongs = await SimpleSongs.find(
    {},
    "-_id -createdAt -updatedAt -__v"
  );
  return res.status(200).json(foundSongs);
});

const findOneSong = wrapAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const foundSong = await SimpleSongs.findOne(
    { id: id },
    "-_id -createdAt -updatedAt -__v"
  );

  if (!!foundSong) {
    res.status(200).json(foundSong);
  } else {
    const err = new Error("No data found");
    err.statusCode = 404;
    next(err);
  }
});

const findOneSongAndUpdate = wrapAsync(async (req, res, next) => {
  const id = parseInt(req.params.id);
  const name = req.body.name;
  const artist = req.body.artist;

  const updatedSong = await SimpleSongs.findOneAndUpdate(
    { id: id },
    { name: name, artist: artist },
    // If `new` isn't true, `findOneAndUpdate()` will return the
    // document as it was _before_ it was updated.
    { new: true, projection: "-_id -createdAt -updatedAt -__v" }
  );

  if (!!updatedSong) {
    res.status(200).send(updatedSong);
  } else {
    const err = new Error("No data found");
    err.statusCode = 404;
    next(err);
  }
});

const deleteOneSong = wrapAsync(async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const deletedSong = await SimpleSongs.findOneAndDelete(
      { id },
      {
        projection: "-_id -createdAt -updatedAt -__v",
      }
    );

    if (!!deletedSong) {
      res.status(200).json(deletedSong);
    } else {
      throw new Error("Nothing to delete");
    }
  } catch (err) {
    err.statusCode = 404;
    next(err);
  }
});

const deleteAllSongs = wrapAsync(async (req, res, next) => {
  try {
    const deletedSong = await SimpleSongs.deleteMany();

    console.log(deletedSong);
    res.status(200).json("All records deleted");
  } catch (err) {
    //console.log(err);
    err.message = "Internal Server Error";
    err.statusCode = 500;
    next(err);
  }
});

const nextID = async () => {
  const recordCount = await SimpleSongs.countDocuments({});
  let nextID = 0;
  if (recordCount === 0) {
    nextID = 1;
  } else {
    const lastRecord = await SimpleSongs.find({}).sort({ _id: -1 }).limit(1);
    //console.log(`inside next ID ${lastRecord}`);
    nextID = lastRecord[0].id + 1;
  }
  return nextID;
};

const createOneSong = wrapAsync(async (req, res, next) => {
  try {
    result = songSchema.validate(req.body);

    if (result.error) {
      // console.log("The data is invalid"); //return 400 bad request
      const err = new Error(result.error.details[0].message);
      err.statusCode = 400;
      next(err);
    }

    const name = req.body.name;
    const artist = req.body.artist;
    //const lastID = !!songs && !!songs.length ? songs[songs.length - 1].id : 0;
    //const id = lastID + 1;
    const id = await nextID().then((data) => {
      return data;
    });
    const newSong = {
      id: id,
      name: name,
      artist: artist,
    };
    //songs.push(newSong);
    await createOne(newSong);
    res.status(201).json(newSong);
  } catch (err) {
    next(err);
  }
});

module.exports = {
  //createOne,
  findAllSongs,
  createOneSong,
  findOneSong,
  findOneSongAndUpdate,
  deleteOneSong,
  deleteAllSongs,
  //nextID,
};

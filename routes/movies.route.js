const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
//const movieData = require("./movieData");
let movies = [];

const movieSchema = Joi.object({
  movieName: Joi.string()
    //    .alphanum() //must contain only alphanumeric characters
    .min(3)
    .max(30) //at least 3 characters long but no more than 30
    .required(),
});

router.post("/", (req, res, next) => {
  result = movieSchema.validate(req.body);

  if (result.error) {
    // console.log("The data is invalid"); //return 400 bad request
    const err = new Error(result.error.details[0].message);
    err.statusCode = 400;
    next(err);
  } else {
    const id = movies.length + 1;
    const movieName = req.body.movieName;
    const newMovie = {
      id: id,
      movieName: movieName,
    };
    movies.push(newMovie);
    res.status(201).json(newMovie);
  }
});

router.get("/", (req, res) => {
  //console.log(movies);
  res.status(200).json(movies);
});

router.get("/:id", (req, res) => {
  const movie = movies.find((movie) => String(movie.id) === req.params.id);
  res.status(200).json(movie);
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const movieName = req.body.movieName;

  let updatedMovie = {};
  const updatedMovies = movies.map((movie) => {
    if (String(movie.id) === id) {
      movie.id = parseInt(id);
      movie.movieName = movieName;
      updatedMovie = {
        id: parseInt(id),
        movieName: movieName,
      };
    }
    return movie;
  });

  //console.log(updatedMovies);
  movies = [...updatedMovies];

  res.status(200).send(updatedMovie);
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const deletedMovie = movies.filter((movie) => String(movie.id) === id)[0];

  const remainingMovie = movies.filter((movie) => String(movie.id) !== id);

  movies = [...remainingMovie];
  res.status(200).json(deletedMovie);
});

// router.use((err, req, res, next) => {
//   res.status(err.statusCode).send(`${err} </br>`);
// });

module.exports = router;

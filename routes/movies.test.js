const request = require("supertest");
const app = require("../app");

describe("App", () => {
  it("POST /movies should return a new movie object", async () => {
    const newMovie = { movieName: "Lion King" };
    //const expectedSong = { id: 3, name: "test song2", artist: "rhianna" };
    const { body } = await request(app)
      .post("/v2/movies")
      .send(newMovie)
      .expect(201);
    expect(body).toMatchObject(newMovie);
  });
  it("POST /movies should return 400 when movieName fail validation", async () => {
    const newMovie = { movieName: "Li" };
    //const expectedSong = { id: 3, name: "test song2", artist: "rhianna" };
    const { body } = await request(app)
      .post("/v2/movies")
      .send(newMovie)
      .expect(400);
    //expect(body).toMatchObject(newMovie);
  });

  it("GET /movies should return movies object in array", async () => {
    const expectedMovie = [
      { id: 1, movieName: "Lion King" },
      //{ id: 2, movieName: "Lion King 2" },
    ];

    const { body: actualMovies } = await request(app)
      .get("/v2/movies")
      .expect(200);

    expect(actualMovies).toMatchObject(expectedMovie);
  });

  it("GET /movies should return movies object in array based on search parameter", async () => {
    const expectedMovie = { id: 1, movieName: "Lion King" };

    const { body: actualMovies } = await request(app)
      .get("/v2/movies/1")
      .expect(200);

    expect(actualMovies).toEqual(expectedMovie);
  });

  it("PUT /movies/:id should return the updated movie", async () => {
    const updatedMovie = { id: 1, movieName: "Frozen 2" };

    const { body: actualMovies } = await request(app)
      .put("/v2/movies/1")
      .send(updatedMovie)
      .expect(200);

    expect(actualMovies).toEqual(updatedMovie);
  });

  it("DELETE /movies/:id should return the deleted movie", async () => {
    const expectedDeletedMovie = { id: 1, movieName: "Frozen 2" };

    const { body: deletedMovies } = await request(app)
      .delete("/v2/movies/1")
      .expect(200);

    expect(deletedMovies).toEqual(expectedDeletedMovie);
  });
});

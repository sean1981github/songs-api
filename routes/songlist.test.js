const request = require("supertest");
const app = require("../app");
const teardownMongoose = require("../utils/testTeardown");
const songTestData = require("../data/songData");
const SongModel = require("../models/songs.model");

describe("songlist", () => {
  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await SongModel.create(songTestData);
  });

  afterEach(async () => {
    await SongModel.deleteMany();
  });

  it("POST /songs should add a song and return a new song object", async () => {
    const newSong = { name: "testsong", artist: "rhianna" };
    const expectedSong = { id: 3, name: "testsong", artist: "rhianna" };

    const { body } = await request(app)
      .post("/v1/songs")
      .send(newSong)
      .expect(201);

    expect(body).toEqual(expectedSong);
  });

  it("POST /songs should get 400 error when songs not in JSON", async () => {
    const newSong = "1";
    //const expectedSong = { id: 3, name: "testsong", artist: "rhianna" };

    await request(app).post("/v1/songs").send(newSong).expect(400);
  });

  it("POST /songs should add a song and return a new song object when it's the first song", async () => {
    const newSong = { name: "firstSong", artist: "rhianna" };
    const expectedSong = { id: 1, name: "firstSong", artist: "rhianna" };

    await SongModel.deleteMany();

    const { body } = await request(app)
      .post("/v1/songs")
      .send(newSong)
      .expect(201);

    expect(body).toEqual(expectedSong);
  });

  it("POST /songs should get 400 error when fail validation checks", async () => {
    const newSong = { name: "fail validation" };
    //const expectedSong = { id: 3, name: "testsong", artist: "rhianna" };

    await request(app).post("/v1/songs").send(newSong).expect(400);
  });

  it("POST /songs should get 400 error when duplicate name", async () => {
    const newSong = { name: "someSongName1", artist: "someSongArtist1" };

    //const expectedSong = { id: 3, name: "testsong", artist: "rhianna" };

    await request(app).post("/v1/songs").send(newSong).expect(400);
  });

  it("GET /songs should return all the songs", async () => {
    const { body: actualSong } = await request(app)
      .get("/v1/songs")
      .expect(200);

    expect(actualSong).toMatchObject(songTestData);
  });

  it("GET /songs/:id should return the correct song", async () => {
    const expectedSong = { name: "2ndsongname", artist: "2ndArtist" };

    const { body: actualSong } = await request(app)
      .get("/v1/songs/2")
      .expect(200);

    expect(actualSong).toMatchObject(expectedSong);
  });

  it("GET /songs/:id should return 404 when no data found", async () => {
    await request(app).get("/v1/songs/3").expect(404);
  });

  it("PUT /songs/:id should return the updated song", async () => {
    const updatedSong = {
      id: 2,
      name: "updatedSong",
      artist: "artist",
    };
    const expectedSong = { id: 2, name: "updatedSong", artist: "artist" };

    const { body } = await request(app)
      .put("/v1/songs/2")
      .send(updatedSong)
      .expect(200);

    expect(body).toEqual(expectedSong);
  });

  it("PUT /songs/:id should return 404 when there is no song found to update", async () => {
    const updatedSong = { id: 3, name: "updatedSong", artist: "artist" };

    await request(app).put("/v1/songs/3").send(updatedSong).expect(404);
  });

  it("Delete /songs/:id should return the deleted song", async () => {
    const expectedDeletedSong = {
      id: 1,
      name: "someSongName1",
      artist: "someSongArtist1",
    };

    const { body: deletedSong } = await request(app)
      .delete("/v1/songs/1")
      .expect(200);

    expect(deletedSong).toMatchObject(expectedDeletedSong);
  });

  it("Delete /songs/:id should return 404 when no data to delete", async () => {
    await request(app).delete("/v1/songs/3").expect(404);
  });

  it("Delete /songs should delete all songs", async () => {
    const { body: deleteSongs } = await request(app)
      .delete("/v1/songs")
      .expect(200);
    expect(deleteSongs).toEqual("All records deleted");
  });

  it("Delete /songs should return 500 when there is internal server error", async () => {
    const originalDeleteAllSongs = SongModel.deleteMany;
    SongModel.deleteMany = jest.fn();

    SongModel.deleteMany.mockImplementationOnce(() => {
      const err = new Error();
      throw err;
    });

    //await request(app).delete("/v1/songs").expect(500);
    const { body: error } = await request(app).delete("/v1/songs").expect(500);
    expect(error.error).toEqual("Internal Server Error");
    SongModel.deleteMany = originalDeleteAllSongs;
  });
});

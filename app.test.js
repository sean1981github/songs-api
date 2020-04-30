const request = require("supertest");
const app = require("./app");

describe("App", () => {
  it("Testing to see if Jest works", () => {
    expect(1).toBe(1);
  });

  it("GET /V1 should get version 1", async () => {
    const expectedVersion = "Version 1 of songs API";

    const { text: actualVersion } = await request(app).get("/v1").expect(200);

    //console.log(actualVersion);
    expect(actualVersion).toEqual(expectedVersion);
  });

  it("GET /v2 should get version 2", async () => {
    const expectedVersion = "Version 2 of songs API";

    const { text: actualVersion } = await request(app).get("/v2").expect(200);

    //console.log(actualVersion);
    expect(actualVersion).toEqual(expectedVersion);
  });
});

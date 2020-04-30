const request = require("supertest");
const app = require("../app");
const { teardownMongoose } = require("../utils/testTearDownMongoose");
const userTestData = require("../data/userData");
const UserModel = require("../models/users.model");

const versionRoute = "/v1";

jest.mock("jsonwebtoken");
const jwt = require("jsonwebtoken");

describe("user.route", () => {
  let signedInAgent;

  afterAll(async () => {
    await teardownMongoose();
  });

  beforeEach(async () => {
    await UserModel.create(userTestData);

    signedInAgent = request.agent(app);
    await signedInAgent
      .post(versionRoute + "/users/login")
      .send(userTestData[0]);
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await UserModel.deleteMany();
  });

  describe("/users", () => {
    it("POST / should return new user", async () => {
      const expectedUser = { username: "newUser", password: "12345" };

      const { body: actualUser } = await request(app)
        .post(versionRoute + "/users")
        .send(expectedUser)
        .expect(201);

      expect(actualUser.username).toEqual(expectedUser.username.toLowerCase());
      expect(actualUser.password).not.toBe(expectedUser.password);
    });

    it("POST / should return 400 when duplicate users are created", async () => {
      const expectedUser = { username: "user1", password: "12345" };

      const { body: actualUser } = await request(app)
        .post(versionRoute + "/users")
        .send(expectedUser)
        .expect(400);

      expect(actualUser.error).toEqual(
        `E11000 duplicate key error dup key: { : \"user1\" }`
      );
    });

    it("GET /:username should return user info when login", async () => {
      const userIndex = 0;
      const { password, ...userInfoWithoutPassword } = userTestData[userIndex];
      const expectedUsername = userTestData[userIndex].username;

      jwt.verify.mockReturnValueOnce({
        name: expectedUsername,
      });

      const { body: actualUser } = await signedInAgent
        .get(versionRoute + `/users/${expectedUsername}`)
        //.set("Cookie", "token=valid-token")
        .expect(200);

      // const { body: actualUser } = await request(app)
      //   .get(versionRoute + `/users/${expectedUsername}`)
      //   .set("Cookie", "token=valid-token")
      //   .expect(200);

      expect(jwt.verify).toBeCalledTimes(1);
      expect(actualUser).toMatchObject(userInfoWithoutPassword);
    });

    it("GET /:username should return 403 unauthorize when incorrect user login", async () => {
      const loginUser = userTestData[0].username;
      const expectedUsername = userTestData[1].username;

      jwt.verify.mockReturnValueOnce({
        name: loginUser,
      });

      const { body: errMsg } = await signedInAgent
        .get(versionRoute + `/users/${expectedUsername}`)
        .expect(403);

      // const { body: errMsg } = await request(app)
      //   .get(versionRoute + `/users/${expectedUsername}`)
      //   .set("Cookie", "token=invalid-token")
      //   .expect(403);

      expect(errMsg.error).toEqual("Not supposed to find other user");
    });

    it("GET /:username should return 401 unauthorize when token is invalid", async () => {
      const userIndex = 0;
      const expectedUsername = userTestData[userIndex].username;

      jwt.verify.mockImplementationOnce(() => {
        throw new Error("Token not valid");
      });

      const { body: errMsg } = await signedInAgent
        .get(versionRoute + `/users/${expectedUsername}`)
        .expect(401);

      // const { body: errMsg } = await request(app)
      //   .get(versionRoute + `/users/${expectedUsername}`)
      //   .set("Cookie", "token=invalid-token")
      //   .expect(401);

      expect(errMsg.error).toBe("Token not valid");
    });

    it("GET /:username should return 401 unauthorize when there is no token", async () => {
      const userIndex = 0;
      const expectedUsername = userTestData[userIndex].username;

      const { body: errMsg } = await request(app)
        .get(versionRoute + `/users/${expectedUsername}`)
        .expect(401);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(errMsg.error).toBe("You are not authorized");
    });

    it("GET /:username should return 404 when no such user exist", async () => {
      const loginUser = userTestData[0].username;
      const expectedUsername = "noSuchUser";

      jwt.verify.mockReturnValueOnce({
        name: loginUser,
      });

      const { body: errMsg } = await signedInAgent
        .get(versionRoute + `/users/${expectedUsername}`)
        .expect(404);

      // const { body: errMsg } = await request(app)
      //   .get(versionRoute + `/users/${expectedUsername}`)
      //   .set("Cookie", "token=invalid-token")
      //   .expect(404);

      expect(errMsg.error).toEqual("No such user");
    });

    it("POST /login should login user if password is correct", async () => {
      const loginUser = { username: "user1", password: "somepassword1" };

      const { text: loginMsg } = await request(app)
        .post(versionRoute + "/users/login")
        .send(loginUser)
        .expect(200);

      expect(loginMsg).toEqual(`${loginUser.username} is now logged in!`);
    });

    it("POST /login should not login user if password is incorrect", async () => {
      const loginUser = { username: "user1", password: "incorrectPassword" };

      const { body: loginMsg } = await request(app)
        .post(versionRoute + "/users/login")
        .send(loginUser)
        .expect(401);

      expect(loginMsg.error).toEqual("Login failed");
    });

    it("POST /login should return 400 when no user found", async () => {
      const loginUser = { username: "user3", password: "someOtherPassword" };

      const { body: loginMsg } = await request(app)
        .post(versionRoute + "/users/login")
        .send(loginUser)
        .expect(400);

      expect(loginMsg.error).toEqual("Login failed");
    });

    it("POST /login should return 400 when joi validation error", async () => {
      const expectedUser = { username: "user3", password: "12" };

      const { body: actualUser } = await request(app)
        .post(versionRoute + "/users/login")
        .send(expectedUser)
        .expect(400);

      expect(actualUser.error).toEqual(
        `"password" length must be at least 5 characters long`
      );
    });

    it("POST /logout should logout users", async () => {
      const response = await request(app)
        .post(versionRoute + "/users/logout")
        .expect(200);

      expect(response.text).toEqual("You are now logged out!");
      expect(response.headers["set-cookie"][0]).toMatch(/^token=;/);
    });
  });
});

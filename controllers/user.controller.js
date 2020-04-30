const UserModel = require("../models/users.model");
const wrapAsync = require("../utils/wrapAsync");

const { createJWTToken, getJWTSecret } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");

const userSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(5).required(),
});

const userLogout = (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
};

const createCookie = (req, res, next) => {
  const token = createJWTToken(req.body.username);

  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = oneDay * 7;
  const expiryDate = new Date(Date.now() + oneWeek);

  // Can expiry date on cookie be changed? How about JWT token?

  const cookieName = "token";
  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    res.cookie(cookieName, token, {
      //username: username,
      expires: expiryDate,
      httpOnly: true,
      signed: true,
    });
  } else {
    res.cookie(cookieName, token, {
      //username: username,
      expires: expiryDate,
      httpOnly: true,
      secure: true,
      signed: true,
    });
  }
  res.status(200).send(`${req.body.username} is now logged in!`);
};

const userValidation = wrapAsync(async (req, res, next) => {
  try {
    const { username, password } = req.body;

    //joi validation

    const validationResult = await userSchema.validate(req.body);

    if (validationResult.error) {
      const validationErr = new Error(
        validationResult.error.details[0].message
      );
      validationErr.statusCode = 400;
      throw validationErr;
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new Error("Login failed");
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
      throw new Error("Incorrect password");
    }

    next();
  } catch (err) {
    if (err.message === "Login failed") {
      err.statusCode = 400;
    }
    if (err.message === "Incorrect password") {
      err.statusCode = 401;
      err.message = "Login failed";
    }

    next(err);
  }
});

const createOneUser = wrapAsync(async (req, res, next) => {
  try {
    const submittedUser = req.body;
    const user = new UserModel(submittedUser);
    const newUser = await user.save();
    res.status(201).send(newUser);
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

const findOneUser = wrapAsync(async (req, res, next) => {
  try {
    //   const username = req.params.username;
    //   const regex = new RegExp(username, "gi");
    //   const users = await UserModel.find({ username: regex });
    //   res.send(users);

    const usernameToFind = req.params.username;

    //console.log("POST /:username: usernameToFind=" + usernameToFind);

    const user = await UserModel.findOne(
      { username: usernameToFind },
      "-_id -createdAt -updatedAt -__v"
    );
    if (!user) {
      const noUserError = new Error("No such user");
      noUserError.statusCode = 404;
      throw noUserError;
    }

    if (req.user.name !== usernameToFind) {
      const userNotAllowedError = new Error("Not supposed to find other user");
      userNotAllowedError.statusCode = 403;
      throw userNotAllowedError;
    }

    // const user = await UserModel.findOne(
    //   { username: usernameToFind },
    //   "-_id -createdAt -updatedAt -__v"
    // );
    // if (!user) {
    //   const noUserError = new Error("No such user");
    //   noUserError.statusCode = 404;
    //   throw noUserError;
    // }

    const { password, ...strippedUser } = user.toObject();

    res.json(strippedUser);
  } catch (err) {
    next(err);
  }
});

// const deleteOneUser = wrapAsync(async (req, res, next) => {
//   try {
//     const userNameToDelete = req.params.username;

//     const deletedUserName = await UserModel.findOneAndDelete(
//       { username: userNameToDelete },
//       {
//         projection: "-_id -createdAt -updatedAt -__v",
//       }
//     );
//     console.log(deletedUserName);
//     if (!!deletedUserName) {
//       res.status(200).json(deletedUserName);
//     } else {
//       throw new Error("Nothing to delete");
//     }
//   } catch (err) {
//     err.statusCode = 404;
//     next(err);
//   }
// });

// const deleteAllUsers = wrapAsync(async (req, res, next) => {
//   try {
//     await UserModel.deleteMany();
//     res.status(200).json("All users deleted");
//   } catch (err) {
//     err.message = "Internal Server Error";
//     err.statusCode = 500;
//     next(err);
//   }
// });

module.exports = {
  userLogout,
  createCookie,
  userValidation,
  //userLogin,
  createOneUser,
  findOneUser,
  //deleteOneUser,
  //deleteAllUsers,
};

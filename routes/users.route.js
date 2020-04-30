const express = require("express");
const router = express.Router();
const { protectRoute } = require("../middleware/auth");

const {
  userLogout,
  createCookie,
  userValidation,
  //userLogin,
  createOneUser,
  findOneUser,
  //deleteOneUser,
  //deleteAllUsers,
} = require("../controllers/user.controller");

router.post("/logout", userLogout);
router.post("/login", userValidation, createCookie);
router.post("/", createOneUser);
router.get("/:username", protectRoute, findOneUser);
//router.delete("/", protectRoute, deleteAllUsers);
//router.delete("/:username", protectRoute, deleteOneUser);

module.exports = router;

const jwt = require("jsonwebtoken");
const { getJWTSecret } = require("../utils/jwt");

const protectRoute = (req, res, next) => {
  try {
    //req.signedcookies
    if (!req.signedCookies.token) {
      throw new Error("You are not authorized");
    }
    req.user = jwt.verify(req.signedCookies.token, getJWTSecret()); //decode json token
    //console.log("In protect route [req.user]: ");
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};
module.exports = { protectRoute };

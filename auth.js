const Config = require("./config.js");
const jwtSecret = Config.JWT_SECRET; // Must be same key used in JWTStrategy

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport"); //Local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // Username encoding in the JWT
    expiresIn: "7d", //Token will expire in seven days
    algorithm: "HS256", // Algorithm used to 'sign' or encode the values of JWT
  });
};

const express = require("express");
const API_ROUTER = express.Router();

/* POST login*/
module.exports = (router) => {
  API_ROUTER.post("/login", (req, res) => {
    console.log(req.body);
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log(error, info);
        return res.status(400).json({
          message: "Something is not right",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};

module.exports = auth;

require("dotenv").config();
const { check, validationResult } = require("express-validator"); //2.10

const Models = require("../models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

const { API_ROOT, CONNECTION_URI } = require("../config");

const mongoose = require("mongoose");
mongoose.connect(CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("strictQuery", true);

const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");

const serverless = require("serverless-http");
const app = express();
app.use(express.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//App use methods from modules
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));
const cors = require("cors"); //2.10
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://nixflix.netlify.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
const passport = require("passport");
require("../passport");
const methodOverride = require("method-override");

app.use(methodOverride());
const API_ROUTER = express.Router();

const auth = require("../auth")(API_ROUTER);

API_ROUTER.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
})
  .get(
    "/movies",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find()
        .then(function (movies) {
          res.status(201).json(movies);
        })
        .catch(function (error) {
          console.error(error);
          res.status(500).send("Error: " + error);
        });
    }
  )
  .get(
    "/genres",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find()
        .then((genres) => {
          res.status(201).json(genres);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  .get(
    "/directors",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find()
        .then((directors) => {
          res.status(201).json(directors);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  .get(
    "./movies/:Director",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.findOne({ Director: req.params.Director })
        .then((director) => {
          res.json(director);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  .get(
    "/movies/:Title",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.findOne({ Title: req.params.Title })
        .then((title) => {
          res.json(title);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  .get(
    "/movies/:Title",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.findOne({ Title: req.params.Title })
        .then((title) => {
          res.json(title);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  //Get director info 2.8
  .get(
    "/directors/:Name",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find({ Name: req.params.Name })
        .then((name) => {
          res.json(name);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  //Get genre info 2.8
  .get(
    "/genres/:Name",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.find({ Name: req.params.Name })
        .then((name) => {
          res.json(name);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  //Get users 2.8
  .get(
    "/users",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Users.find()
        .then((users) => {
          res.status(201).json(users);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  //GET specific user by Username 2.8
  .get(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Users.findOne({ Username: req.params.Username })
        .then((user) => {
          res.json(user);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  //GET specific user by id 2.8
  .get(
    "/users/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Users.findOne({ Username: req.params.id })
        .then((user) => {
          res.json(user);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  )
  //Add user 2.10
  .post(
    "/users",
    [
      check("Username", "Username is required").isLength({ min: 5 }),
      check(
        "Username",
        "Username contains non alphanumeric characters - not allowed."
      ).isAlphanumeric(),
      check("Password", "Password is required").not().isEmpty(),
      check("Email", "Email does not appear to be valid").isEmail(),
    ],
    (req, res) => {
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      let hashPassword = Users.hashPassword(req.body.Password); //2.10
      Users.findOne({ Username: req.body.Username })
        .then((user) => {
          if (user) {
            return res.status(400).send(req.body.Username + "already exists");
          } else {
            Users.create({
              Username: req.body.Username,
              Password: hashPassword, //2.10
              Email: req.body.Email,
              Birthday: req.body.Birthday,
            })
              .then((user) => {
                res.status(201).json(user);
              })
              .catch((error) => {
                console.error(error);
                res.status(500).send("Error " + error);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error: " + error);
        });
    }
  )
  //Update user info by unsername 2.8
  .put(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    [
      check("Username", "Username is required").isLength({ min: 5 }),
      check(
        "Username",
        "Username contains non alphanumeric characters - not allowed."
      ).isAlphanumeric(),
      check("Password", "Password is required").not().isEmpty(),
      check("Email", "Email does not appear to be valid").isEmail(),
    ],
    (req, res) => {
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      let hashedPassword = Users.hashPassword(req.body.Password);
      Users.findOneAndUpdate(
        { USername: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.json(updatedUser);
          }
        }
      );
    }
  )
  //Add a movie to users favorites 2.8
  .post(
    "/users/:Username/movies/:MovieID",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $push: { FavoriteMovies: req.params.MovieID },
        },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            console.error(err);
            fs.rmSync.status(500).send("Error: " + err);
          } else {
            res.json(updatedUser);
          }
        }
      );
    }
  )
  //Delete a favorite movie 2.8
  .delete(
    "/users/:Username/movies/:MovieID",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Movies.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $pull: { FavoriteMovies: req.params.MovieID },
        },
        { new: true },
        (err, updatedUser) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error: " + err);
          } else {
            res.json(updatedUser);
          }
        }
      );
    }
  )

  //Delete a user 2.8
  .delete(
    "/users/:Username",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
          if (!user) {
            res.status(400).send(req.params.Username + " was not found");
          } else {
            res.status(200).send(req.params.Username + " was deleted.");
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    }
  );

// .post("/movies", (req, res) => {
//   res.send("movies post hit");
// })
// .put("/movies", (req, res) => {
//   res.send("movies put hit");
// })
// .delete("/movies", (req, res) => {
//   res.send("movies delete hit");
// })
// .get("/users", (req, res) => {
//   res.send("user get hit");
// })
// .post("/users", (req, res) => {
//   res.send("user post hit");
// })
// .put("/users", (req, res) => {
//   res.send("user put hit");
// })
// .delete("/users", (req, res) => {
//   res.send("user delete hit");
// });

app.use(API_ROOT, API_ROUTER);

module.exports = app;
module.exports.handler = serverless(app);

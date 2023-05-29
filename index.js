require("dotenv").config();

const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");

const s3 = new AWS.S3();
const bucketName = "nixflix-images";

const { check, validationResult } = require("express-validator"); //2.10
const Config = require("./config");
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

let connected = false;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    connected = true;
    console.log("db connected");
  })
  .catch((e) => {
    connected = false;
    console.log("db not connected");
  });

const fs = require("fs");
const app = express();
const morgan = require("morgan");
const path = require("path");
const uuid = require("uuid");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//App use methods from modules
app.use(morgan("combined", { stream: accessLogStream }));

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors"); //2.10
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://nixflix-client.netlify.app",
  "https://nixflix-server.onrender.com",
  "https://nickbeasley.github.io",
];
//2.10
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn/n't allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
app.use(bodyParser.json());

let auth = require("./auth")(app); //App able to use auth.js 2.9

const passport = require("passport");
require("./passport");

app.use(methodOverride());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.get(
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
);

app.post(
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
);

app.put(
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
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
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
);

app.post(
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
);

app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.params.Username, req.params.MovieID);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieID } },
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
);

app.delete(
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

// Configure Multer for file upload
const upload = multer({ dest: "uploads/" });

// Upload images to an S3 bucket
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const uploadParams = {
    Bucket: bucketName,
    Key: file.originalname,
    Body: require("fs").createReadStream(file.path),
  };

  s3.upload(uploadParams, (err) => {
    if (err) {
      console.error("Error uploading image:", err);
      return res.status(500).json({ error: "Failed to upload image." });
    }

    return res.json({ message: "Image uploaded successfully." });
  });
});

// Return a list of images in the S3 bucket
app.get("/images", (req, res) => {
  const listParams = { Bucket: bucketName };

  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.error("Error listing images:", err);
      return res.status(500).json({ error: "Failed to retrieve images." });
    }

    const images = data.Contents.map((obj) => obj.Key);
    return res.json({ images });
  });
});

// Retrieve and display a gallery of thumbnails of the images from the S3 bucket
app.get("/thumbnails", (req, res) => {
  const listParams = { Bucket: bucketName };

  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.error("Error listing images:", err);
      return res.status(500).json({ error: "Failed to retrieve images." });
    }

    const images = data.Contents.map((obj) => obj.Key);
    const thumbnails = images.map((key) => getThumbnailURL(key));
    return res.json({ thumbnails });
  });
});

// Retrieve and display the original images from the S3 bucket
app.get("/originals", (req, res) => {
  const listParams = { Bucket: bucketName };

  s3.listObjectsV2(listParams, (err, data) => {
    if (err) {
      console.error("Error listing images:", err);
      return res.status(500).json({ error: "Failed to retrieve images." });
    }

    const images = data.Contents.map((obj) => obj.Key);
    const originals = images.map((key) => getOriginalURL(key));
    return res.json({ originals });
  });
});

// Retrieve and display a specific original image from the S3 bucket
app.get("/originals/:imageKey", (req, res) => {
  const imageKey = req.params.imageKey;
  const originalURL = getOriginalURL(imageKey);

  return res.redirect(originalURL);
});

// Helper function to get the thumbnail URL for an image key
function getThumbnailURL(key) {
  // Modify the URL generation logic according to your needs
  return `https://${bucketName}.s3.amazonaws.com/thumbnails/${key}`;
}

// Helper function to get the original image URL for an image key
function getOriginalURL(key) {
  // Modify the URL generation logic according to your needs
  return `https://${bucketName}.s3.amazonaws.com/originals/${key}`;
}

//Log any errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

module.exports = app;

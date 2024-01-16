const express = require("express");
const axios = require("axios");
const path = require("path");
const { v4: uuid } = require("uuid");
// db
const mongoose = require("mongoose");
const Favorite = require("./models/favorite");
// file utilities
const fs = require("fs");
const fsp = fs.promises;
const { writeFile, readFile } = fsp;
const { existsSync } = fs;

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.get("/test", (req, res) => {
  res.status(200).send({ message: "test" });
});

app.get("/favorites", async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.status(200).json({
      favorites: favorites,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to GET favorites" });
  }
});

app.post("/favorites", async (req, res) => {
  const favName = req.body.name;
  const favType = req.body.type;
  const favUrl = req.body.url;

  try {
    if (favType !== "movie" && favType !== "character") {
      throw new Error('"type" should be "movie" or "character"!');
    }
    const existingFav = await Favorite.findOne({ name: favName });
    if (existingFav) {
      throw new Error("Favorite exists already!");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const favorite = new Favorite({
    name: favName,
    type: favType,
    url: favUrl,
  });

  try {
    await favorite.save();
    res
      .status(201)
      .json({ message: "Favorite saved!", favorite: favorite.toObject() });
  } catch (error) {
    res.status(500).json({ message: "Unable to save new favorite" });
  }
});

// todos middelware - ensure db.json exists before proceeding
app.all("/todos", async (req, res, next) => {
  dbFilePath = path.join(__dirname, "state", "db.json");
  // if db.json exists, continue
  if (existsSync(dbFilePath)) {
    next();
  }
  // otherwise, create the db.json file
  else {
    try {
      await writeFile(dbFilePath, "[]");
      next();
    } catch (error) {
      res.status(500).json({ message: "error creating the db file" });
    }
  }
});

// get all todos
app.get("/todos", async (req, res) => {
  const filepath = path.join(__dirname, "state", "db.json");
  const file = await readFile(filepath, "utf8");
  res.status(200).json(JSON.parse(file));
});

// create a todo
app.post("/todos", async (req, res) => {
  if (!req.body?.title) {
    return res
      .status(400)
      .json({ message: "error - POST missing title in body" });
  }
  if (req.body?.complete === undefined) {
    return res
      .status(400)
      .json({ message: "error - POST missing complete in body" });
  }
  const newTodo = {
    title: req.body.title,
    complete: req.body.complete,
  };
  // get the current todos
  const filepath = path.join(__dirname, "state", "db.json");
  const file = await readFile(filepath, "utf8");
  const todos = JSON.parse(file);
  // add new todo
  todos.push({ id: uuid(), ...newTodo });
  // write to file
  await writeFile(filepath, JSON.stringify(todos));
  res.status(200).json({
    message: "todo successfully created",
  });
});

// get all users
app.get("/users", async (req, res) => {
  console.log("reaching out for users...");
  try {
    const users = await axios.get("https://jsonplaceholder.typicode.com/users");
    res.status(200).json(users.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

// get a single user by ID
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`reaching out for user ${id} ...`);
  try {
    const users = await axios.get(
      `https://jsonplaceholder.typicode.com/users/${id}`
    );
    res.status(200).json(users.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

// get all posts
app.get("/posts", async (req, res) => {
  console.log("reaching out for posts...");
  try {
    const posts = await axios.get("https://jsonplaceholder.typicode.com/posts");
    res.status(200).json(posts.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

// get a single post by ID
app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`reaching out for post ${id} ...`);
  try {
    const posts = await axios.get(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    res.status(200).json(posts.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

// get comments on a post
app.get("/posts/:id/comments", async (req, res) => {
  const id = req.params.id;
  console.log(`reaching out for post ${id} comments ...`);
  try {
    const comments = await axios.get(
      `https://jsonplaceholder.typicode.com/posts/${id}/comments`
    );
    res.status(200).json(comments.data);
  } catch (error) {
    res.status(500).send({
      message: JSON.stringify(error),
    });
  }
});

try {
  mongoose
    .connect("mongodb://mongo-container:27017/favorites", {
      useNewUrlParser: true,
    })
    .then(() => {
      app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
      });
    });
} catch (error) {
  console.log("Server failed to start - failed to connect to mongodb server");
  console.log(error);
}

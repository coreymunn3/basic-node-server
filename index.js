const express = require("express");
const axios = require("axios");
const path = require("path");
const { v4: uuid } = require("uuid");
const { writeFile, readFile } = require("fs").promises;

const app = express();
app.use(express.json());
const PORT = 5000;

app.get("/test", (req, res) => {
  res.status(200).send({ message: "test" });
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

// get all todos
app.get("/todos", async (req, res) => {
  const filepath = path.join(__dirname, "state", "db.json");
  const file = await readFile(filepath, "utf8");
  res.status(200).json(JSON.parse(file));
});

// create a todo
app.post("/todos", async (req, res) => {
  const title = req.body.title;
  const complete = req.body.complete;
  // get the current todos
  const filepath = path.join(__dirname, "state", "db.json");
  const file = await readFile(filepath, "utf8");
  const todos = JSON.parse(file);
  // add new todo
  todos.push({ id: uuid(), title, complete });
  // write to file
  await writeFile(filepath, JSON.stringify(todos));
  res.status(200).json({
    message: "todo successfully created",
  });
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

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

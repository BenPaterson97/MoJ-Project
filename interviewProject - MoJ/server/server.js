const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;

// pool data from database
const { Pool } = require("pg");
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "filmData",
  user: "postgres",
  password: "123test",
});

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// get the data (read)
app.get("/get", (req, res) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, result) => {
    if (error) {
      throw error;
    }
    res.json(result.rows);
  });
});

// post the data (create) **IMPORTANT: Currently not working**
app.post("/insert", (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const movieIDs = req.body.favourite_movies;

  pool.query(
    "INSERT INTO users (firstname, lastname, favourite_movies) VALUES ($1,$2,$3)",
    [firstName, lastName, movieIDs],
    (error, result) => {
      if (error) {
        console.log(error);
      }
    }
  );
});

// put the data (update)
app.put("/update", (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const movieIDs = req.body.favourite_movies;

  pool.query(
    "UPDATE users SET favourite_movies = $1 WHERE firstname = $2 AND lastname = $3",
    [movieIDs, firstName, lastName],
    (error, result) => {
      if (error) {
        console.log(error);
      }
    }
  );
});

// delete the data (delete)
app.delete("/delete", (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;

  pool.query(
    "DELETE FROM users WHERE firstname = $1 AND lastname = $2",
    [firstName, lastName],
    (error, result) => {
      if (error) {
        console.log(error);
      }
    }
  );
});

// listen on port
app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

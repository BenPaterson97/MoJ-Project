import React, { useState, useEffect } from "react";
import "./App.css";
import UserInput from "./components/UserInput";
import Button from "./components/Button";
import Table from "./components/Table";

// OMDb API variables
const apikey = "d4bf15cd";
const omdburl = "http://www.omdbapi.com/?apikey=" + apikey;

function App() {
  const [backendData, setBackendData] = useState([{}]);
  const [movieData, setMovieData] = useState([]);
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userInput, setUserInput] = useState("");

  // on start-up
  useEffect(() => {
    fetch("/get")
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data);
      })
      .catch((err) => console.log("error: get"));
  }, []);

  // get the ids of the users favourite movies
  const getUsersMovieIDs = () => {
    var movieIDs = "";

    // for each entry in the database
    for (let x in backendData) {
      // if the name matches
      if (
        backendData[x].firstname.toLowerCase() ===
          userFirstName.toLowerCase() &&
        backendData[x].lastname.toLowerCase() === userLastName.toLowerCase()
      ) {
        movieIDs = backendData[x].favourite_movies; // store the list of favourite movies
      }
    }
    return movieIDs;
  };

  const movieExists = (newMovieID) => {
    let movieIDs = getUsersMovieIDs().split(",");

    for (let i in movieIDs) {
      if (newMovieID === movieIDs[i]) {
        return true;
      }
    }
    return false;
  };

  const updateLocalData = (movies) => {
    // for each entry in the database
    for (let x in backendData) {
      // if the name matches
      if (
        backendData[x].firstname.toLowerCase() ===
          userFirstName.toLowerCase() &&
        backendData[x].lastname.toLowerCase() === userLastName.toLowerCase()
      ) {
        backendData[x].favourite_movies = movies;
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.id === "firstNameInput") {
      setUserFirstName(e.target.value);
    } else if (e.target.id === "lastNameInput") {
      setUserLastName(e.target.value);
    } else if (e.target.id === "favMovieInput") {
      setUserInput(e.target.value);
    }
  };

  const handleDataDisplay = async () => {
    var movieData = [];
    let movieIDs = getUsersMovieIDs().split(","); // split list of movies into an array

    // for each movie
    for (let i in movieIDs) {
      try {
        const data = await (await fetch(omdburl + "&i=" + movieIDs[i])).json(); // get the data for that movie

        // push that onto an array of data
        movieData.push({
          id: movieIDs[i],
          title: data.Title,
          plot: data.Plot,
        });
      } catch (err) {
        console.log(err.message);
      }
    }
    setMovieData(movieData);
  };

  // function to get the movie ID from a title
  const getMovieID = async (title) => {
    const data = await (await fetch(omdburl + "&t=" + title)).json();
    let id = data.imdbID;
    return id;
  };

  const handleCreateUser = () => {
    if (userInput !== "") {
      getMovieID(userInput)
        .then((res) => {
          let movieIDs = res;

          setBackendData((backendData) => [
            ...backendData,
            {
              firstname: userFirstName,
              lastname: userLastName,
              favourite_movies: movieIDs,
            },
          ]);

          fetch("/insert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstname: userFirstName,
              lastname: userLastName,
              favourite_movies: movieIDs,
            }),
          })
            .then((res) => res.json())
            .catch((err) => console.log(err));
        })
        .then(() => {
          handleDataDisplay();
        });
    }
  };

  const handleAddMovie = () => {
    if (userInput !== "") {
      getMovieID(userInput)
        .then((res) => {
          var movieIDs = "";
          if (movieExists(res)) {
            movieIDs = getUsersMovieIDs();
          } else {
            movieIDs = getUsersMovieIDs() + "," + res;
          }

          updateLocalData(movieIDs);

          fetch("/update", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstname: userFirstName,
              lastname: userLastName,
              favourite_movies: movieIDs,
            }),
          })
            .then((res) => res.json())
            .catch((err) => console.log(err));
        })
        .then(() => {
          handleDataDisplay();
        });
    }
  };

  const handleDeleteUser = () => {
    setBackendData(
      backendData.filter(
        (user) =>
          user.firstname !== userFirstName && user.lastname !== userLastName
      )
    );
    fetch("/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: userFirstName,
        lastname: userLastName,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  };

  const handleDeleteMovie = () => {
    if (userInput !== "") {
      getMovieID(userInput)
        .then((res) => {
          var movieIDs = getUsersMovieIDs();
          if (movieExists(res)) {
            if (movieIDs.startsWith(res) && movieIDs.includes(",")) {
              movieIDs = movieIDs.replace(res + ",", "");
            } else if (!movieIDs.startsWith(res)) {
              movieIDs = movieIDs.replace("," + res, "");
            } else {
              movieIDs = "";
            }
          }

          if (movieIDs === "") {
            handleDeleteUser();
          } else {
            updateLocalData(movieIDs);
            fetch("/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                firstname: userFirstName,
                lastname: userLastName,
                favourite_movies: movieIDs,
              }),
            })
              .then((res) => res.json())
              .catch((err) => console.log(err));
          }
        })
        .then(() => {
          handleDataDisplay();
        });
    }
  };

  return (
    <div className="container text-center">
      <h1>Your Favourite Movies</h1>
      <div className="row">
        <div className="col">
          <UserInput
            placeholder="First Name"
            id="firstNameInput"
            onChange={handleChange}
          />
          <UserInput
            placeholder="Last Name"
            id="lastNameInput"
            onChange={handleChange}
          />
          <div className="col">
            <Button label="Create User" onClick={handleCreateUser} />
            <Button label="View Data" onClick={handleDataDisplay} />
            <Button label="Delete User" onClick={handleDeleteUser} />
          </div>
          <UserInput
            placeholder="Favourite Movie"
            id="favMovieInput"
            onChange={handleChange}
          />
          <div className="col">
            <Button label="Add Movie" onClick={handleAddMovie} />
            <Button label="Delete Movie" onClick={handleDeleteMovie} />
          </div>
        </div>
        <div className="col-8">
          <Table movies={movieData} />
        </div>
      </div>
    </div>
  );
}

export default App;

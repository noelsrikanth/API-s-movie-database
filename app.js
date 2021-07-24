const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server Started");
    });
  } catch (error) {
    console.log(`Db Error: ${error.message}`);
  }
};

initializeDbAndServer();

const movieDatabaseObjectToResponse = (DbObject) => {
  return {
    movieId: DbObject.movie_id,
    directorId: DbObject.director_id,
    movieName: DbObject.movie_name,
    leadActor: DbObject.lead_actor,
  };
};

const directorDatabaseToResponse = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//// GET MOVIE API

app.get("/movies/", async (request, response) => {
  const dbQuery = `SELECT *
    FROM movie
    ORDER BY movie_id`;

  const dbResponse = await db.all(dbQuery);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

/// GET single movie details

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;

  const dbResponse = await db.get(getMovieQuery);
  response.send(movieDatabaseObjectToResponse(dbResponse));
});

/// POST movieData

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const newMovieDetails = `INSERT INTO 
  movie(director_id, movie_name, lead_actor)
  VALUES (
      '${directorId}',
      '${movieName}',
      '${leadActor}'
  )`;
  const dbResponse = await db.run(newMovieDetails);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//// UPDATING movie details

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;
  const dbResponse = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

/// DELETE movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = `DELETE FROM movie
WHERE movie_id = ${movieId};`;

  const dbResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

/// GET directors

app.get("/directors/", async (request, response) => {
  const directorQuery = `SELECT *
    FROM director`;
  const dbResponse = await db.all(directorQuery);
  response.send(
    dbResponse.map((eachDirector) => directorDatabaseToResponse(eachDirector))
  );
});

// GET movie name by director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const dirMovieSearch = `SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId}
    `;

  const dbResponse = await db.all(dirMovieSearch);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;

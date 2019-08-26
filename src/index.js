const express = require("express"),
  fetch = require("node-fetch");

const { PORT = 4000, HOST = "0.0.0.0" } = process.env;

const app = express();

const redisClient = require("./redis-client");

app.get("/repos/:username", cache, getRepos);

// Make request to Github for data
async function getRepos(req, res, next) {
  try {
    console.log("Fetching Data...");

    const { username } = req.params;

    const response = await fetch(`https://api.github.com/users/${username}`);

    const data = await response.json();

    const repos = data.public_repos;

    redisClient.setex(username, 3600, repos);

    res.send(setResponse(username, repos));
  } catch (e) {
    console.error(e);
    res.status(500);
  }
}

function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

// Cache middleware
async function cache(req, res, next) {
  console.log("Looking Cache...");
  const { username } = req.params;

  // check if value is in cache
  redisClient.get(username, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      return res.send(setResponse(username, data));
    }
    
    next();
  });
}

app.listen(PORT, HOST, err => {
  try {
    console.log(`Node App running on http://${HOST}:${PORT}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

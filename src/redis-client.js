const redis = require("redis");

const { REDIS_PORT = 6379 } = process.env;

const client = redis.createClient(REDIS_PORT);

console.log(`Redis Server Connected: ${client.address}`);

exports.setex = async function(username, seconds, value, cb) {
  client.setex(username, seconds, value, cb);
};

exports.get = async function(username, cb) {
  client.get(username, cb);
};

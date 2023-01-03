const Config = {
  JWT_SECRET: process.env.JWT_SECRET,
  CONNECTION_URI: process.env.CONNECTION_URI,
  API_ROOT: "/.netlify/functions/server",
  LOCAL_PORT: 8080,
};
module.exports = Config;

require("dotenv").config({ path: "./utils/.env.test" });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

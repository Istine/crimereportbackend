const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
const fetchUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM users", (err, results) => {
      if (err) reject(err.message);
      console.log(results.rows);
      resolve(results.rows);
    });
  });
};

const createUser = (data) => {
  const { first_name, last_name, email, password, trackingid } = data;
  return new Promise((resolve, reject) => {
    pool.query(
      "INSERT INTO users (firstname, lastname, email, password, trackingid) VALUES ($1, $2, $3, $4, $5)",
      [first_name, last_name, email, password, trackingid],
      (err, results) => {
        if (err) reject(err.message);
        resolve(results.row);
      }
    );
  });
};

module.exports = {
  fetchUsers,
  createUser,
};

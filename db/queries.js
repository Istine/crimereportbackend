const { Pool } = require("pg");
const format = require("pg-format");
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
const checkUser = (email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT email, password FROM users WHERE email = $1 AND password = $2",
      [email, password],
      (err, results) => {
        if (err) reject(err.message);
        resolve(results.rows);
      }
    );
  });
};

const allUsers = () => {
  return new Promise((resolve, reject) => {
    pool.query("SELECT * FROM users", (err, results) => {
      if (err) reject(err.message);
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
        resolve();
      }
    );
  });
};

const findSessionById = (sessionID) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT * FROM user_sessions WHERE sid = $1",
      [sessionID],
      (err, results) => {
        if (err) reject(err);
        resolve(results.rows);
      }
    );
  });
};

const createReport = (data) => {
  return new Promise((resolve, reject) => {
    try {
      pool.query(
        `INSERT INTO cases (plaintiff, complaint, offender, case_id) VALUES ($1, $2, $3, $4)
        `,
        data,
        (err, results) => {
          if (err) reject(err);
          resolve(results);
        }
      );
    } catch (err) {}
  });
};

const saveFileLocation = async (data) => {
  try {
    let query = format(
      `INSERT INTO files (location, file_id) VALUES %L returning id`,
      data
    );
    const res = await pool.query(query, (err, results) => {
      if (err) throw err;
      return results;
    });
    return res;
  } catch (err) {
    console.log(err);
  }
};

const fetchCasesByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      ` SELECT * FROM cases, files WHERE case_id=file_id AND plaintiff = $1`,
      [email],
      (err, results) => {
        if(err) reject(err)
        resolve(results)
      }
    )
  })
  
};

module.exports = {
  checkUser,
  createUser,
  allUsers,
  findSessionById,
  createReport,
  saveFileLocation,
  fetchCasesByEmail,
};

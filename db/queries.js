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

const createOfficer = (data) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `INSERT INTO officers (first_name, last_name, email, password, date_of_birth, rank) VALUES ($1, $2, $3, $4, $5, $6)`,
      data,
      (err, results) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(results);
      }
    );
  });
};

const checkOfficer = (email, password) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT email, password FROM officers where email = $1 AND password = $2`,
      [email, password],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
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

const fetchCasesByEmail = (email) => {
  return new Promise((resolve, reject) => {
    pool.query(
      ` SELECT * FROM cases, files WHERE case_id=file_id AND plaintiff = $1`,
      [email],
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

//UPDATE CASES BY ID
const updateCaseById = (data) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE cases SET plaintiff = $1, complaint = $2, offender = $3  WHERE case_id= $4`,
      data,
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

const deleteCaseById = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`DELETE FROM cases WHERE case_id = $1`, [id], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const deleteAllFiles = (id) => {
  return new Promise((resolve, reject) => {
    pool.query(`DELETE FROM files WHERE file_id = $1`, [id], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const deleteFileByName = (data) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `
      DELETE FROM files WHERE file_id = $1 AND location = $2`,
      data,
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

const getFileNamesFromDB = async (id) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT location from files WHERE file_id= $1`,
      [id],
      (err, results) => {
        if (err) reject(err);
        resolve(results.rows);
      }
    );
  });
};

const updateProfilePic = (data) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE users SET profile_picture = $1 WHERE email = $2`,
      data,
      (err, results) => {
        if (err) reject(err);
        resolve(results);
      }
    );
  });
};

//Helper function to generate format for sql command
const sqlFormat = (keys) => {
  let sql = "";
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      sql += key + " =$" + (index + 1).toString() + " ";
    } else {
      sql += key + " =$" + (index + 1).toString() + ", ";
    }
  });
  return sql;
};
const updateProfileDetails = (data) => {
  const sql =
    "UPDATE users SET " +
    sqlFormat(Object.keys(data.object)) +
    "WHERE email=$" +
    data.values.length;
  console.log(sql);
  return new Promise((resolve, reject) => {
    pool.query(sql, data.values, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const getAvailableInvestigators = async () => {
  try {
    const res = await pool.query(
      `SELECT * FROM officers WHERE rank = $1`,
      ["investigator"]
    );
    return res;
  } catch (error) {
    return {
      error,
    };
  }
};

const getAllPendingCases = async () => {
  try {
    const results = await pool.query(`SELECT * FROM cases WHERE assigned_officer = $1`, ['empty'])
    return results
  } catch (error) {
    return err
  }
};

const updateCaseInfo = async (officer, case_id) => {
  try {
    const res = await pool.query(
      `
      UPDATE officers 
      SET assigned_case = $1,
      assigned_case_id = $2,
      cases_count = $3
      WHERE email = $4
    `,
      officer
    );
    const secondRes = await pool.query(
      `UPDATE cases 
      SET assigned_officer = $1
      WHERE case_id = $2`,
      case_id
    );
    return {
      res,
      secondRes,
    };
  } catch (error) {
    return {
      error,
    };
  }
};

const updateCaseStatusById = async (data) => {
  try {
    const res = await pool.query(
      `UPDATE cases SET status = $1 WHERE case_id=$2`,
      data
    );
    return res;
  } catch (error) {
    return error;
  }
};



module.exports = {
  checkUser,
  createUser,
  allUsers,
  findSessionById,
  createReport,
  saveFileLocation,
  fetchCasesByEmail,
  updateCaseById,
  deleteCaseById,
  deleteFileByName,
  deleteAllFiles,
  getFileNamesFromDB,
  updateProfilePic,
  updateProfileDetails,
  checkOfficer,
  createOfficer,
  getAvailableInvestigators,
  updateCaseInfo,
  updateCaseStatusById,
  getAllPendingCases,
};

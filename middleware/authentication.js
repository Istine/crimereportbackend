//import modules
const fs = require("fs");
const path = require("path");
const {
  checkUser,
  findSessionById,
  checkOfficer,
  createOfficer,
} = require("../db/queries");
const crypto = require("crypto");

const validate = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      checkUser(email, encryptPassword(password))
        .then((results) => {
          if (results.length > 0) {
            req.user = results;
            req.session.errors = null;
            req.session.email = email;
            next();
            return;
          } else {
            return res.status(401).json({
              message: "No user found",
            });
          }
        })
        .catch((err) => {
          return res.status(500).json({
            message: "error when fecthing details",
          });
        });
    } else {
      let logs = {
        ip_address: req.connection.remoteAddress || req.socket.remoteAddress,
        message: "Error logging in with this user..",
      };
      logger(logs);
      return res.status(400).json({ message: "Bad request.." });
    }
  } catch (err) {
    return res.status(400).json({ message: "Bad request.." });
  }
};

//const authentication officers
const validateOfficer = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      checkOfficer(email, encryptPassword(password))
        .then((data) => {
          if (data.rows) {
            req.user = data.rows;
            req.session.errors = null;
            req.session.email = email;
            next();
            return;
          } else {
            return res.status(401).json({
              message: "User not found",
            });
          }
        })
        .catch((err) => {
          return res.status(500).json({
            message: "error validating user. no user found",
          });
        });
    }
    else {
      return res.status(400).json({
        message:"Please fill in all fields."
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong..",
    });
  }
};

const logger = (login_error) => {
  const today = new Date();
  let currentDate =
    today.getFullYear() + "" + today.getMonth() + "" + today.getDate();
  let time =
    today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
  try {
    fs.writeFile(
      __dirname + "/../logs/" + currentDate + time + ".txt",
      JSON.stringify(login_error),
      (err) => {
        if (err) throw err;
        return;
      }
    );
  } catch (error) {
    console.log(error.message);
  }
};

const siginup = (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      let logs = {
        ip_address: req.connection.remoteAddress || req.socket.remoteAddress,
        message: "Error Signing up this user..",
      };
      logger(logs);
      return res.status(400).json({
        message: "Problem encountered.. Some required fields are missing..",
      });
    }
    next();
    return;
  } catch (err) {
    let logs = {
      ip_address: req.connection.remoteAddress || req.socket.remoteAddress,
      message: err,
    };
    logger(logs);
    return res.status(400).json({
      message: "Bad request",
    });
  }
};

const newofficer = (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      date_of_birth,
      rank,
    } = req.body;
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !date_of_birth ||
      !rank
    ) {
      return res.status(400).json({
        messgae: "Please fill in all fields.",
      });
    }
    const data = [first_name, last_name, email, encryptPassword(password), date_of_birth, rank];
    createOfficer(data)
      .then((data) => {
          next();
          return;        
      })
      .catch((err) => {
        let logs = {
          ip_address: req.connection.remoteAddress || req.socket.remoteAddress,
          message: err,
        };
        logger(logs);
        return res.status(400).json({
          message:
            "could not create new officer. Please check the details provided and try again.",
        });
      });
  } catch (error) {
    return res.status(500).json({
      message: "Could not complete your request. Please try again",
    });
  }
};

const isSessionExpired = (req) => {
  try {
    if (
      new Date(Date.now() + 3600000) > new Date(req.session.cookie._expires)
    ) {
      req.user = null;
      req.session.destroy(function (err) {
        if (err) throw err;
        return;
      });
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
  }
};

const isAuthorized = (req, res, next) => {
  try {
    if (req.session && req.sessionID && isSessionExpired(req)) {
      findSessionById(req.sessionID)
        .then((results) => {
          if (
            results.length > 0 &&
            results[0].sess.email == req.session.email
          ) {
            //authorized
            next();
            return;
          } else {
            // unauthorized
            return res.status(401).json({
              message: "This user is Unauthorized",
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      // unauthorized
      res.status(401).json({
        message: "Expired session",
      });
    }
  } catch (error) {}
};

//function to encrypt password
const encryptPassword = (password) => {
  const hash_pass = crypto
    .createHmac("SHA256", process.env.HASH_PASSWORD)
    .update(password)
    .digest("hex");
  return hash_pass;
};

const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if(err) {
      return res.status(500).json({
        message:"error logging out.."
      })
    }
    next()
    return
  })
}

module.exports = {
  validate,
  logger,
  siginup,
  isAuthorized,
  encryptPassword,
  validateOfficer, 
  newofficer,
  logout,
};

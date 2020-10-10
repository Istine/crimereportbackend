//import modules
const fs = require("fs");
const path = require("path");
const { checkUser, findSessionById } = require("../db/queries");

const validate = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      checkUser(email, password).then((results) => {
        req.user = results;
        req.session.errors = null;
        req.session.email = email;
        next();
        return;
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
  }
};

const isSessionExpired = (dbresults) => {

}

const isAuthorized = (req, res, next) => {
  if (req.session && req.sessionID) {
    findSessionById(req.sessionID)
      .then((results) => {
        if (results.length > 0 && results[0].sess.email == req.session.email) {
          //authorized
          console.log(`${results[0].sess.email} is authorized`)
          next();
        }
        else {
          // unauthorized
          res.status(401).json({
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
};

module.exports = {
  validate,
  logger,
  siginup,
  isAuthorized,
};

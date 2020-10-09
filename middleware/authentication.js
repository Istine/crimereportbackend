//import modules
const fs = require("fs");
const path = require("path");

const validate = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      console.log(email, password);
      next();
      return;
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
      return res.status(400).json({ message: "Problem encountered.. Some required fields are missing.." });
    }
    next();
    return
  } catch (err) {
    let logs = {
      ip_address: req.connection.remoteAddress || req.socket.remoteAddress,
      message: err
    };
    logger(logs);
  }
};

module.exports = {
  validate,
  logger,
  siginup
};

/* Utility functions for sucessfully logged in users */

//Import statements
const {
  createReport,
  saveFileLocation,
  fetchCasesByEmail,
} = require("../db/queries");
const path = require("path");
const fs = require("fs");

const getFileNames = (files, file_id) => {
  const filenames = files.map((file) => {
    return [file.filename, file_id];
  });

  return filenames;
};

//middleware function for handling creating a new report
const reportHandler = (req, res, next) => {
  try {
    const { complaint, offender, case_id } = req.body;
    let plaintiff = req.session.email;
    const data = [plaintiff, complaint, offender, case_id];
    createReport(data)
      .then((results) => {
        if (req.files) {
          saveFileLocation(getFileNames(req.files, case_id))
            .then((count) => {
              next();
              return;
            })
            .catch((err) => console.log(err));
        }
        next();
        return;
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    return res.status(500).json({
      message: {
        message: "Something went wrong!:)",
      },
    });
  }
};

//GET ALL CASES AND DETAILS RELATED TO PARTICULAR USER
const getUserCases = (req, res, next) => {
  fetchCasesByEmail(req.session.email)
    .then(({rows}) => {
      req.cases = rows;
      console.log(rows)
      next();
      return;
    })
    .catch((err) => {
      return res.status(500).json({
        message: "error fetching details",
      });
    });
};

module.exports = {
  reportHandler,
  getUserCases,
};

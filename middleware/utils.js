/* Utility functions for sucessfully logged in users */

//Import statements
const { createReport, saveFileLocation } = require("../db/queries");
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
    const { plaintiff, complaint, offender, case_id } = req.body;
    const data = [plaintiff, complaint, offender, case_id];
    createReport(data)
      .then((results) => {
        if(req.files) {
          saveFileLocation(getFileNames(req.files, case_id))
          .then((count) => {
            next();
            return;
          })
          .catch((err) => console.log(err));  
        }
        next()
        return
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

module.exports = {
  reportHandler,
};

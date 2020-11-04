/* Utility functions for sucessfully logged in users */

//Import statements
const {
  createReport,
  saveFileLocation,
  fetchCasesByEmail,
  updateCaseById,
  deleteFileByName,
  deleteCaseById,
  deleteAllFiles,
  getFileNamesFromDB,
  updateProfilePic,
  updateProfileDetails,
  getAvailableInvestigators,
  updateCaseInfo,
  updateCaseStatusById,
  getAllPendingCases,
} = require("../db/queries");
const path = require("path");
const fs = require("fs");
const { Console } = require("console");

//FUNCTION FOR GETTING FILE NAMES
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
    .then(({ rows }) => {
      req.cases = rows;
      console.log(rows);
      next();
      return;
    })
    .catch((err) => {
      return res.status(500).json({
        message: "error fetching details",
      });
    });
};

//FUNCTION TO UPDATE CASE
const updateCase = (req, res, next) => {
  const { plaintiff, complaint, offender, case_id } = req.body;
  if (!plaintiff || !complaint || !offender || !case_id) {
    return res.status(400).json({
      message: "Please fill in all fields.",
    });
  } else {
    const data = [plaintiff, complaint, offender, case_id];
    updateCaseById(data)
      .then((result) => {
        next();
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: "Something went wrong!",
        });
      });
  }
};

// FUNCTION TO UPDATE FILES
const updateFiles = (req, res, next) => {
  if (req.files) {
    const { case_id } = req.body;
    saveFileLocation(getFileNames(req.files, case_id))
      .then((count) => {
        next();
        return;
      })
      .catch((err) => console.log(err));
  } else {
    return res.status(200).json({
      message: "Np update made.",
    });
  }
};

//DELETE ALL FILES FROM FILE SYSTEM
const deleteFilesFromDIR = async (id) => {
  try {
    const response = await getFileNamesFromDB(id);
    if (response.length > 0) {
      response.forEach((file) => {
        fs.unlink(
          path.join(__dirname, "/../uploads/" + file.location),
          (err) => {
            if (err) throw err;
          }
        );
      });
    }
    return;
  } catch (err) {
    console.log(err);
  }
};

//DELETE CASE
const deleteCase = (req, res, next) => {
  try {
    const { case_id } = req.body;
    if (!case_id) {
      return res.status(400).json({
        message: "missing required field.",
      });
    }
    deleteCaseById(case_id).then((success) => {
      if (success) {
        deleteFilesFromDIR(case_id).then((res) => {
          deleteAllFiles(case_id).then((success) => {
            next();
            return;
          });
        });
      } else {
        return res.status(500).json({
          message: `could not delete files for this case! ${case_id}`,
        });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong :( Please try again.",
    });
  }
};

//FUNCTION TO DELETE FILE
const deleteFile = (req, res, next) => {
  try {
    const { file_id, file_name } = req.body;
    if (!file_id || !file_name) {
      return res.status(400).json({
        message: "Please fill in all fields.",
      });
    }
    const data = [file_id, file_name];
    deleteFileByName(data)
      .then((result) => {
        fs.unlink(path.join(__dirname, "/../uploads/" + file_name), (err) => {
          if (err) {
            return res.status(500).json({
              message: "file cannot be deleted!",
            });
          }
          next();
          return;
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: "Something went wrong! Plese try again",
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

//FUNCTION TO GET FILE NAME PP = PROFILE PICTURE
const getPPFileName = (fileObj) => {
  if (fileObj) {
    return fileObj.filename;
  }
};

//FUNCTION TO UPDATE PROFILE PICTURE TO DATABASE
const uploadProfilePicture = (req, res, next) => {
  try {
    const filename = getPPFileName(req.file);
    if (!filename)
      return res.status(400).json({
        message: "Please Select a file",
      });
    const data = [filename, req.session.email];
    updateProfilePic(data)
      .then((success) => {
        next();
      })
      .catch((err) => {
        return res.status(500).json({
          message: "failed to update profile picture. Please try again.",
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const updateProfileData = (req, res, next) => {
  try {
    let values = Object.values(req.body);
    values.push(req.session.email);
    const data = {
      object: req.body,
      values,
    };
    if (values) {
      updateProfileDetails(data)
        .then((success) => {
          next();
          return;
        })
        .catch((err) => {
          return res.status(500).json({
            message: "Problem Updating records. Please try again",
          });
        });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong. Please try again",
    });
  }
};

//function to assign cases randomly to available officers

const updateCaseStatus = (req, res, next) => {
  try {
    const { case_id, status } = req.body;
    if (!case_id || !status) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }
    updateCaseStatusById([status, case_id])
      .then((data) => {
        next();
        return;
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Error encounterred.Please try again. :)",
        });
      });
  } catch (error) {
    return res.status(500).join({
      message: "Something went wrong. Please try again. :)",
    });
  }
};

const assignCaseTo = async () => {
  let investigators = await getAvailableInvestigators();
  let cases = await getAllPendingCases();
  console.log(cases.rows.length, investigators.rows.length)
  if (cases.rows.length > 0 && investigators.rows.length > 0) {
    cases.rows.forEach(async (item) => {
      let random = Math.floor(Math.random() * investigators.rows.length + 0);
      if (
        !(investigators.rows[random].cases_count >= 4) &&
        (investigators.rows.length > 0)
      ) {
        let arr = "ARRAY" + investigators.rows[random].assigned_case_id === null ? [item.case_id] : [...investigators.rows[random].assigned_case_id, item.case_id]
        let update = await updateCaseInfo(
          [
            "t",
            arr,
            investigators.rows[random].cases_count + 1,
            investigators.rows[random].email,
          ],
          [investigators.rows[random].email, item.case_id]
        );
        console.log(update)
        investigators = await getAvailableInvestigators();
      } else {
        investigators = await getAvailableInvestigators();
        let update = await updateCaseInfo(
          [
            "t",
            "ARRAY" +
              [...investigators.rows[random].assigned_case_id, item.case_id],
            Number(investigators.rows[random].cases_count) + 1,
            investigators.rows[random].email,
          ],
          [investigators.rows[random].email, item.case_id]
        );
      }
    });
    return;
  } else {
    console.log("naaa");
    return;
  }
};

//Interval for giving cases to officers
let interval = setInterval(() => {
  assignCaseTo();
}, 3000); // every 30 minues to cases are assigned


//get all cases for particular investigator by id of case assigned

module.exports = {
  reportHandler,
  getUserCases,
  updateCase,
  updateFiles,
  deleteCase,
  deleteFile,
  uploadProfilePicture,
  updateProfileData,
  updateCaseStatus,
};

const express = require("express");
const router = express.Router();
const { isAuthorized } = require("../middleware/authentication");
const {
  reportHandler,
  getUserCases,
  updateCase,
  updateFiles,
  deleteFile,
} = require("../middleware/utils");
const multer = require("multer");
const path = require("path");

//MULTER CONFIG
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/../uploads"));
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

//DASHBOARD ROUTE
router.get("/dashboard", isAuthorized, (req, res) => {
  res.status(200).json({
    message: "dashboard",
  });
});

//CREATE CASES
router.post(
  "/report",
  isAuthorized,
  upload.array("images"),
  reportHandler,
  (req, res) => {
    res.status(200).json({
      message: "Sucessfully created..",
    });
  }
);

//GETTING ALL CASES
router.get("/cases", isAuthorized, getUserCases, (req, res) => {
  res.status(200).json({
    message: "success!",
    cases: req.cases,
  });
});

//UPDATING CASE DETAILS
router.put("/update-case", isAuthorized, updateCase, (req, res) => {
  res.status(200).json({
    message: "Updated!",
  });
});

//UPDATE DOCUMENTS UPLOADED
router.put(
  "/update-files",
  isAuthorized,
  upload.array("images"),
  updateFiles,
  (req, res) => {
    res.status(200).json({
      message: "done!",
    });
  }
);

// DELETE A FILE
router.delete("/delete-file", isAuthorized, deleteFile, (req, res) => {
  res.status(200).json({
    message: `${req.body.file_name} deleted!`,
  });
});
module.exports = router;

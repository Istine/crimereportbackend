const express = require('express')
const router = express.Router()
const { isAuthorized } = require('../middleware/authentication')
const { reportHandler, getUserCases } = require('../middleware/utils')
const multer = require('multer')
const path = require('path')

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '/../uploads'))
  },

  filename: function(req, file, cb) {
    cb(null, Date.now()  + path.extname(file.originalname))
  }
})
const upload = multer({storage})
router.get('/dashboard', isAuthorized, (req, res) => {
    res.status(200).json({
        message:"dashboard"
    })
})

router.post('/report', isAuthorized, upload.array('images'), reportHandler, (req, res) => {  
    res.status(200).json({
        message:"Sucessfully created.."
    })
})

router.get('/cases', isAuthorized, getUserCases, (req, res) => {
  res.status(200).json({
    message: "success!",
    cases: req.cases
  })
})

module.exports = router
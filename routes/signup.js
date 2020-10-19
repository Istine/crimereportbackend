const express = require("express")
const router = express.Router()
const { siginup, encryptPassword } = require("../middleware/authentication")
const { createUser } = require('../db/queries')

router.post("/", siginup, (req, res) => {
    req.body.password = encryptPassword(req.body.password)
    createUser(req.body).then((results) => {
        res.status(200).json({
            message:"Sign up successful.. Welcome!"
        });
      });
})

module.exports = router
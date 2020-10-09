const express = require("express")
const router = express.Router()
const { siginup } = require("../middleware/authentication")
const { createUser } = require('../db/queries')

router.post("/", siginup, (req, res) => {
    createUser(req.body).then((results) => {
        res.status(200).json({
            message:"Sign up successful.. Welcome!"
        });
      });
})

module.exports = router
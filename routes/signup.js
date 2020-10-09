const express = require("express")
const router = express.Router()
const { siginup } = require("../middleware/authentication")

router.post("/", siginup, (req, res) => {
    res.status(200).json({
        message:"Sign up successful.. Welcome!"
    })
})

module.exports = router
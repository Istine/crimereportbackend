const express = require("express")
const router = express.Router()
const { validate } = require("../middleware/authentication")

router.post("/", validate,  (req, res) => {
    res.status(200).json({
        message:"Welcome"
    })
})

module.exports = router
const express = require("express")
const router = express.Router()
const { validate } = require("../middleware/authentication")

router.post("/", validate,  (req, res) => {
    const {user} = req
    res.status(200).json({
        user:user,
        message:"Welcome!.."
    })
})

module.exports = router
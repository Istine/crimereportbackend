const express = require("express")
const router = express.Router()
const { validate, isAuthorized } = require("../middleware/authentication")
const { allUsers } = require('../db/queries')


router.post("/", validate, (req, res) => {
    const {user} = req
    res.cookie("user_session", req.session.cookie)
    res.setHeader('content-type', 'application/json')
    res.status(200).json({
        user:user,
        message:"Welcome!.."
    })
})

router.get('/users', isAuthorized, (req, res) => {
    allUsers().then(results => {
        res.status(200).json({
            results: results
        })
    })
})

module.exports = router
const express = require('express')
const router = express.Router()
const { isAuthorized } = require('../middleware/authentication')

router.get('/dashboard', isAuthorized, (req, res) => {
    res.status(200).json({
        message:"dashboard"
    })
})

module.exports = router
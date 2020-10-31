const express = require('express')

const router = express.Router()

const { validateOfficer, newofficer, logout, } = require('../middleware/authentication')

router.post('/signup', newofficer, (req, res) => {
    res.status(200).json({
        message:` Successfully added ${req.body.email}`,
    })
} )

router.post('/login', validateOfficer, (req, res) => {
    res.status(200).json({
        message:` Welcome ${req.email}`,
        results: req.user
    })
} )

router.get('/logout', logout, (req, res) => {
    res.status(200).json({
        message:"logged out successfully.."
    })
})

module.exports = router
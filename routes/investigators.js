const express = require('express')
const router = express.Router()
const {isAuthorized } = require('../middleware/authentication')
const { updateCaseStatus } = require('../middleware/utils')

router.get('/portal', isAuthorized, (req, res) =>{
    res.status(200).json({
        message:`Welcome ${req.session.email}`
    })
})

router.put('/update-case-status', isAuthorized, updateCaseStatus, (req, res) => {
    res.status(200).json({
        message:"Done!"
    })
})

module.exports = router
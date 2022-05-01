const express = require('express')
const actions = require('../methods/actions')
const router = express.Router()

// Home route
router.get('/', (req, res) => {res.send('Welcome to Paddy - Server')})

// Adding a new user to the Database
router.post('/adduser', actions.addNew)

// Authenticating a user's password
router.post('/authenticate', actions.authenticate)

// Obtaining information on a user
router.get('/getinfo', actions.getinfo)

// User's password request
router.post('/reset-password', actions.resetPassword)

// Resetting the user's password
router.put('/update-password', actions.updatePassword)

module.exports = router


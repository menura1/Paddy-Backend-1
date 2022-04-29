const express = require('express')
const actions = require('../methods/actions')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Welcome to Paddy - Server')
})

router.get('/dashboard', (req, res) => {
    res.send('Dashboard World')
})

// Adding a new user to the Database
router.post('/adduser', actions.addNew)

// Authenticating a user's password
router.post('/authenticate', actions.authenticate)


// Obtaining information on a user
router.get('/getinfo', actions.getinfo)

// Resetting a user's password
router.put('/reset-password', actions.resetPassword)

module.exports = router
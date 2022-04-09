const express = require('express')
const actions = require('../methods/actions')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World')
})

router.get('/dashboard', (req, res) => {
    res.send('Dashboard World')
})

// Adding a new user to the Database
router.post('/adduser', actions.addNew)

// Activating a user account through email
router.post('/email-activate', actions.activateAccount)

// Authenticating a user's password
router.post('/authenticate', actions.authenticate)

// Obtaining information on a user
router.get('/getinfo', actions.getinfo)

// Forgot password function
router.put('/forgot-password', actions.forgotPassword)

// Password Reset
router.put('/reset-password', actions.resetPassword)

module.exports = router
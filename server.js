const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const passport = require('passport')
const bodyParser = require('body-parser')
const connectDB = require('./config/db')
const routes = require('./routes/index')

connectDB()

const app = express() 

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(cors())
app.use(bodyParser.urlencoded({extended: false }))
app.use(bodyParser.json())
app.use(routes)

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log('Server running in ' + process.env.NODE_ENV + " mode on port " + PORT))
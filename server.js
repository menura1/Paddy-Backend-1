const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require("cookie-parser")
const connectDB = require('./config/db')
const routes = require('./routes/index')

require('dotenv').config() //to use env variables

connectDB()

const app = express() 

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(cors())
app.use(bodyParser.urlencoded({extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(routes)
app.use(passport.initialize()) 
require('./config/passport')(passport)

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log('Server running in ' + process.env.NODE_ENV + " mode on port " + PORT))
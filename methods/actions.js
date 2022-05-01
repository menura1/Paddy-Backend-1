var jwt = require('jwt-simple')
const otpGen = require('otp-generator')
const req = require('express/lib/request')
var mail_config = require('../config/mailconfig')
const mailgun = require("mailgun-js")
const mg = mailgun({apiKey: mail_config.MAILGUN_APIKEY, domain: mail_config.DOMAIN})

var User = require('../models/user')
var config = require('../config/dbconfig')
const { is } = require('express/lib/request')

var functions = {
    addNew: function (req, res) {
        if((!req.body.email) || (!req.body.password) || (!req.body.name) || (!req.body.phoneNumber)) {
            res.json({success: false, msg: 'Please enter all fields.'})
        }

        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (user) {
                res.status(403).send({success: false, msg: "The email has already been registered."})
            }   
            else {
                var newUser = User({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    phoneNumber: req.body.phoneNumber
                })
                newUser.save(function (err, newUser) {
                    if (err) {
                        res.json({success: false, msg: 'Failed to save User.'})
                    } 
                    else {
                        res.json({suceess: true, msg: 'User was successfully saved.'})
                    }
                })
            }
        })
    },
    authenticate: function (req, res) {
        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (err) throw err
            if (!user) {
                res.status(403).send({success: false, msg: "Authentication failed. User not found."})
            }
            else {
                user.comparePassword(req.body.password, function(err, isMatch) {
                    if (isMatch && !err) {
                        var token = jwt.encode(user, config.secret) 
                        res.json({success: true, token: token})
                    }
                    else {
                        return res.status(403).send({success: false, msg: "Authentication failed. Wrong password."})
                    }
                })
            }
        })
    },
    getinfo: function (req, res) {
        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodetoken = jwt.decode(token, config.secret)
            return res.json({success: true, name: decodetoken.name, email: decodetoken.email, phoneNumber: decodetoken.phoneNumber})
        }
        else {
            return res.json({success: false, msg: 'No Headers.'})
        }
    },
    resetPassword: function(req, res) {
        const email = req.body.email
        User.findOne({email}, function (err, user) {
            if (err || !user) {
                res.status(400).send({success: false, msg: "User not found"})
            } else {
                const OTP = otpGen.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})
                User.resetOTP = OTP
                console.log(OTP)

                const data = {
                    from: 'noreply@hello.com',
                    to: email,
                    subject: 'Paddy - Reset Password OTP',
                    html:`
                    <h2>Please use the following OTP to reset your password.</h2>
                    <p>OTP : ${OTP}</p>
                    `
                }

                mg.messages().send(data, function (error, body) {
                    if (error) {
                        return res.json({success: false, msg: 'There was an error.'})
                    } else {
                        return res.json({message: 'Please check your email and follow the instructions to reset your password.'})  
                    }  
                })  
            }
        })
    }, 
    updatePassword: function(req, res) {
        const email = req.body.email
        const OTP = req.body.OTP
        const newPassword = req.body.newPassword

        User.findOne({email}, function (err, user) {
            if (err) throw err
            if (!user) {
                res.status(403).send({success: false, msg: "User not found."})
            }
            else {
                user.compareOTP(OTP, function(err, isMatch) {
                    if (isMatch && !err) {
                        user.password = newPassword
                        console.log(user.password)
                        res.json({success: true, msg: "Password was reset successfully."})
                    }
                    else {
                        return res.status(403).send({success: false, msg: "Authentication failed. Wrong OTP."})
                    }
                })
            }
        }
        )
    },
    updateInfo: function(req, res) {
        const email = req.body.email
        const name = req.body.name
        const phoneNumber = req.body.phoneNumber

        User.findOne({email}, function (err, user) {
            if (err) throw err
            if (!user) {
                res.status(403).send({success: false, msg: "User not found."})
            }
            else {
                var updatingUser = User({
                    name: req.body.name,
                    phoneNumber: req.body.phoneNumber
                })
                updatingUser.save(function (err, updatingUser) {
                    if (err) {
                        res.json({success: false, msg: 'Failed to save User.'})
                    } 
                    else {
                        res.json({suceess: true, msg: 'User was successfully saved.'})
                    }
                })
            }
        }
        )
        
    }     
}

module.exports = functions
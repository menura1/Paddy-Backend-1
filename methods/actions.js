var jwt = require('jwt-simple')
var jsonwt = require('jsonwebtoken')
var jwt_decode = require('jwt-decode')
const _ = require('lodash')
const jwtExpirySeconds = 1200

var User = require('../models/user')
var config = require('../config/dbconfig')
const { is } = require('express/lib/request')

var mail_config = require('../config/mailconfig')
const mailgun = require("mailgun-js")
const req = require('express/lib/request')
const API_KEY = 'f7b42fd8a3961454669dceef791e0cf9-0677517f-5ae865c9'
const DOMAIN = 'sandboxb923388cd1cb4169be012c1f13551f43.mailgun.org'
const mg = mailgun({apiKey: API_KEY, domain: DOMAIN})

var functions = {
    addNew: function (req, res) {
        const {email, password, name, dateOfBirth, phoneNumber} = req.body;
        console.log(email, password, name, dateOfBirth, phoneNumber)
        if((!email) || (!password) || (!name) || (!dateOfBirth) || (!phoneNumber)) {
            return res.json({success: false, msg: 'Please enter all fields.'})
        }

        User.findOne({email}).then(user => {
        if (user) {
            return res.status(401).send({success: false, msg: "Authentication failed. Email already registered."}).end()
            } 
        })
        
        const token = jsonwt.sign({email: email, password: password, name: name, dateOfBirth: dateOfBirth, phoneNumber: phoneNumber}, mail_config.JWT_ACCKEY)
        console.log("token:", token)
        
        const data = {
            from: 'Excited User <support-paddy@samples.mailgun.org>',
            to: email,
            subject: 'Account Activation Link',
            html: `
                <h2>Please click on the link to activate your account</h2>
                <p>${mail_config.SERVER_URL}authenticate/activate/${token}</p>
            `
        }
                        
        mg.messages().send(data, function (error, body) {
            console.log(body)
            res.json({message: 'Please check your email to activate your account.'})    
        })

    },activateAccount: function (req, res) {
        const token = req.body.token
        var decodedToken
        console.log(mail_config.JWT_ACCKEY)
        if (token) {
            decodedToken = jsonwt.verify(token, mail_config.JWT_ACCKEY)
            console.log(decodedToken)
            var newUser = User({
                email: decodedToken.email,
                password: decodedToken.password,
                name: decodedToken.name,
                dateOfBirth: decodedToken.dateOfBirth,
                phoneNumber: decodedToken.phoneNumber                                
            })              
            newUser.save(function (err, newUser) {
                if (err) {
                    console.log('Activation Error')
                } 
                else {
                    res.json({suceess: true, msg: 'User was successfully saved.'})
                }
            })  

        } else {
            return res.json({success: false, msg: 'Please activate your account before proceding.'})
        }
    
    },authenticate: function (req, res) {
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
        }
        )
    },getinfo: function (req, res) {
        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodetoken = jwt.decode(token, config.secret)
            return res.json({success: true, email: decodetoken.email})
        }
        else {
            return res.json({success: false, msg: 'No Headers.'})
        }
    },forgotPassword: function (req, res) {
        const email = req.body.email
        User.findOne({email}, function (err, user) {
            if (err || !user) {
                res.status(400).send({success: false, msg: "Authentication failed. Email does not exist."})
            } else {
                const token = jsonwt.sign({_id: user._id}, config.RESET_PW_KEY)
                console.log(token)
                const data = {
                    from: 'noreply@hello.com',
                    to: email,
                    subject: 'Paddy - Reset Password Link',
                    html:`
                    <h2>Please click on given link to reset your password</h2>
                    <p>${config.SERVER_URL}reset-password/${token}</p>
                    `
                }

                return User.updateOne({resetLink: token}, function(err, success) {
                    if (err) {
                        return res.status(400).json({success: false, msg: 'Failed to reset password.'})
                    } else {
                        mg.messages().send(data, function (error, body) {
                            if (error) {
                                return res.json({success: false, msg: 'There was an error.'})
                            } else {
                            return res.json({message: 'Please check your email and follow the instructions to reset your password.'})  
                            }  
                        })
                    }
                })
            }
        })
    },resetPassword: function (req, res) {
        const {resetLink, newPassword} = req.body
        if (resetLink) {
            jsonwt.verify(resetLink, mail_config.RESET_PW_KEY, function(err, decodedData) {
                if (err) {
                    return res.status(401).json({success: false, msg: "Incorrect or expired token."})
                }
                User.findOne({resetLink}, (err, user) => {
                    if (err || !user) {
                        res.status(400).send({success: false, msg: "User with this token does not exist"})
                    }
                    const obj = {
                        password: newPassword
                    }
                    user =  _.extend(user, obj)
                    user.save((err, result) => {
                            if (err) {
                            return res.status(400).json({success: false, msg: 'Reset Pasword Error.'})
                        } else {
                            return res.status(200).json({success: false, msg: 'Your password was changed successfully.'})
                        }
                    })
                })
            })
        } else {
            res.status(401).send({success: false, msg: "Authentication error."})
        }
    }
}

module.exports = functions
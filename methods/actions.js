var jwt = require('jwt-simple')

var User = require('../models/user')
var config = require('../config/dbconfig')
const { is } = require('express/lib/request')

var functions = {
    addNew: function (req, res) {
        if((!req.body.email) || (!req.body.password) || (!req.body.name) || (!req.body.dateOfBirth) || (!req.body.phoneNumber)) {
            res.json({success: false, msg: 'Please enter all fields.'})
        }
        else {
            var newUser = User({
                email: req.body.email,
                password: req.body.password,
                name: req.body.name,
                dateOfBirth: req.body.dateOfBirth,
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
        }
        )
    },
    getinfo: function (req, res) {
        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodetoken = jwt.decode(token, config.secret)
            return res.json({success: true, email: decodetoken.name})
        }
        else {
            return res.json({success: false, msg: 'No Headers.'})
        }
    },
    resetPassword: function (req, res) {
        var user = decodetoken.User
        if(!req.body.password) {
            res.json({success: false, msg: 'Please enter a valid password.'})
        }
        else { 
            var newUser = User({
                password: req.body.password
            })
            newUser.save(function (err, newUser) {
                if (err) {
                    res.json({success: false, msg: 'Failed to reset password.'})
                } 
                else {
                    res.json({suceess: true, msg: 'Password was successfully reset.'})
                }
            })
        }
    }
}

module.exports = functions
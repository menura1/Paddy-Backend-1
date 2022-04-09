var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
const { hash } = require('bcrypt')
var userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true
    },name: {
        type: String,
        require: true
    },dateOfBirth: {
        type: String,
        require: true
    },phoneNumber: {
        type: String,
        require:true
    }, resetLink: {
        data: String,
        default: ''
    }
})

userSchema.pre('save', function (next) {
    var user = this
    if(this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err)
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err)
                }
                user.password = hash
                next()
            })            
        })   
    } 
    else {
        return next()
    }
})

userSchema.methods.comparePassword = function (pw, cb) {
    bcrypt.compare(pw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err)
        }
        cb(null, isMatch)
    })
}

module.exports = mongoose.model('User', userSchema)
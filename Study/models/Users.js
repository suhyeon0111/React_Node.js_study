const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true,
        unique: 1       
    },
    password: {
        type: String,
        maxlength: 10
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image:String,
    token: {
        type:Number
    },
    tokenExp: {
        type: Number
    }
})

//저장하기 전에 
userSchema.pre('save', function(next){
    //비밀번호를 암호화 시킨다.
    var user = this;

    //비밀번호를 바꿀 때만 암호화를 하기 위해서
    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if(err) return next(err)
    
            bcrypt.hash(user.password, salt, function(err, hash) { //hash는 암호화 된 비밀번호
                if (err) return next(err)
                user.password = bcrypt.hash
                next()
            })
        })
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword 1234567 암호화된 패스워드 ~~~~~///둘이 같은지 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}


userSchema.methods.generateToken = function(cb) {

    var user = this;

    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token
    // ->

    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user) {
        //error가 있다면
        if(err) return cb(err);
        cb(null, user);
    })
}

const User = mongoose.model('User', userSchema)
module.exports = { User }
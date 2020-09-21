const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    userName:{
        type:String
    },
    password:{
        type:String
    },
    mail:{
        type:String
    },
    userPhoto:{
        type:String,
        default:'/uploads/default/user.png',
    },
    userBanType:{
        type:Number,
        default:0,
    },
    userMailCode:{
        type:String,
    },
    userCreated:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('Users', Users);

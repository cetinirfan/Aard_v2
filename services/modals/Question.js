const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Files = new Schema({
    question:{
        type:String
    },
    answer:{
        type:String
    },
    answerLength:{
        type:String
    },
});

module.exports = mongoose.model('Files', Files);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DailyQuestion = new Schema({
    question:{
        type:String
    },
    aOption:{
        type:String
    },
    bOption:{
        type:String
    },
    cOption:{
        type:String
    },
    dOption:{
        type:String
    },
    correctOption:{
        type:String
    },
    created:{type:Date}
});

module.exports = mongoose.model('DailyQuestion', DailyQuestion);
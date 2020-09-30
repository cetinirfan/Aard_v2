const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Store = new Schema({
    userName:{
        type:String
    },
    product:{
        type:String
    },
    productCount:{
        type:Number
    },
    price:{
        type:Number
    },
    created:{type:Date}
});

module.exports = mongoose.model('Store', Store);
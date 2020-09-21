const mongoose = require('mongoose');
  module.exports = () => {
    mongoose.connect('mongodb://aardv1:sadece0ben@ds011432.mlab.com:11432/heroku_swz5qp09', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});    
      mongoose.connection.on('open', () => {
      });
        mongoose.connection.on('error', (err) => {
        console.log('MongoDB: Error', err);
  });
        
  mongoose.Promise = global.Promise;
};

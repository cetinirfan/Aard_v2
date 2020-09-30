const mongoose = require('mongoose');
  module.exports = () => {
    mongoose.connect('mongodb+srv://aard_v2:sadece0ben@aardsoftware.k5a3c.mongodb.net/<dbname>?retryWrites=true&w=majority', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});    
      mongoose.connection.on('open', () => {
      });
        mongoose.connection.on('error', (err) => {
        console.log('MongoDB: Error', err);
  });
        
  mongoose.Promise = global.Promise;
};

const express = require('express')
const router = express.Router();

function OneSignal(message,token){
    var sendNotification = function(data) {
      var headers = {
      "Content-Type": "application/json; charset=utf-8"
      };
      
      var options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications", 
      method: "POST",
      headers: headers
      };
      
      var https = require('https');
      var req = https.request(options, function(res) {
      res.on('data', function(data) {
      console.log("Response:");
      console.log(JSON.parse(data));
      });
      });
      
      req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
      });
      
      req.write(JSON.stringify(data));
      req.end();
      };
      
      var message = {
      app_id: "75c12078-cbe8-47ec-b956-3b400a116ab5",
      contents: {"en": message },
      include_player_ids: token
      };
      
      sendNotification(message);
  };

  module.exports = OneSignal;
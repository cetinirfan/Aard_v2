var express = require('express');
const nodemailer =require('nodemailer');

function mailCodeSend(output,mail){
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'cetinnirfan@gmail.com',
        pass: 'sadece0ben'
      }
    });
    
    var mailOptions = {
      from: 'cetinnirfan@gmail.com',
      to: mail,
      subject: 'Sending Email using Node.js',
      text: output       
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
}

module.exports = mailCodeSend;
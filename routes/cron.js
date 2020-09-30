const express = require('express')
const router = express.Router();
const Users = require('../services/modals/Users');
const DailyQuestion = require('../services/modals/DailyQuestion');
const verifyToken = require('../services/middleware/verify-token');
var cron = require('node-cron');
const OneSignal = require('./oneSignal');

cron.schedule('0 0 * * *', () => {
    const userList = [];
    const tokenList = [];
    Users.find({},(err,allUser)=>{
        userList.push(allUser)
        userList[0].map(token=>{
            if(token.oneSignal!=='a'){
                tokenList.push(token.oneSignal)
            }
        })
    })
        const promise_v1 = Users.updateMany({}, { $set: {
        ticket:4
          } },{new: true})
          promise_v1.then(data=>{
              OneSignal('Biletlerin yenilendi hemen oyna!',tokenList)
              console.log('Güncelleme başarılı.');
          }).catch(err =>{
            console.log(err);
        })
        const promise_v2= DailyQuestion.aggregate(
            [
              { $match :{} },
              { $sort : { created : 1} },
              { $limit: 1 }
            ]);
            promise_v2.then(data=>{
            const questinId = data[0]._id
            DailyQuestion.findByIdAndRemove({_id:questinId},(err,doc)=>{
                console.log('silindi')
            })
        })
        const promise_v3 = Users.updateMany({}, { $set: {
            dailyQuestions:1
        } },{new: true})
        promise_v3.then(data=>{
            OneSignal('Günün sorusu seni bekliyor!',tokenList)
            console.log('Güncelleme başarılı.');
        }).catch(err =>{
            console.log(err);
        })
},{
    timezone:"Europe/Istanbul"
});

cron.schedule('1 0 * * mon', () => {
    const userList2 = [];
    const tokenList2 = [];
    Users.find({},(err,allUser)=>{
        userList2.push(allUser)
        userList2[0].map(token=>{
            if(token.oneSignal!=='a'){
                tokenList2.push(token.oneSignal)
            }
        })
    })
    const promise_v1 = Users.updateMany({}, { $set: {
        luckWheel:1
    } },{new: true})
    promise_v1.then(data=>{
        OneSignal('Biletlerin yenilendi hemen oyna!',tokenList)
        console.log('Güncelleme başarılı.');
    }).catch(err =>{
        console.log(err);
    })
    const promise_v2 = Users.updateMany({}, { $set: {
        weeklyScore:0
    } },{new: true})
    promise_v2.then(data=>{
        console.log('Güncelleme başarılı.');
    }).catch(err =>{
        console.log(err);
    })
},{
    timezone:"Europe/Istanbul"
});

cron.schedule('0 0 1 * *', () => {
    const promise_v1 = Users.updateMany({}, { $set: {
        monthlyScore:0
    } },{new: true})
    promise_v1.then(data=>{
        console.log('Güncelleme başarılı.');
    }).catch(err =>{
        console.log(err);
    })
},{
    timezone:"Europe/Istanbul"
});
module.exports = router;
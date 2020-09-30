const express = require('express')
const router = express.Router();
const Question = require('../services/modals/Question');
const Users = require('../services/modals/Users');
const DailyQuestion = require('../services/modals/DailyQuestion');
const verifyToken = require('../services/middleware/verify-token');

router.get('/dailyQuestion',verifyToken,(req,res)=>{
  Users.findOne({_id:req.user_id},(error,Users)=>{
    if(Users.dailyQuestions === 0){
      res.json({
        status: false,
        message: 'Günlük Soru Hakkını Kullandın.'});
    }else{
        const promise= DailyQuestion.aggregate(
            [
              { $match :{} },
              { $sort : { created : 1} },
              { $limit: 1 }
            ]);
        promise.then(data=>{
            res.json(data)
        })
    }
  })
});

router.post('/answerQuestion/:_questionId',verifyToken,(req,res)=>{
    const {answer} =req.body;
    DailyQuestion.findOne({_id:req.params._questionId},(error,doc)=>{
      if(doc.correctOption === answer){
        const promise_v1 = Users.updateOne({_id:req.user_id}, { $set: {
            dailyQuestions:0
        } },{new: true})
        promise_v1.then(data=>{
            Users.findOne({_id:req.user_id},(err,user)=>{
                if(user.ticket<4){
                  const newTicketCount = user.ticket+1;
                  Users.updateOne({_id:req.user_id}, { $set: {
                    ticket:newTicketCount
                  } },{new: true})
                  .exec()
                  .then(data=>{
                    res.json({
                      status: true,
                      message: 'Doğru.'});
                  }).catch(err =>{
                  res.json(err);
                })
                }
              })
        }).catch(err =>{
            res.json(err);
        })
      }else{
        const promise_v1 = Users.updateOne({_id:req.user_id}, { $set: {
            dailyQuestions:0
        } },{new: true})
        promise_v1.then(data=>{
            res.json({
                status: false,
                message: 'Yanlış.'});
        }).catch(err =>{
            res.json(err);
        })
    }
    })
  });

  router.get('/question',verifyToken,(req,res)=>{
    Users.findOne({_id:req.user_id},(error,Users)=>{
      if(Users.ticket === 0){
        res.json({
          status: false,
          message: 'Oyuna giriş biletin yoq.'});
        }else{
            const promise= Question.aggregate(
                [
                    { $match :{"answerLength": "3"} },
                    { $limit: 1 }
                ]);
            promise.then(data=>{
                const ID = doc._id;
                const status = Users.questionId.includes(ID)
                    if(status==true){
                        getQuestion()
                    }else{
                        res.json(data)
                    }  
            })
        }
    })
  });

module.exports = router;

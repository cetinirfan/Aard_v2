const express = require('express')
const router = express.Router();
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken');
const Users = require('../services/modals/Users');
const Store = require('../services/modals/Store');
const verifyToken = require('../services/middleware/verify-token');
const multer =require('multer');
const fs =require('fs');
const randomInt = require('random-int');
const gnp = require('generate-password');
require('dotenv').config();
const mailCodeSend = require('../services/modals/mailCodeSend');

router.post('/saveUserToken/',verifyToken,(req,res)=>{
  const {oneSignalToken} =req.body;
  Users.updateOne({_id:req.user_id},{$set:{oneSignal:oneSignalToken}})
  .then(data=>{     
     res.json({status:true,message:'başarılı'});
  })
  .catch(err=>{
      res.json(err);
  })
})

router.post('/refreshUserToken/',verifyToken,(req,res)=>{
  const {oneSignalToken} =req.body;
  Users.findByIdAndUpdate({_id:req.user_id},{$set:{oneSignal:oneSignalToken}})
  .then(data=>{      
     res.json({status:true,message:'başarılı'});
  })
  .catch(err=>{
      res.json(err);
  })
}) 


router.post('/register',(req,res,next)=>{
  const {userName,password2,password,mail} = req.body;

  if((password !== password2)){
    res.json({
      status: false,
      message: 'Girilen şifreler uyuşmuyor lütfen kontrol ediniz.'});
  }

  if((!userName || !password || !password2 ||!mail)){
      res.json({
				status: false,
				message: 'Tüm Alanları Doldurunuz.'});
  }
	Users.findOne({mail:mail},(err,data)=>{
		if(data){
      if(data.userName===req.body.userName){
        res.json({
          status: false,
          message: 'Bu kullanıcı adına ait bir kullanıcı zaten var.'});
      }
			res.json({
				status: false,
				message: 'Zaten kayıtlı kullanıcı'});
		}else{
      var verification_code = randomInt(1000,9999);
			bcrypt.hash(password,10).then((hash)=>{
				const New = new Users({
          userName,
          mail,
          userMailCode:verification_code,
					password:hash
				});
				const promise = New.save();
				promise.then((data)=>{
          mailCodeSend(`Merhaba doğrulama kodun: `+verification_code,req.body.mail);
					res.json({
            status: true,
            message: 'Kaydınız başarıyla gerçekleşti.'
          });
				}).catch((err)=>{
					res.json({
            status: false,
            message: 'Kayıt olurken bir sorun oluştu.'
          });
				})
			});
		}
	})
});

router.post('/code', (req, res) => {
  const { mail, userMailCode } = req.body;
  Users.findOne({mail})
  .then(data =>{
    if(data.userMailCode===userMailCode){
        Users.updateOne({mail},{$set:{userMailCode:0}})
        .then(data =>{
          res.json({
            status: true,
            message: 'Kayıt işlemi başarı ile gerçekleşti.'
          });
        })
        .catch(err=>{
          res.json({
            status: false,
            message: 'Doğrulama kodu işlenirken bir sorun oluştu.'
          });
        })
    }else{
      res.json({
        status: false,
        message: 'Girdiğiniz kod hatalı.'
      });
    }
    })
  .catch(err=>{
    res.json({
      status: false,
      message: 'Bir sorun oluştu tekrar kayıt ol.'
    });
  })
});

router.post('/removeCode', (req, res) => {
  const { mail } = req.body;
  Users.findOne({mail})
  .then(data =>{
    if(data){
        Users.deleteOne({mail})
        .then(data =>{
          res.json('Kod Başarıyla silindi');
        })
        .catch(err=>{
          res.json(err);
        })
    }else{
      res.json('Kullanıcı Bulunamadı');
    }
    })
  .catch(err=>{
    res.json(err);
  })
});

router.post('/newCode', (req, res) => {
  const { mail } = req.body;
  const verification_code = randomInt(1000,9999);
  Users.findOneAndUpdate({mail},{$set:{userMailCode:verification_code}})
    .then(data =>{
      mailCodeSend(`Merhaba doğrulama kodun: `+verification_code,req.body.mail);
      res.json({
        status: true,
        message: 'Yeni doğrulama kodunuz başarıyla gönderildi.'})
      })
    .catch(err=>{
      res.json({
        status: false,
        message: 'Böyle bir kullanıcı bulunamadı.'});
      });
});

router.post('/changeCode', (req, res) => {
  const { mail } = req.body;
  const verification_code = randomInt(1000,9999);
  Users.findOneAndUpdate({mail},{$set:{userMailCode:verification_code}})
    .then(data =>{
      mailCodeSend(`Merhaba doğrulama kodun: `+verification_code,req.body.mail);
      res.json({
        status: true,
        message: 'Yeni doğrulama kodunuz başarıyla gönderildi.'
      });
    })
    .catch(err=>{
      res.json(err);
    })
});

router.post('/login', (req, res) => {
  const { mail, password } = req.body;
  if((!password ||!mail)){
    res.json({
      status: false,
      message: 'Tüm Alanları Doldurunuz.'});
}
	Users.findOne({mail}, (err, Users) => {
    if(!Users){
      res.json({
        status: false,
        message: 'Böyle bir kullanıcı bulunamadı.'
      });
    }else{
      if(Users.userMailCode==0){
      const user_id=Users._id;
          bcrypt.compare(password, Users.password).then((result) => {
            if (result){
              const token = jwt.sign({user_id:Users._id}, req.app.get('api_key'));
              res.json({status:true, token, user_id})
            }else{
              res.json({
                status: false,
                message: 'Doğrulama hatası, hatalı parola.'
              });
            }
          })
        }else{
          res.json({
            status: false,
            message: 'Doğrulanmamış kullanıcı.'
          });
        }
    }
  })
});

router.post('/forgetPassword', (req, res) => {
  const { mail } = req.body;
  const password = gnp.generate({
    length: 5,
    uppercase: true});
  if(!mail){
    res.json({ 
      status: false,
      message: 'Lütfen tüm alanları doldurunuz.'});
  }
  Users.findOne({mail}, (err, Users) => {
    if(!Users){
      res.json({
        status: false,
        message: 'Bu mail adresine ait kullanıcı bulunamadı.'}) 
    }
  });
  Users.findOne({mail:mail},(error,Users)=>{
      bcrypt.hash(password,10).then((hash)=>{
        Users.updateOne({ $set: {
            password:hash,
            userMailCode:0
          } },{new: true})
          .then((data)=>{
            mailCodeSend('Şifrenizi kimse ile lütfen paylaşmayınız. Yeni şifreniz: '+password,req.body.mail);
            res.json({
              status: true,
              message: 'Şifreniz başarıyla değiştirildi.'});
          }).catch((err)=>{ 
          res.json({
            status: false,
            message: 'Şifrenizi değiştirirken bir hata oluştu.'});
        });
      });
  })
});

router.get('/getProfile',verifyToken,(req,res)=>{
    const promise = Users.findOne({_id:req.user_id});
        promise.then((data)=>{
            res.json(data);
        }).catch((err)=>{
            res.json(err);
        })
});

router.post('/changePassword',verifyToken, (req, res) => {
  const { password , newpassword , newpassword2 } = req.body;
  if((newpassword !== newpassword2)){
    res.json({
      status: false,
      message: 'Girilen yeni şifreler uyuşmuyor lütfen kontrol ediniz.'});
  }
  Users.findOne({_id:req.user_id},(error,Users)=>{
    if(Users){
      bcrypt.compare(password, Users.password).then((result) => {
        if(result===true){
          bcrypt.hash(newpassword,10).then((hash)=>{
            Users.updateOne({ $set: {
              password:hash
            } },{new: true})
                .then((data)=>{
                    res.json({
                      status: true,
                      message: 'Şifreniz değiştirildi.'});
                }).catch((err3)=>{
                    res.json({
                      status: false,
                      message: 'Şifre değiştirilirken bir sorun oluştu.'});
                }); 
          });
        }else{
          res.json({
            status: true,
            message: 'Hatalı eski şifre.'});
        }
      })
    }
  })
});

router.post('/setProfile',verifyToken,(req,res)=>{
	const {userName} =req.body;
	  Users.findByIdAndUpdate({_id:req.user_id}, { $set: {
      userName
		} },{new: true})
		.exec()
		.then(data=>{
			res.json(data);
		}).catch(err =>{
		res.json(err);
	})
});

router.post('/setAvatar',verifyToken,(req,res)=>{
	const {url} =req.body;
	  Users.findByIdAndUpdate({_id:req.user_id}, { $set: {
      userAvatar:url
		} },{new: true})
		.exec()
		.then(data=>{
			res.json(data);
		}).catch(err =>{
		res.json(err);
	})
});

router.post('/setFrame',verifyToken,(req,res)=>{
	const {url} =req.body;
	  Users.findByIdAndUpdate({_id:req.user_id}, { $set: {
      userFrame:url
		} },{new: true})
		.exec()
		.then(data=>{
			res.json(data);
		}).catch(err =>{
		res.json(err);
	})
});

router.get('/sortScore',verifyToken,(req,res)=>{
  const sortedWeakly = [];
  const sortedMonthly = [];
  const sortedAllTime = [];
  const proimsev1 = Users.aggregate(
    [
      { $match :{} },
      { $sort : { weeklyScore : -1} },
      { $limit: 5 }
  ]);
  proimsev1.then(data=>{
    sortedWeakly.push(data)
    const promisev2 = Users.aggregate(
      [
        { $match :{} },
        { $sort : { monthlyScore : -1} },
        { $limit: 5 }
    ]);
    promisev2.then(data=>{
      sortedMonthly.push(data)
      const promisev3 =Users.aggregate(
        [
          { $match :{} },
          { $sort : { allScore : -1} }, 
          { $limit: 5 }
      ]);
      promisev3.then(data=>{
        sortedAllTime.push(data)
        res.json({'Weakly':sortedWeakly,'Monthly':sortedMonthly,'AllTime':sortedAllTime})
      })
    })
  })
});

router.post('/whatchVideo',verifyToken,(req,res)=>{
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
          message: 'Bilet hakkı eklendi.'});
      }).catch(err =>{
      res.json(err);
    })
    }else{
      res.json({
        status: false,
        message: 'Bilet sayısı dolu.'});
    }
  })
});

router.post('/referal',verifyToken,(req,res)=>{
  const {userName} =req.body;
  Users.findOne({_id:req.user_id},(err,user)=>{
    if(user.referalCount === 1){
      const newDiamondCount = user.diamond+30;
      const promise_v1 = Users.updateOne({_id:req.user_id}, { $set: {
        diamond:newDiamondCount,
        referalCount:0
      } },{new: true})
      promise_v1.then(data=>{
        Users.findOne({userName:userName},(err,referalUser)=>{
          if(referalUser){
            const newDiamondCount = referalUser.diamond+30;
          const promise_v2 = Users.updateOne({_id:referalUser._id}, { $set: {
            diamond:newDiamondCount
          } },{new: true})
          promise_v2.then(data=>{
            res.json({
              status: true,
              message: 'Elmasınız eklendi.'});
          })
          }else{
            es.json({
              status: false,
              message: 'Kullanıcı adı hatalı.'});
          }
        })
      }).catch(err =>{
      res.json(err);
    })
    }else{
      res.json({
        status: false,
        message: 'Referans olarak sadece bir kişiyi gösterebilirsiniz.'});
    }
  })
});

router.post('/store',verifyToken,(req,res)=>{
  const {userName,product,productCount,price} = req.body; 
    const nowDate = Date.now();
    const NewStore = new Store({
      userName,
      product,
      productCount,
      price,
      created:nowDate,
      });
      const promise = NewStore.save();
				promise.then((data)=>{
					res.json({data});
				}).catch((err)=>{
					res.json(err);
				})
});

module.exports = router;

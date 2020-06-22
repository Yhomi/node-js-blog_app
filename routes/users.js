const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var passport = require('passport');

let User=require('../models/user');

// register
router.get('/register',(req,res)=>{
  res.render('register');
});

const {check,validationResult}=require('express-validator');
// register users
router.post('/register',[
  check('name','The Name is required').notEmpty(),
  check('email','The Email is required').notEmpty(),
  check('email','The E-mail is not valid').isEmail(),
  check('username','The Username is required').notEmpty(),
  check('password','The Password is required').notEmpty(),
  check('password2','Passwords do no match').custom((value,{req,loc,path})=>{
    if(value !==req.body.password){
      throw new Error('Passwords do not match')
    }else {
      return value
    }
  })

],(req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('register',{errors:errors.array()});
  }else {
    let newUser = new User();
      newUser.name = req.body.name,
      newUser.email=req.body.email,
      newUser.username = req.body.username,
      newUser.password = req.body.password

    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(newUser.password,salt,(err,hash)=>{
        if(err) throw err;
        newUser.password = hash;
        newUser.save((err)=>{
          if(err) throw err;
          req.flash('success','Registration completed');
          res.redirect('/users/login');
        });
      });
    });
  }
});

// login route
router.get('/login',(req,res,next)=>{
  res.render('login');
})

//Login process
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});

//Logout process
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success','You are logout');
  res.redirect('/users/login');
})

module.exports = router;

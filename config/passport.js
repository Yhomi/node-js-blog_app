var passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const config = require('../config/database');

module.exports = ()=>{
  passport.use(new LocalStrategy((username,password,done)=>{
    let query = {username:username};
    User.findOne(query,(err,user)=>{
      if(err) throw err;

      // check if user match
      if(!user){
        return done(null,false,{message:'No User found'});
      }

      // Match password
      bcrypt.compare(password,user.password,(err,isMatch)=>{
        if(err) throw err;
        if(!isMatch){
          return done(null,false,{message:'Wrong password'});
        }else {
          return done(null,user)
        }
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}

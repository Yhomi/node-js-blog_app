const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Article= require('./models/article');
const bodyParser =require('body-parser');
const config = require('./config/database');
const flash =require('connect-flash');
const session =require('express-session');
const passport = require('passport');


// connect to database
mongoose.connect(config.database);
let db=mongoose.connection;

// check connection
db.once('open',()=>{
  console.log('Connected');
});

// check for errors
db.on('error',(err)=>{
  console.log(err);
})

// init express
const app =express();

// set view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');

// middleware for form data
app.use(bodyParser.urlencoded({extended:false}));

// middleware for json
app.use(bodyParser.json());

// static folder
app.use(express.static(path.join(__dirname,'public')));

// Express session middleware
app.use(session({
  secret:'Whatever you want',
  resave:true,
  saveUninitialized:true,

}));

// Passport config
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
  res.locals.user= req.user || null;
  next();
})

// Express Messages middleware
app.use(require('connect-flash')());
app.use((req,res,next)=>{
  res.locals.messages = require('express-messages')(req,res);
  next();
})

// routes middleware
app.use('/articles',require('./routes/article'));
app.use('/users',require('./routes/users'));

// home route
// app.get('/',(req,res)=>{
//   res.send('Hello World');
// });

// render view
app.get('/',(req,res)=>{
  Article.find({},(err,articles)=>{
    if (err) throw err;
    res.render('index',{title:"Articles",articles:articles});
  })

});


const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
  console.log('Server started on port: '+PORT);
});

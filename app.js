const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Article= require('./models/article');
const bodyParser =require('body-parser');
const expressValidator= require('express-validator');
const flash =require('connect-flash');
const session =require('express-session');


// connect to database
mongoose.connect('mongodb://localhost:27017/nodekb');
let db=mongoose.connection;

// check connection
db.once('open',()=>{
  console.log('Connected');
});

// check for errors
db.on('error',(err)=>{
  console.log('err');
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

// Express Messages middleware
app.use(require('connect-flash')());
app.use((req,res,next)=>{
  res.locals.messages = require('express-messages')(req,res);
  next();
})

// Express middleware validator
app.use(expressValidator({
  errorFormatter:function(param,msg,value){
    var namespace= param.split('.'),
    root = namespace.shift() ,
    formParam=root;
    while (namespace.length) {
      formParam +='['+ namespace.shift()+']';
    }
    return{
      param:formParam,
      msg:msg,
      value:value
    };
  }

}));

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

app.get('/add/articles',(req,res)=>{
  res.render('add_articles',{title:'Add Articles'})
});

app.post('/articles/add',(req,res)=>{
  let article = new Article();
  article.title=req.body.title;
  article.author=req.body.author;
  article.body=req.body.body;
  article.save((err)=>{
    if (err) throw err;
    res.redirect('/');
  });
});

// get single articles
app.get('/articles/:id',(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    if (err) throw err;
    // console.log(article);
    res.render('show',{article:article});
  });
});

// edit article
app.get('/articles/edit/:id',(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    res.render('edit',{article:article,title:'Edit Article'});
  });
});

// update articles
app.post('/articles/update/:id',(req,res)=>{
  let article ={};
  article.title=req.body.title;
  article.author=req.body.author;
  article.body=req.body.body
  let query={_id:req.params.id};
  Article.update(query,article,(err)=>{
    if (err) throw err;
    res.redirect('/');
  });
});

// delete an articles
app.delete('/article/delete/:id',(req,res)=>{
  let query ={_id:req.params.id};
  Article.remove(query,(err)=>{
    if (err) throw err;
    res.send('Success');
  });
});

const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
  console.log('Server started on port: '+PORT);
});

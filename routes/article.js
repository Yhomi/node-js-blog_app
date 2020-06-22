const express = require('express');
const router = express.Router();

let Article = require('../models/article');

let User = require('../models/user');

router.get('/add',ensureAuthenticated, (req,res)=>{
  res.render('add_articles',{title:'Add Articles'})
});

const {check,validationResult}=require('express-validator');

router.post('/add',[
  check('title','Title is required').notEmpty(),

  check('body','Body is required').notEmpty()
],(req,res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('add_articles',{title:'Add Articles',errors:errors.array()});
  }else {
    let article = new Article();
    article.title=req.body.title;
    article.author=req.user._id;
    article.body=req.body.body;
    article.save((err)=>{
      if (err) throw err;
      req.flash('success','Article Added');
      res.redirect('/');
    });
  }

});

// get single articles
router.get('/:id',(req,res)=>{
  Article.findById(req.params.id,(err,article)=>{
    User.findById(article.author,(err,user)=>{
      if (err) throw err;
      // console.log(article);
      res.render('show',{article:article,author:user.name});
    });
    })


});

// edit article
router.get('/edit/:id',ensureAuthenticated, (req,res)=>{

  Article.findById(req.params.id,(err,article)=>{
    if (article.author != req.user._id) {
      req.flash('danger','Not Authorized');
      res.redirect('/');
    }else {
      res.render('edit',{article:article,title:'Edit Article'});
    }
      });
});

// update articles
router.post('/update/:id',(req,res)=>{
  let article ={};
  article.title=req.body.title;
  article.author=req.user._id;
  article.body=req.body.body;
  let query={_id:req.params.id};
  Article.update(query,article,(err)=>{
    if (err) throw err;
    req.flash('success','Article Updated');
    res.redirect('/');
  });
});

// delete an articles
router.delete('/delete/:id',(req,res)=>{
  if (!req.user._id) {
    res.status(500).send();
  }
  let query ={_id:req.params.id};
  Article.findById(req.params.id,(err,article)=>{
    if(article.author != req.user._id){
      res.status(500).send();
    }else {
      Article.remove(query,(err)=>{
        if (err) throw err;
        res.send('Success');
      });
    }
  });

});

// Access control

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else {
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

module.exports=router;

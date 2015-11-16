'use strict';

var express = require('express');
var router = express.Router();
var xss = require('xss');
var users = require('../lib/users');


router.get('/login', redirectIfLoggedIn, login);
router.post('/login', loginHandler);
router.get('/logout', logout);
router.get('/create', redirectIfLoggedIn, createForm);
router.post('/create', createHandler);
router.get('/wall', index); //, ensureLoggedinIn
router.post('/wall', commentHandler, index);

module.exports = router;

/** route middlewares **/
function commentHandler(req, res, next) {
  var comment = xss(req.body.comment);

  var user = req.session.user;
  var username = user.username;

  users.createComment(username,comment, function (err, status) {
    if (err) {
      console.error(err);
    }

    var success = true;

    if (err || !status) {
      success = false;

      var comment = req.session.comment;
      var users = req.session.users;
      res.render('wall', { title: 'Create user', 
                            post: true, 
                            success: success, 
                            user: user,
                            users: users,
                            comments: comment })
    } 
    console.log(status);
    if (status){
      next();
    }
    

   
  });

  
}


function createForm(req, res, next) {
  res.render('create', { title: 'Create user' });
}

function createHandler(req, res, next) {
  var username = xss(req.body.username);
  var password = xss(req.body.password);

  // hér vantar *alla* villumeðhöndlun
  if (!(password === '') & !(username === '')) {
    users.createUser(username, password, function (err, status) {
      if (err) {
        console.error(err);
      }

      var success = true;

      if (err || !status) {
        success = false;
      }

      res.render('create', { title: 'Create user', post: true, success: success })
    });

    
    
  } else {
    res.render('create', { title: 'Create user', post: true, success: false })
  }
}

function ensureLoggedinIn(req, res, next) {
  if (req.session.user) {
    next(); // köllum í næsta middleware ef við höfum notanda
  } else {
    res.redirect('/login');
  }
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    res.redirect('/wall');
  } else {
    next();
  }
}

function login(req, res, next) {
  res.render('login', { title: 'Login' });
}

function loginHandler(req, res, next) {
  var username = xss(req.body.username);
  var password = xss(req.body.password);

  users.auth(username, password, function (err, user) {
    if (user) {
      req.session.regenerate(function (){
        req.session.user = user;
        res.redirect('/wall');
      });
    } else {
      var data = {
        title: 'Login',
        username: username,
        error: true
      };
      res.render('login', data);
    }
  });
}

function logout(req, res, next) {
  // eyðir session og öllum gögnum, verður til nýtt við næsta request
  req.session.destroy(function(){
    res.redirect('/');
  });
}

function index(req, res, next) {
  var user = req.session.user;
  var comment = [];

  // var json = {
  // "Bar11": {
  //   "Heimilisfang": "Hverfisgata 18",
  //   "Tegund": "Rock Bar",
  //   "map": "https://maps.google.com/maps?hl=en&q=bar 11 iceland&ie=UTF8&t=roadmap&z=15&iwloc=B&output=embed"
  //   }
  // }
  console.log(json);

  users.listUsers(function (err, all) {
       req.session.users = all; 
       res.render('wall', { title: 'wall zone',
         user: user,
         users: all,
         bar: json 
       });
     })

  // users.getComments(function (err, all, status) {
  //   // console.log(all)
  //   // var revcomment = all.reverse();
  //   comment.push(all);
  //   req.session.comment = comment; 
  //   if (status){
     
     // users.listUsers(function (err, all) {
     //   req.session.users = all; 
     //   res.render('wall', { title: 'wall zone',
     //     user: user,
     //     users: all,
     //     comments: comment 
     //   });
     // })
        
  //   }
    
  // })
 
}
var json = {
  "barir": {
    "Bar11":{
      "Heimilisfang": "Hverfisgata 18",
      "Tegund": "Rock Bar",
      "map": "https://maps.google.com/maps?hl=en&q=bar 11 iceland&ie=UTF8&t=roadmap&z=15&iwloc=B&output=embed"
    },
    "B5":{
      "Heimilisfang": "",
      "Tegund": "",
      "map": ""
    }
    
  }

}

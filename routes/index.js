var express = require('express');
var router = express.Router();

var uid2 = require('uid2')
var SHA256 = require('crypto-js/sha256')
var encBase64 = require('crypto-js/enc-base64')
var userModel = require('../models/users')
var articleModel = require('../models/article')


router.post('/sign-up', async function(req,res,next){

  var error = []
  var result = false
  var saveUser = null
  var token = null

  const data = await userModel.findOne({
    email: req.body.emailFromFront
  })

  if(data != null){
    error.push('utilisateur déjà présent')
  }

  if(req.body.usernameFromFront == ''
  || req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }


  if(error.length == 0){

    var salt = uid2(32)
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: SHA256(req.body.passwordFromFront+salt).toString(encBase64),
      token: uid2(32),
      salt: salt,
    })
  
    saveUser = await newUser.save()
  
    
    if(saveUser){
      result = true
      token = saveUser.token
    }
  }
  

  res.json({result, saveUser, error, token})
})

router.post('/sign-in', async function(req,res,next){

  var result = false
  var user = null
  var error = []
  var token = null
  
  if(req.body.emailFromFront == ''
  || req.body.passwordFromFront == ''
  ){
    error.push('champs vides')
  }

  if(error.length == 0){
    const user = await userModel.findOne({
      email: req.body.emailFromFront,
    })
  
    
    if(user){
      const passwordEncrypt = SHA256(req.body.passwordFromFront + user.salt).toString(encBase64)

      if(passwordEncrypt == user.password){
        result = true
        token = user.token
      } else {
        result = false
        error.push('mot de passe incorrect')
      }
      
    } else {
      error.push('email incorrect')
    }
  }
  

  res.json({result, user, error, token})
})

router.post('/wishlist-article', async function(req, res, next) {

  console.log("ceci est un req body", req.body)

  var articleSave = new articleModel({
    title: req.body.title,
    description: req.body.description,
    urlToImage: req.body.urlToImage,
    token: req.body.token,
  })

  var articleSave = await articleSave.save()

  console.log("ceci est un résultat d'article", articleSave)
  
  var result = false
  if(articleSave.title){
    result = true
  }

  res.json({result, articleSave})
});


router.delete('/delete-wish/:title', async function(req,res,next){

  console.log("paraaaaams", req.params.title)

  var articleDelete = await articleModel.deleteOne({title : req.params.title})

  console.log("c'est passséééééé")
  var result  = true
  res.json({result})
})

module.exports = router;
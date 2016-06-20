var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page; 
var User = models.User; 

router.get('/', function(req, res) {
  User.findAll()
  .then(function(result){
  	var userArray = result.map(function(user){
  		return user.dataValues;
  	});
  	res.render('authors', {authors: userArray});
  })
});

router.get('/:id', function(req, res, next){
  	Page.findAll({
		where: {authorId: req.params.id}
	})
	.then(function(result){
		var pagesArray = result.map(function(page){
  		return page.dataValues;
  	});
  	res.render('index', {pages: pagesArray});
	})
});

module.exports = router;
var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page; 
var User = models.User; 

/* GET users listing. */
router.get('/', function(req, res) {
  Page.findAll()
  .then(function(result){
  	var pagesArray = result.map(function(page){
  		return page.dataValues;
  	});
  	res.render('index', {pages: pagesArray});
  })
});

router.post('/', function(req, res) {

  User.findOrCreate({where: {email: req.body.email}, defaults: {name: req.body.name}})
  .then(function(newUser){

  	var tags = req.body.content.match(/([#])\w+/g);
  	var page = Page.build({
  		title: req.body.title,
  		content: req.body.content,
  		tags: tags,
  		authorId: newUser[0].dataValues.id //could have done this with page.setAuthor instance method
  	});
  	return page.save();
  })
  .then(function(result){
  	console.log("page saved");
  	res.redirect("/wiki/"+ result.urlTitle); //fix this to use route
  })
  .catch(console.error);

});

router.get('/add', function(req, res) {
  res.render('addpage');
});

router.get('/search', function(req, res) {
	if (!req.query.tags) return res.render('search');
	var searchedTags = req.query.tags.split(" ");
	searchedTags = searchedTags.map(function(tag){
		if (tag[0]!= "#") return "#" + tag;
		else return tag;
	});
	Page.findAll({where: {tags: {$overlap: searchedTags}}})
	.then(function(result){
		var pagesArray = result.map(function(pageObj){
			return pageObj.dataValues;
		})
		res.render('index', {pages: pagesArray} )
	});

	// .then(function(result){
	// 	console.log(result);
	// })
});

router.get('/:urlTitle/similar', function(req, res, next){
	var currentPage = Page.findOne({
		where: {urlTitle: req.params.urlTitle}
	})
	currentPage.then(function(page){
		var similar = page.findSimilar();
		similar.then(function(pages){
			var pagesArray = pages.map(function(pageObj){
			return pageObj.dataValues;
			})
			res.render("index", {pages: pagesArray})
		}).catch(function(err){
			console.error(err);
			res.render('index');
		});
	})
});

router.get('/:urlTitle', function(req, res, next){
	var currentPage = Page.findOne({
		where: {urlTitle: req.params.urlTitle}
	});
	currentPage.then(function(page){
		User.findOne({
			where: {id: page.dataValues.authorId}
		})
		.then(function(author){
			var tagStr = page.dataValues.tags.join(" ")
			res.render('wikipage', {tags: tagStr, title: page.dataValues.title, content: page.dataValues.content, urlTitle: page.dataValues.urlTitle, authorId: author.dataValues.id, name: author.dataValues.name});
		})
	})
	.catch(next);
});

// COULD reimplement the above as two separate promises both that use USERID to do their lookups.
// Then use Promise.all (bluebird) to make sure both are processed before rendering the page.




module.exports = router;
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var wikiRouter = require('./routes/wiki');
var usersRouter = require('./routes/users');
var swig = require('swig');
var models = require('./models');

var app = express();

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/wiki', wikiRouter);
app.use('/users', usersRouter);

app.get('/', function(req, res){
	res.render('index')
})

app.use(express.static('public'));

// point res.render to the proper directory
app.set('views', __dirname + '/views');
// have res.render work with html files
app.set('view engine', 'html');
// when res.render works with html files
// have it use swig to do so
app.engine('html', swig.renderFile);
// turn of swig's caching
swig.setDefaults({cache: false});


module.exports = app;

models.Page.sync()
.then(function(){
	return models.User.sync();
})
.then(function(){
	app.listen(3000, function(){
		console.log('listening on port 3000');
	});
})
.catch(console.error);

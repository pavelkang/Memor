var express = require('express');
var http = require('http');
var router = express.Router();
var cheerio = require('cheerio');
var answer = "";
var User = require('../app/models/user')
/* GET home page. */
module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.sendfile('views/try.html');
	});
	app.get('/home', function(req, res) {
		res.sendfile('views/index.html');
	});	
	app.get('/profile', function(req, res){
		res.json(req.user);
	})
	/*
	app.get('/home', isLoggedIn, function(req, res) {
		res.sendfile('views/index.html');
	});*/

	app.get('/error', function(req, res) {
		res.sendfile('views/error.html');
	});

	app.post('/api/translate', function(req, response){
		http.post('http://www.spanishdict.com/translate', {word:req.body.word}, 
		function(res) { 
	    	res.setEncoding('utf8');
	    	res.on('data', function(chunk){
	        	$ = cheerio.load(chunk);
	        	answer = $('.quick_def').text();
	        	if (answer.length>0) {response.send($('.quick_def').text());}
	    	});
	    });
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {scope:'email'}));
	app.get('/auth/facebook/callback', passport.authenticate(
		'facebook', {failureRedirect:'/error'}),
		function(req, res) {
			res.redirect('/home');
		}
	);

	app.get('/auth/google', passport.authenticate('google', {scope:'email'}));
	app.get('/auth/google/callback', passport.authenticate(
		'google', {failureRedirect:'/error'}),
		function(req, res) {
			res.redirect('/home');
		}
	);

	app.get('/logout', function(req, res){
		console.log('Logging out...');
		req.logout();
		res.redirect('/');
	});

	app.get('/api/words', function(req, res){
		User.find(function(err, users){
			if (err){
				res.send(err);}
			res.json(users);
		});
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}


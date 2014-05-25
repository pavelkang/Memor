var express = require('express');
var http    = require('http');
var router  = express.Router();
var cheerio = require('cheerio');
var answer  = "";
var User    = require('../app/models/user')
var Words   = require('../app/models/words')
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

	// GETs stored words
	app.get('/api/getWords', function(req, res){
		if (req.user.facebook.id) { // FB user
			User.findOne({
				'facebook.id' : req.user.facebook.id
			}, function(err, user) {
				if (err)
					res.send(err);
				res.json(user);
			});
		}
		else {  // Google user
			User.findOne({
				'google.id' : req.user.google.id
			}, function(err, user) {
				if (err)
					res.send(err);
				res.json(user);
			});
		}
	})

	// POSTs to spanishdict.com, and returns the translation
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

	app.post('/api/addUnit', function(req, res){
		if (req.user.facebook.id) {
			// FB User
			User.findOne({
				'facebook.id': req.user.facebook.id
			}, function(err, user){
				// NOT necessarily eng and esp
				user.units.push({eng:[], esp:[]})
				user.save(function(err){
					if (err) {
						console.error('save FB error');
					}
					res.json('hi');					
				});
			});
		}
		else {
			// Google User
			User.findOne({
				'google.id': req.user.google.id
			}, function(err, user){
				// NOT necessarily eng and esp
				user.units.push({eng:[], esp:[]})				
				user.save(function(err){
					if (err) {
						console.error('save Google error');
					}
					res.json('hi');
				});
			});		
		}
	})

	// POSTs to add word
	app.post('/api/addWord', function(req, res){
		if (req.user.facebook.id) {
			// FB User
			User.findOne({
				'facebook.id': req.user.facebook.id
			}, function(err, user){
				// NOT necessarily eng and esp
				user.units[req.body.curr_unit].eng.push(req.body.word);
				user.units[req.body.curr_unit].esp.push(req.body.quick_def);
				user.save(function(err){
					if (err) {
						console.error('save FB error');
					}
					res.json('hi');					
				});
			});
		}
		else {
			// Google User
			User.findOne({
				'google.id': req.user.google.id
			}, function(err, user){
				console.log(req.body);				
				// NOT necessarily eng and esp
				user.eng.push(req.body.word);
				user.esp.push(req.body.quick_def);
				user.save(function(err){
					if (err) {
						console.error('save Google error');
					}
					res.json('hi');
				});
			});		
		}
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


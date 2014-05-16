var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google').Strategy;
var User             = require('./models/user');
var configAuth       = require('./auth');

module.exports       = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Facebook
    passport.use(new FacebookStrategy({
        clientID : configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL    	
    },
	function(token, refreshToken, profile, done){
		process.nextTick(function(){
			console.log(profile);
			User.findOne({'facebook.id' : profile.id}, function(err, user){
				if (err) {return done(err);}
				if (user) {return done(null, user);}
				else {
					var newUser            = new User();
					newUser.facebook.id    = profile.id;
					newUser.facebook.token = token;
					newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.facebook.email = profile.emails[0].value;
					newUser.save(function(err){
						if (err) {throw err;}
						return done(null, newUser);
					});
				}
			});
		});
	}));

	// Google
    passport.use(new GoogleStrategy({
        returnURL: configAuth.googleAuth.returnURL,
        realm: configAuth.googleAuth.realm
    },
	function(identifier, profile, done){
		process.nextTick(function(){
			profile.identifier = identifier;
			console.log(profile);
			User.findOne({'google.email' : profile.email}, function(err, user){
				if (err) {return done(err);}
				if (user) {return done(null, user);}
				else {
					console.log(profile);
					var newUser            = new User();
					newUser.google.id    = profile.identifier;
					newUser.google.name  = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.google.email = profile.email;
					newUser.save(function(err){
						if (err) {throw err;}
						return done(null, newUser);
					});
				}
			});
		});
	}));	
};
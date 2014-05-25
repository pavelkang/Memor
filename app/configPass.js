var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google').Strategy;
var User             = require('./models/user');
var Words            = require('./models/words');
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
					var unit = {eng:['a'], esp:['a']};
					var unit2 = {eng:['a'], esp:['b']};
					newUser.units = [unit, unit2]
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
			User.findOne({'google.id' : profile.identifier}, function(err, user){
				if (err) {return done(err);}
				if (user) {return done(null, user);}
				else {
					var newUser            = new User();
					newUser.google.id    = profile.identifier;
					newUser.google.name  = profile.name.givenName + ' ' + profile.name.familyName;
					newUser.google.email = profile.email;
					var unit = {eng:[], esp:[]}
					newUser.units = [unit]
					newUser.save(function(err){
						if (err) {throw err;console.log("ERROR!")}
						return done(null, newUser);
					});
				}
			});
		});
	}));	
};
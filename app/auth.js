module.exports = {
	'facebookAuth' : {
		'clientID'     : '700237026684708',
		'clientSecret' : '9b23a7cdfde8980f52d5fda393cc0f58',
		'callbackURL'  : 'http://localhost:3000/auth/facebook/callback'
	},
	'googleAuth' : {
		returnURL: 'http://localhost:3000/auth/google/callback',
		realm:'http://localhost:3000'
	}
};
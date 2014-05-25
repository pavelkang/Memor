var mongoose  = require('mongoose');
var wordsSchema

var userSchema = mongoose.Schema({
	facebook : {
		id   : String,
		token: String,
		email: String,
		name : String
	},
	google : {
		id   : String,
		token: String,
		email: String,
		name : String
	},
	eng  : Array,
	esp  : Array,
	units: [{eng:Array, esp:Array}]
});

module.exports = mongoose.model('User', userSchema);
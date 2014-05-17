var mongoose  = require('mongoose');

var wordsSchema = mongoose.Schema({
	unit : Number,
	eng : Array,
	esp : Array
});

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
	noOfUnits : Number,
	words    : [wordsSchema]
});

module.exports = mongoose.model('Words', wordsSchema)
module.exports = mongoose.model('User', userSchema);
// Words in a unit
var mongoose = require('mongoose');

var wordsSchema = mongoose.Schema({
	eng : Array,
	esp : Array
});


module.exports = mongoose.model('Words', wordsSchema)
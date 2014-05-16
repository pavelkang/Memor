var express      = require('express');
var path         = require('path');
var favicon      = require('static-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var http         = require('http');
http.post        = require('http-post');
var routes       = require('./routes/index');
var users        = require('./routes/users');
var app          = express();
var cheerio      = require('cheerio');
var db           = require('./db');
var passport     = require('passport');
var mongoose     = require('mongoose');
var session      = require('express-session');
try {
    mongoose.connect(db.url);
} catch (err) {console.log("DB error");}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
//passport
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret : "Hi"}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(express.Router());
require('./app/configPass')(passport);
require('./routes/index.js')(app, passport);

// enable CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

/*
var MsTranslator = require('mstranslator');
var client = new MsTranslator({client_id:"5b4deae9-7de0-4543-98c7-cf73488c27e6", client_secret: "09FEa/65mWearfcKapZ3PJuCPELGDHbRJ7qV1IiBEUE"});
var params = { 
  text: 'fish'
  , from: 'en'
  , to: 'es'
};

client.initialize_token(function(keys){ 
  client.translate(params, function(err, data) {
      console.log(data);
  });
});*/


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

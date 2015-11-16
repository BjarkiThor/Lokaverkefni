'use strict';

/**
 * Byggt á
 *  https://github.com/expressjs/session#example
 *  https://github.com/strongloop/express/tree/master/examples/auth
 *  https://github.com/strongloop/express/tree/master/examples/error
 */

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


var routes = require('./routes/index');
var auth = require('./routes/auth');

var viewCounter = require('./middleware/viewCounter');
var errorHandler = require('./middleware/errorHandler');
var notFoundHandler = require('./middleware/notFoundHandler');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));


// app.use("/bower_components", express.static(__dirname + "/bower_components"));
// app.use("/public", express.static(__dirname + "/public"));

app.use(cookieParser());

var cookie = { domain: '',
               httpOnly: false,
               secure: false };

app.use(session({
  secret: 'session secret!',
  resave: false,
  saveUninitialized: true,
  cookie: cookie,
  name: 'session'
}));

app.use(viewCounter);
app.use('/', routes);
app.use('/', auth);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

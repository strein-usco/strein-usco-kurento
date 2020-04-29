/** Express router providing user related routes
 * @module app
 * @requires routes/index
 * @requires routes/fileForm
 * @requires routes/personaForm
 * @requires routes/courseForm
 * @requires routes/videoForm
 * @requires routes/mailForm
 */

 /**
 * Module dependencies.
 */
let express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    app = express(),
    fileUpload = require('express-fileupload');
 
global.__basedir = __dirname;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false })); // recibe datos de formularios
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50MB", type:'application/json'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules/'));
app.use(express.static('files'));
app.use(session({
  secret: 'sdnfDfs5SD373adLdjv',
  resave: false,
  saveUninitialized: false
}));
app.use(fileUpload()); //simple express middleware for uploading files
/**
 * @memberof module:routes/index 
 */
let index = require('./routes/index');
app.use('/', index);
/**
 * @memberof module:routes/personaForm 
 */
let personaForm = require('./routes/personaForm')
app.use('/control', personaForm);
/**
 * @memberof module:routes/courseForm 
 */
let courseForm = require('./routes/courseForm')
app.use('/control', courseForm);
/**
 * @memberof module:routes/videoForm 
 */
let videoForm = require('./routes/videoForm')
app.use('/control4', videoForm);
/**
 * @memberof module:routes/mailForm 
 */
let mailForm = require('./routes/mailForm')
app.use('/control3', mailForm);
/**
 * @memberof module:routes/fileForm 
 */
let fileForm = require('./routes/fileForm')
app.use('/control5', fileForm);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
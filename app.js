global.__basedir = __dirname;
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const fs = require('fs');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const logDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = require('./lib/logger');
logger.warn('Starting App.');

const app = express();

app.use(helmet());
app.use(require('express-session')({
  secret: 'keyboard cat', resave: true, saveUninitialized: true,
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  if (err.status === 404) {
    res.locals.message = '페이지를 찾을 수 없습니다.';
    res.locals.status = 404;
  } else {
    res.locals.message = '페이지에 오류가 발생했습니다.';
    res.locals.status = 500;
  }
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // add this line to include winston logging
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

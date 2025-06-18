require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exHbs = require('express-handlebars');
const multer = require('multer');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const bodyParser = require('body-parser');
var app = express();
var db = require('./config/connection');
var session = require('express-session');
var Handlebars = require('handlebars');

console.log('MY_SECRET_KEY_PATH:', process.env.MY_SECRET_KEY_PATH);

// Register custom Handlebars helpers
Handlebars.registerHelper("inc", function(value) {
  return parseInt(value) + 1;
});
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

// Middleware to set current path
app.use((req, res, next) => {
  res.locals.currentPath = req.path; // Store the current path
  next();
});
app.use(express.static('public'));


// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// View engine setup
app.engine('hbs', exHbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layout/'),
  partialsDir: path.join(__dirname, 'views/partials/')
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'Key',
  resave: false,
  saveUninitialized: false
}));

// Database connection
db.connect((err) => {
  if (err) {
    console.log('Error: ' + err);
  } else {
    console.log('Database Connected');
  }
});

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// Define routes
app.use('/', userRouter);
app.use('/admin', adminRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error'); // Ensure you have an error.hbs view
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

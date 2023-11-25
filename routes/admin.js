var express = require('express');
var router = express.Router();
var ctrlHelpers = require('../helpers/ctrl-helpers')
const date = require('date-and-time');
var db = require('../config/connection')
var collection = require('../config/collection')
var multer = require('multer')
const path = require('path');


/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.loggedIn) {
    res.render('pages/admin/admin-homePage', { admin: true, user: req.session.user });
  } else {
    res.redirect('/admin/auth/login')
  }
});


router.get('/auth/signup', (req, res) => {
  res.render('pages/admin/ctrl-signup', { ctrl: true, signup: true, admin: true })
})

router.post('/auth/signup', (req, res) => {
  console.log(req.body);

  ctrlHelpers.doSignup(req.body).then((response) => {
    if (response.status) {
      console.log('signup success')
      res.redirect('/admin/auth/login')
    } else {
      console.log('signup failed')
      res.redirect('/admin/auth/signup')
    }

    console.log(response);

  })
})

router.get('/auth/login', function (req, res, next) {
  res.render('pages/admin/ctrl-signup', { ctrl: true, login: true, admin: true });
});

router.post('/auth/login', (req, res) => {
  ctrlHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      req.session.userId = response.user._id
      res.redirect('/admin')
    } else {

      res.redirect('/admin/auth/login')
    }

  })
})

router.get('/auth/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggidIn = false
  res.redirect('/admin')
})

router.get('/add-feed', function (req, res, next) {
  if (req.session.loggedIn) {
    const now = new Date();
    const pattern = date.compile('ddd, MMM DD YYYY');
    const dateNow = date.format(now, pattern);

    res.render('pages/admin/add-feed', { admin: true, user: req.session.user, dateNow });
  } else {
    res.redirect('/admin/auth/login')
  }
});

const now = new Date();
const pattern = date.compile('YYYY-MM-DD HH-mm-ss');
const dateNow = date.format(now, pattern);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, dateNow + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage });

router.post('/add-feed', upload.single('photo'), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  if (req.file) {
    console.log(req.file);
    console.log(req.body);

    const newFeed = {
      ...req.body,
      photo: req.file.filename // or another property from req.file
    };

    db.get().collection(collection.FEED_COLLECTION).insertOne(newFeed).then((data) => {
      res.redirect('/admin')
    })
  } else {
    res.status(400).send({ error: 'No file uploaded' });
  }
});


module.exports = router;

var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers');
const { ObjectId } = require('mongodb');
var Handlebars = require('handlebars');
var db = require('../config/connection')
var collection = require('../config/collection')
const date = require('date-and-time');


/* GET home page. */
router.get('/', function (req, res, next) {
  userHelpers.getFeed().then((feeds) => {
    userHelpers.getPhoto().then((photo) => {
      userHelpers.getAnnouncement().then((announcement) => {
        userHelpers.getCarousel().then((carousel) => {
          console.log(announcement);
          console.log(carousel);
          res.render('pages/user/user-homePage', { admin: false, carousel, announcement, title: 'Darul Irfan Pandikkad - DIIA', feeds, photo });
        })
      })
    })
  })

});

router.get('/about/visionaries', function (req, res, next) {
  res.render('pages/user/visionaries', { admin: false, title: 'Our Visionaries - DIIA' });
});

router.get('/academics', function (req, res, next) {
  res.render('pages/user/academics', { admin: false, title: 'Academics - DIIA' });
});

router.get('/offices', function (req, res, next) {
  res.render('pages/user/offices', { admin: false, title: 'Offices - DIIA' });
});

router.get('/unions/lisan', function (req, res, next) {
  res.render('pages/user/unions', { admin: false, lisan: true, dsc: false, title: 'Unions - DIIA' });
});

router.get('/unions/dsc', function (req, res, next) {
  res.render('pages/user/unions', { admin: false, lisan: false, dsc: true, title: 'Unions - DIIA' });
});

router.get('/academics/programs', function (req, res, next) {
  res.render('pages/user/academics', { admin: false, programs: true, co: false, extra: false, title: 'Academics - DIIA' });
});

router.get('/academics/co-curricular', function (req, res, next) {
  res.render('pages/user/academics', { admin: false, programs: false, co: true, extra: false, title: 'Academics - DIIA' });
});

router.get('/academics/extra-curricular', function (req, res, next) {
  res.render('pages/user/academics', { admin: false, programs: false, co: false, extra: true, title: 'Academics - DIIA' });
});

router.get('/admission', function (req, res, next) {
  res.render('pages/user/admission', { admin: false, title: 'Admission - DIIA' });
});

router.get('/feeds/:id', function (req, res, next) {
  userHelpers.readFeed(new ObjectId(req.params.id)).then((feed) => {
    let feeds = feed.feed;
    let relatedFeeds = feed.relatedFeeds;
    console.log(feeds);
    console.log(relatedFeeds);
    res.render('pages/user/feeds', { admin: false, title: 'Feeds - DIIA', feeds, relatedFeeds });
  })
});

router.get('/feeds-page', function (req, res, next) {
  userHelpers.getFeed().then((feeds) => {
    res.render('pages/user/feeds-page', { admin: false, title: 'Feeds - DIIA', feeds });
  });
});

router.get('/forms', function (req, res, next) {
  userHelpers.getForm().then((forms) => {
    console.log(forms);
    res.render('pages/user/forms', { admin: false, forms, title: 'Forms - DIIA' });
  });
});

router.get('/donate', function (req, res, next) {
  res.render('pages/user/donation', { admin: false, title: 'Donate - DIIA' });
});

router.get('/gallery', function (req, res, next) {
  userHelpers.getPhotopage().then((photo) => {
    res.render('pages/user/gallery', { admin: false, photo, title: 'Gallery - DIIA' });
  });
});

module.exports = router;

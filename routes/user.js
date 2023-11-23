var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/user/user-homePage', { admin:false });
});

router.get('/about/visionaries', function(req, res, next) {
  res.render('pages/user/visionaries', { admin:false });
});

router.get('/academics', function(req, res, next) {
  res.render('pages/user/academics', { admin:false });
});

router.get('/offices', function(req, res, next) {
  res.render('pages/user/offices', { admin:false });
});

router.get('/unions/lisan', function(req, res, next) {
  res.render('pages/user/unions', { admin:false, lisan:true, dsc:false });
});

router.get('/unions/dsc', function(req, res, next) {
  res.render('pages/user/unions', { admin:false, lisan:false, dsc:true });
});

router.get('/academics/programs', function(req, res, next) {
  res.render('pages/user/academics', { admin:false, programs:true, co:false, extra:false });
});

router.get('/academics/co-curricular', function(req, res, next) {
  res.render('pages/user/academics', { admin:false, programs:false, co:true, extra:false });
});

router.get('/academics/extra-curricular', function(req, res, next) {
  res.render('pages/user/academics', { admin:false, programs:false, co:false, extra:true });
});


module.exports = router;

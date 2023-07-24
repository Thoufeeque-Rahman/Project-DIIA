var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('pages/admin/admin-homePage', { admin:true });
});

module.exports = router;

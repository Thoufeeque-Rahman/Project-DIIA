var express = require('express');
var router = express.Router();
var ctrlHelpers = require('../helpers/ctrl-helpers')
const date = require('date-and-time');
var db = require('../config/connection')
var collection = require('../config/collection')
var multer = require('multer')
const path = require('path');
const userHelpers = require('../helpers/user-helpers');
const { ObjectId } = require('mongodb');
const fs = require('fs');


/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.loggedIn) {
    res.render('pages/admin/admin-homePage', { admin: true, user: req.session.user, title: 'Admin Home - DIIA' });
  } else {
    res.redirect('/admin/auth/login')
  }
});


router.get('/auth/signup', (req, res) => {
  res.render('pages/admin/ctrl-signup', { ctrl: true, signup: true, admin: true, title: 'Admin Signup - DIIA' })
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
  res.render('pages/admin/ctrl-signup', { ctrl: true, login: true, admin: true, title: 'Admin Login - DIIA' });
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

    res.render('pages/admin/add-feed', { admin: true, addFeed: true, user: req.session.user, dateNow, title: 'Admin Add Feeds - DIIA' });
  } else {
    res.redirect('/admin/auth/login')
  }
});

function dateCreate() {
  const now = new Date();
  const pattern = date.compile('ddd, MMM DD YYYY , HH;mm;ss');
  const dateNow = date.format(now, pattern);

  return dateNow;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, dateCreate() + path.extname(file.originalname))
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

    ctrlHelpers.addFeed(newFeed).then((response) => {
      if (response.status) {
        res.redirect('/admin')
      } else {
        res.redirect('/admin/view-feeds')
      }
    })
  } else {
    res.status(400).send({ error: 'No file uploaded' });
  }
});

router.post('/edit-feed', upload.single('photo'), (req, res) => {
  console.log(req.body);
  console.log(req.file);

  if (req.file) {
    console.log(req.file);
    console.log(req.body);

    ctrlHelpers.getFeed(req.body.id).then((existingFeed) => {
      if (existingFeed && existingFeed.photo) {
        // Delete the existing image file
        fs.unlinkSync(path.join(__dirname, '../uploads/', existingFeed.photo));
      }

      const newFeed = {
        ...req.body,
        photo: req.file.filename // or another property from req.file
      };

      ctrlHelpers.updateFeed(newFeed).then((response) => {
        if (response.status) {
          res.redirect('/admin')
        } else {
          res.redirect('/admin/view-feeds')
        }
      });
    });
  } else {
    res.status(400).send({ error: 'No file uploaded' });
  }
});

router.get('/view-feeds', function (req, res, next) {
  if (req.session.loggedIn) {
    db.get().collection(collection.FEED_COLLECTION).find().toArray().then((feeds) => {

      res.render('pages/admin/view-feeds', { admin: true, user: req.session.user, feedPage: true, feeds, title: 'Admin View Feeds - DIIA' });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/feeds/:id', function (req, res, next) {
  if (req.session.user) {
    userHelpers.readFeed(new ObjectId(req.params.id)).then((feed) => {
      let feeds = feed.feed;
      let relatedFeeds = feed.relatedFeeds;
      console.log(feeds);
      console.log(relatedFeeds);
      res.render('pages/user/feeds', { admin: true, title: 'Feeds - DIIA', feeds, relatedFeeds });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/edit-feeds/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    db.get().collection(collection.FEED_COLLECTION).findOne({ _id: new ObjectId(req.params.id) }).then((editFeed) => {
      console.log(editFeed);
      res.render('pages/admin/add-feed', { admin: true, user: req.session.user, editFeed, title: 'Admin Edit Feeds - DIIA' });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/delete-feed/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    ctrlHelpers.getFeed(new ObjectId(req.params.id)).then((existingFeed) => {
      console.log(existingFeed);
      if (existingFeed && existingFeed.photo) {
        // Delete the existing image file
        console.log(existingFeed.photo);
        fs.unlinkSync(path.join(__dirname, '../public/images/uploads/', existingFeed.photo));
      }
    });
    db.get().collection(collection.FEED_COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) }).then((response) => {
      res.redirect('/admin/view-feeds')
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/add-photo', function (req, res, next) {
  if (req.session.loggedIn) {
    const now = new Date();
    const pattern = date.compile('ddd, MMM DD YYYY , HH:mm:ss');
    const dateNow = date.format(now, pattern);


    res.render('pages/admin/add-feed', { admin: true, photoGallery: true, dateNow, user: req.session.user, title: 'Admin Add Photo - DIIA' });
  } else {
    res.redirect('/admin/auth/login')
  }
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/uploads/gallery'))
  },
  filename: function (req, file, cb) {
    cb(null, dateCreate() + path.extname(file.originalname))
  }
})

const imageUpload = multer({ storage: imageStorage });

router.post('/add-photo', imageUpload.single('photo'), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  if (req.file) {
    console.log(req.file);
    console.log(req.body);

    const newPhoto = {
      ...req.body,
      photo: req.file.filename // or another property from req.file
    };

    ctrlHelpers.addPhoto(newPhoto).then((response) => {
      if (response.status) {
        res.redirect('/admin')
      } else {
        res.redirect('/admin/view-photo-gallery')
      }
    })
  } else {
    res.status(400).send({ error: 'No file uploaded' });
  }
});

router.get('/view-photo-gallery', function (req, res, next) {
  if (req.session.loggedIn) {
    db.get().collection(collection.PHOTO_COLLECTION).find().sort({ _id: -1 }).toArray().then((photos) => {
      res.render('pages/admin/view-feeds', { admin: true, photoPage: true, user: req.session.user, photos, title: 'Admin View Photo Gallery - DIIA' });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/delete-photo/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    ctrlHelpers.getPhoto(new ObjectId(req.params.id)).then((existingFeed) => {
      console.log(existingFeed);
      if (existingFeed && existingFeed.photo) {
        // Delete the existing image file
        console.log(existingFeed.photo);
        fs.unlinkSync(path.join(__dirname, '../public/images/uploads/gallery/', existingFeed.photo));
      }
    });
    db.get().collection(collection.PHOTO_COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) }).then((response) => {
      res.redirect('/admin/view-photo-gallery')
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/view-forms', function (req, res, next) {
  if (req.session.loggedIn) {
    db.get().collection(collection.FORM_COLLECTION).find().sort({ _id: 1 }).toArray().then((forms) => {
      res.render('pages/user/forms', { admin: true, user: req.session.user, forms, title: 'Admin View Forms - DIIA' });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.post('/add-form', (req, res) => {
  console.log(req.body);
  ctrlHelpers.addForm(req.body).then((response) => {
    if (response.status) {
      res.redirect('/admin')
    } else {
      res.redirect('/admin/view-forms')
    }
  })
});

router.get('/delete-form/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    db.get().collection(collection.FORM_COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) }).then((response) => {
      res.redirect('/admin/view-forms')
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

module.exports = router;

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
const { default: ro } = require('date-and-time/locale/ro');
const { default: ru } = require('date-and-time/locale/ru');
const { log } = require('console');
const moment = require('moment-timezone');


/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.loggedIn) {
    var date = dateCreate();
    res.render('pages/admin/admin-homePage', { admin: true, date, user: req.session.user, title: 'Admin Home - DIIA' });
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
    // db.get().collection(collection.FORM_COLLECTION).find().sort({ _id: 1 }).toArray().then((forms) => {
    //   res.render('pages/user/forms', { admin: true, user: req.session.user, forms, title: 'Admin View Forms - DIIA' });
    // })
    userHelpers.getForm().then((forms) => {
      console.log(forms.Academics);
      res.render('pages/user/forms', { admin: false, AcademicForms: forms.Academics, GeneralForms: forms.General, ExamForms: forms.Exam, title: 'Forms - DIIA' });
    });
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

router.post('/add-announcement', function (req, res, next) {
  console.log(req.body);
  const now = new Date();
  const pattern = date.compile('YYYY, MM, DD');
  const dateNow = date.format(now, pattern);
  req.body.date = dateNow;
  ctrlHelpers.addAnnouncement(req.body).then((response) => {
    res.redirect('/admin/view-announcements')
  })
});

router.get('/view-notifications', function (req, res, next) {
  if (req.session.loggedIn) {
    var date = dateCreate();
    db.get().collection(collection.NOTIFICATION_COLLECTION).find().sort({ _id: -1 }).toArray().then((notifications) => {
      res.render('pages/admin/view-feeds', { admin: true, date, notificationPage: true, user: req.session.user, notifications, title: 'Admin View Notifications - DIIA' });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

const notiImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/uploads/notifications'))
  },
  filename: function (req, file, cb) {
    cb(null, dateCreate() + path.extname(file.originalname))
  }
})

const notiImageUpload = multer({ storage: notiImageStorage });

router.post('/add-notification', notiImageUpload.single('notiImage'), (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  if (req.file) {
    console.log(req.file);
    console.log(req.body);

    const newNotification = {
      ...req.body,
      notiImage: req.file.filename // or another property from req.file
    };

    ctrlHelpers.addNotification(newNotification).then((response) => {
      if (response.status) {
        res.redirect('/admin')
      } else {
        res.redirect('/admin/view-notifications')
      }
    })
  } else {
    res.status(400).send({ error: 'No file uploaded' });
  }
});


router.get('/delete-notification/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    ctrlHelpers.getNotification(new ObjectId(req.params.id)).then((existingNotification) => {
      console.log(existingNotification);
      if (existingNotification && existingNotification.notiImage) {
        // Delete the existing image file
        console.log(existingNotification.notiImage);
        fs.unlinkSync(path.join(__dirname, '../public/images/uploads/notifications/', existingNotification.notiImage));
      }
    });
    db.get().collection(collection.NOTIFICATION_COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) }).then((response) => {
      res.redirect('/admin/view-notifications')
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/change-notification-status/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    ctrlHelpers.getNotification(new ObjectId(req.params.id)).then((existingNotification) => {
      console.log(existingNotification);
      console.log('notiStatus:', existingNotification[0].notiStatus); // log the notiStatus
      if (existingNotification[0].notiStatus == "true") {
        db.get().collection(collection.NOTIFICATION_COLLECTION).updateOne({ _id: new ObjectId(req.params.id) },
          {
            $set: {
              notiStatus: "false"
            }
          }).then((response) => {
            console.log(response);
            res.redirect('/admin/view-notifications')
          })
      } else if (existingNotification[0].notiStatus == "false") {
        db.get().collection(collection.NOTIFICATION_COLLECTION).updateOne({ _id: new ObjectId(req.params.id) },
          {
            $set: {
              notiStatus: "true"
            }
          }).then((response) => {
            console.log(response);
            res.redirect('/admin/view-notifications')
          })
      } else {
        console.log('Unexpected notiStatus:', existingNotification.notiStatus); // log unexpected notiStatus
        res.redirect('/admin/view-notifications')
      }
    }).catch((error) => {
      console.log('Error getting notification:', error); // log any errors
      res.redirect('/admin/view-notifications')
    });
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/view-announcements', function (req, res, next) {
  if (req.session.loggedIn) {
    var date = dateCreate();
    db.get().collection(collection.ANNOUNCEMENT_COLLECTION).find().sort({ _id: -1 }).toArray().then((announcements) => {
      res.render('pages/admin/view-feeds', { admin: true, date, announcementPage: true, user: req.session.user, announcements, title: 'Admin View Announcements - DIIA' });
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/delete-announcement/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    db.get().collection(collection.ANNOUNCEMENT_COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) }).then((response) => {
      res.redirect('/admin/view-announcements')
    })
  } else {
    res.redirect('/admin/auth/login')
  }
});

router.get('/change-announcement-status/:id', function (req, res, next) {
  if (req.session.loggedIn) {
    ctrlHelpers.getAnnouncement(new ObjectId(req.params.id)).then((existingAnnouncement) => {
      console.log(existingAnnouncement);
      console.log('annStatus:', existingAnnouncement[0].annStatus); // log the annStatus
      if (existingAnnouncement[0].annStatus == "true") {
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION).updateOne({ _id: new ObjectId(req.params.id) },
          {
            $set: {
              annStatus: "false"
            }
          }).then((response) => {
            console.log(response);
            res.redirect('/admin/view-announcements')
          })
      } else if (existingAnnouncement[0].annStatus == "false") {
        db.get().collection(collection.ANNOUNCEMENT_COLLECTION).updateOne({ _id: new ObjectId(req.params.id) },
          {
            $set: {
              annStatus: "true"
            }
          }).then((response) => {
            console.log(response);
            res.redirect('/admin/view-announcements')
          })
      } else {
        console.log('Unexpected annStatus:', existingAnnouncement.annStatus); // log unexpected annStatus
        res.redirect('/admin/view-announcements')
      }
    }).catch((error) => {
      console.log('Error getting announcement:', error); // log any errors
      res.redirect('/admin/view-announcements')
    });
  } else {
    res.redirect('/admin/auth/login')
  }
});


//Computer Lab 
router.get('/clab', async (req, res) => {
  if (req.session.loggedIn) {
    var date = dateCreate();
   res.render('pages/admin/computer-lab', { supervisor: true, date, user: req.session.user, title: 'Computer Lab - DIIA' });
  } else {
    res.redirect('/admin/auth/super-login')
  } 
});

router.get('/auth/super-login',(req,res)=>{
  res.render('pages/supervisor/ctrl-login',{login:true});
});

router.post('/auth/super-login',(req,res)=>{

  ctrlHelpers.doSuperLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      req.session.userId = response.user._id
      res.redirect('/admin/clab')
    } else {

      res.redirect('/admin/auth/super-login')
    }

  })
});

router.get('/auth/super-signup',(req,res)=>{
  res.render('pages/supervisor/ctrl-login',{signup:true});
});

router.post('/auth/super-signup',(req,res)=>{
  console.log(req.body);

  ctrlHelpers.doSuperSignup(req.body).then((response) => {
    if (response.status) {
      console.log('signup success')
      res.redirect('/admin/auth/super-login')
    } else {
      console.log('signup failed')
      res.redirect('/admin/auth/super-signup')
    }

    console.log(response);

  })
})

router.get('/auth/super-logout', (req, res) => {
  req.session.user = null
  req.session.userLoggidIn = false
  res.redirect('/')
})


router.get('/data-entry', (req, res) => {
  if (req.session.loggedIn) {
    res.render('pages/supervisor/data-entry', { supervisor: true, user: req.session.user, title: 'Computer Lab - DIIA' });
  } else {
    res.redirect('/admin/auth/super-login');
  }
});

router.get('/view-data', function (req, res, next) {
  // res.set('Cache-Control', 'no-store');
  if (req.session.loggedIn) {
    db.get().collection(collection.DATA_COLLECTIONS).find().toArray()
      .then((datas) => {
        res.render('pages/supervisor/view-data', {
          supervisor: true,
          user: req.session.user,
          dataPage: true,
          datas,
          title: 'Computer Lab Data  - DIIA'
        });
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.redirect('/admin/auth/super-login');
  }
});

router.post('/data-entry',(req,res)=>{
  console.log(req.body);
  const now = moment().tz('Asia/Kolkata');
  const dateNow = now.format('YYYY-MM-DD');
  const timeNow = now.format('hh:mm:ss A'); // 12-hour format with AM/PM
  const user = req.session.user ? req.session.user.username : '';

  req.body.date = `${dateNow} ${timeNow}`;
  req.body.supervisor = user;

  console.log(user);
  console.log('Supervisor:',req.body.supervisor);
  ctrlHelpers.addData(req.body).then((response)=>{
    setTimeout(() => {
      res.redirect('/admin/data-entry'); // Redirect user after data is added
  }, 10000); // 3000 milliseconds = 3 seconds
})
  })

router.get('/data-base',(req, res)=>{
  if (req.session.loggedIn) {
    db.get().collection(collection.DATABASE_COLLECTIONS).find().toArray()
      .then((dat) => {
        res.render('pages/supervisor/view-data', {
          supervisor: true,
          user: req.session.user,
          dataBase: true,
          dat,
          title: 'Computer Lab Data  - DIIA'
        });
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
      });
  } else {
    res.redirect('/admin/auth/super-login');
  }
})


// router.post('/calculate-rent', async (req, res) => {
//   try {
//     // Fetch all data entries
//     const Data = await collection(collection.DATA_COLLECTIONS).find();

//     // Calculate rent and update users collection
//     for (const entry of collection(collection.DATA_COLLECTIONS)) {
//       let rent = 0;
//       if (entry.purpose === 'personal' || entry.purpose === 'class') {
//         rent = 5;
//       }

//       // Update the corresponding user's rent in the users collection
//       await collection(collection.STUDENTS_COLLECTION).updateOne(
//         { _id: entry.userId }, // Assuming userId is linked to users collection
//         { $inc: { rent: rent } } // Increment rent field in users collection
//       );
//     }

//     res.status(200).json({ message: 'Rent calculation and update completed successfully' });
//   } catch (error) {
//     console.error('Error calculating rent:', error);
//     res.status(500).json({ error: 'Error calculating rent' });
//   }
// });

// router.get('/getStudentName/:adno', async (req, res) => {
//   const adno = req.params.adno;
//   try {
//     const student = await collection(collection.STUDENTS_COLLECTION).findOne({ adno: adno });
//     console.log(student);
//     if (student) {
//       res.json({ name: student.name });
//     } else {
//       res.json({ name: null });
//     }
//   } catch (err) {
//     res.status(500).send('An error occurred');
//   }
// });




module.exports = router;

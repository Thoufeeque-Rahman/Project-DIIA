var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers');
const { ObjectId } = require('mongodb');
var Handlebars = require('handlebars');
var db = require('../config/connection')
var collection = require('../config/collection')
const date = require('date-and-time');
const transporter =require('../emailConfig')
const {google} = require('googleapis')
const auth = new google.auth.GoogleAuth({
  keyFile: './config/festtes-f7f9565d3e60.json', // Ensure the path is correct
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

/* GET home page. */
router.get('/', function (req, res, next) {
  userHelpers.getFeed().then((feeds) => {
    userHelpers.getPhoto().then((photo) => {
      userHelpers.getAnnouncement().then((announcement) => {
        userHelpers.getCarousel().then((carousel) => {
          console.log(announcement);
          console.log(carousel);
          res.render('pages/user/user-homePage', { admin: false, carousel, announcement, title: 'Darul Irfan Pandikkad - DIIA', feeds, photo, home:true });
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
    console.log(forms.Academics);
    res.render('pages/user/forms', { admin: false, AcademicForms: forms.Academics, GeneralForms: forms.General, ExamForms: forms.Exam, title: 'Forms - DIIA' });
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

router.get('/about', function (req, res, next) {
  res.render('pages/user/academics', { admin: false,about:true, title: 'About - DIIA' });
});

router.get('/maintenance', function (req, res, next) {
  res.render('pages/user/maintenance', { admin: false, title: 'Maintenance - DIIA' });
});

router.get('/about/principle-message', function (req, res, next) {
  res.render('pages/user/academics', { admin: false, princi:true, title: 'Principle Message - DIIA' });
});


//fest Documents

router.get('/fest', function (req, res, next) {

  db.get().collection(collection.FEST_COLLECTION).find().sort({updatedAt: -1}).toArray().then((festDocuments) => {
    res.render('pages/user/fest-docs', { 
      admin: false, 
      festDocuments, 
      user: req.session.user, 
      title: 'Fest Docs - DIIA' 
    });
    console.log(festDocuments);

  })
})    
router.get('/arts-scoreboard', async (req, res) => {
  async function readSheet() {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1vGCP6KdqsrOMqDciYu1LtqfoLas6-cghgqT1Z9lQ1K4';
    const range = 'Arts!A1:E10'; // Specify your desired range

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const rows = response.data.values;

      const jsonData = {
        Siri: {},
        Alexa: {},
        Bixby: {},
        Cortona: {},
      };

      // Process the rows and populate the jsonData object
      rows.slice(1).forEach(row => {
        const category = row[0]; // Category column
        jsonData.Siri[category] = row[1];   // Siri score
        jsonData.Alexa[category] = row[2];  // Alexa score
        jsonData.Bixby[category] = row[3];  // Bixby score
        jsonData.Cortona[category] = row[4]; // Cortona score
      });

      return jsonData;
    } catch (error) {
      console.error('Error reading from the sheet:', error);
      throw new Error('Data fetch error');
    }
  }

  try {
    const data = await readSheet(); // Get the data from Google Sheets
    console.log(data);
    
    res.render('pages/user/scoreboard.hbs', {
      data,
      arts:true
     }); // Pass data to the template for rendering
  } catch (error) {
    res.status(500).send('Error accessing the data');
  }
});

router.get('/sports-scoreboard', async (req, res) => {
  async function readSheet() {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1vGCP6KdqsrOMqDciYu1LtqfoLas6-cghgqT1Z9lQ1K4';
    const range = 'Sports!A1:E10'; // Specify your desired range

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      const rows = response.data.values;

      const jsonData = {
        Siri: {},
        Alexa: {},
        Bixby: {},
        Cortona: {},
      };

      // Process the rows and populate the jsonData object
      rows.slice(1).forEach(row => {
        const category = row[0]; // Category column
        jsonData.Siri[category] = row[1];   // Siri score
        jsonData.Alexa[category] = row[2];  // Alexa score
        jsonData.Bixby[category] = row[3];  // Bixby score
        jsonData.Cortona[category] = row[4]; // Cortona score
      });

      return jsonData;
    } catch (error) {
      console.error('Error reading from the sheet:', error);
      throw new Error('Data fetch error');
    }
  }

  try {
    const data = await readSheet(); // Get the data from Google Sheets
    console.log(data);
    
    res.render('pages/user/scoreboard.hbs', { data, 
      sports:true}); // Pass data to the template for rendering
  } catch (error) {
    res.status(500).send('Error accessing the data');
  }
});


router.post('/submit-report', (req, res) => {
  const reportDescription = req.body['report-description'];

  const mailOptions = {
    to: 'itsmeiboyno9@gmail.com',
    subject: 'New Report Submission',
    text: `Report Description: ${reportDescription}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error occurred: ' + error.message);
    }
    res.status(200).send('Report submitted successfully!');
  });
});

module.exports = router;

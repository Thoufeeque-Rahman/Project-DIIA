const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',  // Use environment variables here
    pass: 'your-password'          // Use environment variables here
  }
});

module.exports = transporter;
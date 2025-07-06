const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email sending function
async function sendEmail(formData) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, // Send to admin or fallback
      subject: 'New Workshop Registration',
      text: `New registration details:\n\n${JSON.stringify(formData, null, 2)}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// POST endpoint to handle form submissions
app.post('/submit-form', async (req, res) => {
  const formData = {
    fullName: req.body.fullName,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    ageRange: req.body.ageRange,
    occupation: req.body.occupation,
    educationLevel: req.body.educationLevel,
    institution: req.body.institution,
    location: req.body.location,
    expectations: req.body.expectations,
  };

  const emailSent = await sendEmail(formData);
  if (emailSent) {
    res.status(200).json({ message: 'Form submitted and email sent successfully.' });
  } else {
    res.status(500).json({ message: 'Form submitted but failed to send email.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

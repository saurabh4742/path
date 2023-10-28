const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// Mock database to store user information - replace this with your database implementation
const users = [
  { email: 'user@example.com', password: 'password123', otp: null },
  // Other user data...
];

// Generate and send OTP to the user's email
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find((u) => u.email === email);

  if (user) {
    const generatedOTP = crypto.randomInt(100000, 999999); // Generate a 6-digit OTP
    user.otp = generatedOTP;

    // Send the OTP to the user's email (using nodemailer - replace with your email service configuration)
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password',
      },
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${generatedOTP}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending OTP.');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('OTP sent successfully.');
      }
    });
  } else {
    res.status(404).send('User not found.');
  }
});

// Verify OTP and reset password
app.post('/verify-otp', (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = users.find((u) => u.email === email);

  if (user && user.otp === otp) {
    // Reset the password
    user.password = newPassword;
    user.otp = null;
    res.status(200).send('Password reset successfully.');
  } else {
    res.status(400).send('Invalid OTP. Password reset failed.');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

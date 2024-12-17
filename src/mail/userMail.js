const nodemailer = require("nodemailer");
const { query } = require("../config/db");
const helper = require("../lib/helper");
let transporter = nodemailer.createTransport({
  host: process.env.NODE_EMAIL_HOST,
  port: process.env.NODE_EMAIL_PORT,
  secure: true,
  requireTLS: false,
  services: process.env.NODE_EMAIL_SERVICES,
  auth: {
    user: process.env.NODE_EMAIL_USER, // Your email address
    pass: process.env.NODE_EMAIL_PASSWORD, // Your password
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const sendVerification = async (data) => {
  console.log("hello world");
  console.log("data", data);
  const mailOptions = {
    from: process.env.NODE_EMAIL_USER,
    to: data.email,
    subject: `Account Verification - SK Systems`,
    html: `
        <p>Hello ${data.first_name},</p>
        <p>Thank you for registering with SK Systems. Please click the link below to verify your account:</p>
        <a href="${process.env.NODE_FE_DOMAIN}/verify/${data.token}">${process.env.NODE_FE_DOMAIN}/verify/${data.token}</a>
    `,
  };

  const results = await query({
    sql: "INSERT INTO tokens (token, created_at, updated_at, type, status) VALUES (?, ?, ?, ?, ?)",
    values: [
      data?.token,
      helper.currentTimestamp(),
      helper.currentTimestamp(),
      data?.type,
      "pending",
    ],
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Error sending email to ${data.email}:`, error);
    } else {
      console.log(`Email sent successfully to ${data.email}:`, info.response);
    }
  });
};

const sendVerificationSuccess = async (data) => {
  const mailOptions = {
    from: process.env.NODE_EMAIL_USER,
    to: data.email,
    subject: `Account Verification Successful - SK Systems`,
    html: `
        <p>Hello ${data.first_name},</p>
        <p>Your account has been successfully verified. You can now login to your account.</p>
        <p><a href="${process.env.NODE_FE_DOMAIN}">${process.env.NODE_FE_DOMAIN}</a> </p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Error sending email to ${data.email}:`, error);
    } else {
      console.log(`Email sent successfully to ${data.email}:`, info.response);
    }
  });
};

module.exports = { sendVerification, sendVerificationSuccess };

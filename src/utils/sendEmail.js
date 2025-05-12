const nodemailer = require("nodemailer");
require('dotenv').config();

const sendEmail = async (to, subject, message) => {
  console.log("hello");
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use other services like 'Outlook', 'Yahoo', etc.
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: message,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = sendEmail;
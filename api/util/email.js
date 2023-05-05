const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Transporter to send email using SendGrid in PRODUCTION
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return 1;
    }

    // Otherwise send email using MailTrap in DEVELOPMENT
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send function called by email types below
  async send(template, subject) {
    // Render HTML based on a pug template within emails folder
    const html = pug.renderFile(
      `${__dirname}/emails/templates/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // Send Welcome Email
  async sendWelcome() {
    await this.send("welcome", "Welcome to the TrackIt App!");
  }

  // Send Password Reset Email
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Reset your Password (valid for 10 minutes)"
    );
  }
};

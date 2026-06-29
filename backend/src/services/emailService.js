const nodemailer =
  require("nodemailer");

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },
  });

const sendAlertEmail =
  async (
    subject,
    message
  ) => {
    try {
      await transporter.sendMail({
        from:
          process.env.EMAIL_USER,

        to:
          process.env.ALERT_EMAIL,

        subject,

        text: message,
      });

      console.log(
        "Alert email sent"
      );
    } catch (error) {
      console.error(
        "Email error:",
        error.message
      );
    }
  };

module.exports = {
  sendAlertEmail,
};
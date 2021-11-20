const nodemailer = require('nodemailer');
require('dotenv').config();

const sendInfoAccout = async (data) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.email_app, // generated ethereal user
        pass: process.env.email_password, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Admin_CMS" <cnnguyenvantien@gmail.com>', // sender address
      to: data.toEmail, // list of receivers
      subject: 'Hello ✔', // Subject line
      html: `
                <h1>Hello ${data.name}</h1>
            `, // html body
    });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  sendInfoAccout: sendInfoAccout,
};

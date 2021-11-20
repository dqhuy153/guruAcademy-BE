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
                <h3>Xin chào ${data.user_name}</h3>
                <p>bạn nhận được mail này bởi vì bạn đã đăng ký thực hiện đồ án capstone của viện đạo tạo quốc tế khoa CNPM.</p>
                <p>Đây là password của bạn: ${data.account_password}</p>
                <a href='https://mydtu.duytan.edu.vn/Sites/index.aspx?p=home_timetable&functionid=13#' target="_blank">Đăng nhập ngay</a>
            `, // html body
    });
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  sendInfoAccout: sendInfoAccout,
};

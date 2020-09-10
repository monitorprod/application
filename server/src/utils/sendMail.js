const nodemailer = require("nodemailer");

const sendMail = async ({ data }) => {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "monitorprodu@gmail.com",
      pass: "jictjqygvobigqpl"
    }
  });
  // let transporter = nodemailer.createTransport({
  //   host: "smtp.monitorprod.com.br",
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: "comercial@monitorprod.com.br",
  //     pass: "inicio00"
  //   }
  // });
  await transporter.sendMail(data);
};

module.exports = sendMail;

const sendMail = require("../../utils/sendMail");

module.exports = function() {
  return async context => {
    const { result } = context;
    await sendMail({
      data: {
        from: `"${result.name}" <${result.email}>`,
        to: "comercial@monitorprod.com.br",
        subject: "[Website] Contato MonitorProd",
        text: `${result.message}\n\n${result.name}\n${result.phone}\n${result.email}`
      }
    });
    return context;
  };
};

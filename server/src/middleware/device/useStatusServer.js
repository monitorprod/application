module.exports = function(app) {
  app.get("/use_status_server", async (request, response) => {
    response.send({
      status: "ONLINE"
    });
  });
};

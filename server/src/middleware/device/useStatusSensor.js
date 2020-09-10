module.exports = function(app) {
  app.get("/use_status_sensor", async (request, response) => {
    response.send({
      status: "ONLINE"
    });
  });
};

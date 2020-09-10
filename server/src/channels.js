// https://docs.feathersjs.com/api/channels.html
const lodash = require("lodash");

module.exports = function (app) {
  if (typeof app.channel !== "function") {
    // If no real-time functionality has been configured just return
    return;
  }
  const companiesService = app.service("companies");
  const ticketsService = app.service("tickets");
  // const ticketMessagesService = app.service("ticket_messages");
  try {
      const publishToCompany = async data => {
        const company = await companiesService.get(
          lodash.get(data, "companyId") || lodash.get(data, "ci")
        );
        if (company) {
          return app.channel(company.uuid);
        }
    };
    const publishToUser = async (data) => {
        const ADMIN_ID = 1;
        const ticket = await ticketsService.get(lodash.get(data, "id"), {
          query: { companyUUID: "admin" }
        });
        if (ticket) {
          app.channel(app.channels).filter(connection => {
            if (connection.user.id === ticket.userId || connection.user.id === ADMIN_ID) {
              app.channel(ticket.id).join(connection);
            }
          });
          return app.channel(ticket.userId, ADMIN_ID);
        }
    };
    const publishToTicket = async data => {
        const ticket = await ticketsService.get(lodash.get(data, "ticketId"), {
          query: { companyUUID: "admin" }
        });
        if (ticket) {
          return app.channel(ticket.id);
        }
    };
    app.on("login", async (authResult, { connection }) => {
        const company = await companiesService.get(
          lodash.get(connection, "user.companyId")
        );
        if (company) {
          app.channel(company.uuid).join(connection);
        }
        const userId = lodash.get(connection, "user.id");
        if (userId) {
          app.channel(userId).join(connection);
          let query = {};
          if (!lodash.get(connection, "payload.isAdmin")) {
            query.userId = userId;
          } else {
            query.companyUUID = "admin";
          }
          const { data: tickets } = await ticketsService.find({ query });
          lodash.forEach(tickets, ticket => {
            app.channel(ticket.id).join(connection);
          });
        }
    app.service("production_orders").publish("patched", publishToCompany);
    app.service("production_orders").publish("created", publishToCompany);
    app.service("production_order_events").publish("created", publishToCompany);
    app.service("notifications").publish("created", publishToCompany);
    app.service("tickets").publish("created", publishToUser);
    app.service("tickets").publish("patched", publishToUser);
    app.service("ticket_messages").publish("created", publishToTicket);
    app.service("ticket_messages").publish("patched", publishToTicket);
    });
  } catch (e) { }
};

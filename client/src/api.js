import React from "react";
import feathers from "@feathersjs/feathers";
import socketio from "@feathersjs/socketio-client";
import auth from "@feathersjs/authentication-client";
import io from "socket.io-client";

const setCompanyUUID = async (context) => {
  const companyUUID = localStorage.getItem("companyUUID");
  const { data, params } = context;
  context.data = { ...data, companyUUID };
  params.query = {
    ...params.query,
    companyUUID,
  };
  return context;
};
const client = feathers();
client.set("cloudURL", "https://www.monitorprod.com.br");
// client.set("cloudURL", "https://monitorprod.herokuapp.com");
// client.set("cloudURL", "http://localhost:3030");
const socket = io(client.get("cloudURL"));
client
  .configure(socketio(socket, { timeout: 100000 }))
  .configure(
    auth({ storageKey: "monitorprod-jwt", storage: window.localStorage })
  )
  .hooks({
    before: {
      all: [setCompanyUUID],
    },
  });

  client.socket = socket;

export default React.createContext(client);

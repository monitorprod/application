import { lodashForEach } from "./lodash";

const getConfigs = async ({ client }) => {
  try {
    if (!client.get("config.machine.status")) {
      const { data: configs } = await client.service("configs").find();
      lodashForEach(configs, c => client.set(`config.${c.name}`, c));
    }
    if (!client.get("actionType.init")) {
      const { data: actionTypes } = await client
        .service("production_order_action_types")
        .find({ query: { $populateAll: true } });
      lodashForEach(actionTypes, type => client.set(`actionType.${type.id}`, type));
      client.set("actionType.init", true);
    }
  } catch (e) {
    console.log(e);
  }
};

export default getConfigs;

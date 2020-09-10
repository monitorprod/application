import { lodashGet } from "./lodash";

const getEventType = ({ client, type }) =>
  lodashGet(client.get(`config.productionOrder.eventType.${type}`), "value");

export default getEventType;

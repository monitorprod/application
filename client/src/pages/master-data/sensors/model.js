import { lodashGet, lodashMap, useFindService } from "../../../utils";

export const list = [
  {
    text: "Cod Sensor",
    identity: "identity",
    filter: {
      type: "string"
    }
  },
  {
    text: "Descrição",
    identity: "name",
    filter: {
      type: "string"
    }
  },
  {
    text: "Máquina",
    hasIdentity: true,
    identity: "machine",
    model: {
      service: "machines",
      identity: "machineId",
      customName: ({ data = {} }) =>
        `${data.identity ? `${data.identity} - ` : ""}${data.name || ""}`
    },
    customData: ({ data: { machine } = {} }) =>
      `${lodashGet(machine, "identity") ? `${lodashGet(machine, "identity")} - ` : ""}${lodashGet(
        machine,
        "name"
      ) || ""}`
  },
  {
    text: "Status",
    identity: "sensor_status.name",
    model: {
      service: "sensor_statuses",
      identity: "sensorStatusId"
    }
  }
];

export const form = [
  [
    {
      text: "Cod Barra",
      identity: "barcode",
      variants: "display",
      readOnly: true,
      type: "string"
    },
    {
      text: "Cod Sensor",
      identity: "identity",
      max: 10,
      variants: "display",
      readOnly: true,
      type: "string"
    }
  ],
  [
    {
      text: "Status",
      identity: "sensorStatusId",
      required: true,
      model: "sensor_statuses",
      defaultValue: {
        config: "sensor.status.init"
      }
    },
    {
      text: "Descrição",
      identity: "name",
      autoFocus: true,
      type: "string"
    },
    {
      text: "Máquina",
      icon: "build",
      identity: "machineId",
      model: {
        service: "machines",
        hasIdentity: true,
        useCustomQuery: ({ data = {} }) => {
          const { list } = useFindService({
            model: "sensors",
            query: {
              machineId: { $ne: null }
            }
          });
          if (list.length) {
            return {
              id: { $nin: lodashMap(list, ({ machineId }) => machineId) }
            };
          }
          return {};
        }
      }
    }
  ],
  [
    {
      text: "MAC",
      identity: "mac",
      variants: "display",
      readOnly: true,
      type: "string"
    },
    {
      text: "IP",
      identity: "ip",
      variants: "display",
      readOnly: true,
      type: "string"
    }
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/master-data"
  },
  {
    text: "Sensores",
    href: "/master-data/sensors"
  }
];

export const metadata = {
  name: "sensors",
  icon: "memory",
  listPath: "/master-data/sensors",
  formPath: "/master-data/sensors",
  paramsProp: "sensorId",
  newItemText: "Novo Sensor"
};

export default {
  metadata,
  list,
  form,
  links,
  options: {
    dontCreate: true,
    dontDelete: true,
    readPermissions: ["readMasterData"],
    writePermissions: ["writeMasterData"]
  },
  customContent: {
    customBreadCrumbsName: ({ data = {} }) =>
      `${data.identity ? `${data.identity} - ` : ""}${data.name}`
  },
  query: {
    $sort: { identity: 1 }
  }
};

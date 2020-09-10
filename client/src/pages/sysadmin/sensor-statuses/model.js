export const list = [
  {
    text: "Nome",
    identity: "name",
    filter: {
      type: "string"
    }
  },
  {
    text: "Descrição",
    identity: "description",
    filter: {
      type: "string"
    }
  }
];

export const form = [
  [
    {
      text: "Nome",
      identity: "name",
      autoFocus: true,
      required: true,
      type: "string"
    },
    {
      text: "Descrição",
      identity: "description",
      type: "string"
    }
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/sysadmin/master-data"
  },
  {
    text: "Status de Sensores",
    href: "/sysadmin/master-data/sensor-statuses"
  }
];

export const metadata = {
  name: "sensor_statuses",
  listPath: "/sysadmin/master-data/sensor-statuses",
  formPath: "/sysadmin/master-data/sensor-statuses",
  paramsProp: "sensorStatusId",
  newItemText: "Novo Status de Sensor"
};

export default { metadata, list, form, links };

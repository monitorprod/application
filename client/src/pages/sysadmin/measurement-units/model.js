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
  },
  {
    text: "Tipo",
    identity: "type",
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
    },
    {
      text: "Tipo",
      identity: "type",
      required: true,
      // TODO FIX DROPDOWN FOR ENUM
      enum: ["distance", "force", "frequency", "mass", "quantity", "temperature", "time", "other"]
    }
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/sysadmin/master-data"
  },
  {
    text: "Unidades de Medida",
    href: "/sysadmin/master-data/measurement-units"
  }
];

export const metadata = {
  name: "measurement_units",
  listPath: "/sysadmin/master-data/measurement-units",
  formPath: "/sysadmin/master-data/measurement-units",
  paramsProp: "measurementUnitId",
  newItemText: "Nova Unidade de Medida"
};

export default { metadata, list, form, links };

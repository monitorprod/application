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
    text: "Administração",
    href: "/administration"
  },
  {
    text: "Tipos de Máquinas",
    href: "/administration/machine-types"
  }
];

export const metadata = {
  name: "machine_types",
  listPath: "/administration/machine-types",
  formPath: "/administration/machine-types",
  paramsProp: "machineTypeId",
  newItemText: "Novo Tipo de Máquina"
};

export default { metadata, list, form, links };

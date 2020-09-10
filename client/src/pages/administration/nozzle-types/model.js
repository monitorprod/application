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
    text: "Tipos de Bico",
    href: "/administration/nozzle-types"
  }
];

export const metadata = {
  name: "nozzle_types",
  listPath: "/administration/nozzle-types",
  formPath: "/administration/nozzle-types",
  paramsProp: "nozzleTypeId",
  newItemText: "Novo Tipo de Bico"
};

export default { metadata, list, form, links };

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
    text: "Grupos de Atributos",
    href: "/administration/attributes"
  }
];

export const metadata = {
  name: "attribute_groups",
  listPath: "/administration/attributes",
  formPath: "/administration/attributes",
  paramsProp: "attributeId",
  newItemText: "Novo Grupo de Atributos"
};

export default { metadata, list, form, links };

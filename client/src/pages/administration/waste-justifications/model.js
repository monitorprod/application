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
    text: "Motivos de Refugo",
    href: "/administration/waste-justifications"
  }
];

export const metadata = {
  name: "waste_justifications",
  listPath: "/administration/waste-justifications",
  formPath: "/administration/waste-justifications",
  paramsProp: "wasteJustificationId",
  newItemText: "Novo Motivo de Refugo"
};

export default { metadata, list, form, links };

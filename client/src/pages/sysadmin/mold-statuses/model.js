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
    text: "Status de Moldes",
    href: "/sysadmin/master-data/mold-statuses"
  }
];

export const metadata = {
  name: "mold_statuses",
  listPath: "/sysadmin/master-data/mold-statuses",
  formPath: "/sysadmin/master-data/mold-statuses",
  paramsProp: "moldStatusId",
  newItemText: "Novo Status de Molde"
};

export default { metadata, list, form, links };

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
    text: "Status de Locais",
    href: "/sysadmin/master-data/plant-statuses"
  }
];

export const metadata = {
  name: "plant_statuses",
  listPath: "/sysadmin/master-data/plant-statuses",
  formPath: "/sysadmin/master-data/plant-statuses",
  paramsProp: "plantStatusId",
  newItemText: "Novo Status de Local"
};

export default { metadata, list, form, links };

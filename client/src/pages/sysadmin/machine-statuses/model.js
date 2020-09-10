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
    text: "Status de Máquinas",
    href: "/sysadmin/master-data/machine-statuses"
  }
];

export const metadata = {
  name: "machine_statuses",
  listPath: "/sysadmin/master-data/machine-statuses",
  formPath: "/sysadmin/master-data/machine-statuses",
  paramsProp: "machineStatusId",
  newItemText: "Novo Status de Máquina"
};

export default { metadata, list, form, links };

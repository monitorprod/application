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
    text: "Status de Usuários",
    href: "/sysadmin/master-data/user-statuses"
  }
];

export const metadata = {
  name: "user_statuses",
  listPath: "/sysadmin/master-data/user-statuses",
  formPath: "/sysadmin/master-data/user-statuses",
  paramsProp: "userStatusId",
  newItemText: "Novo Status de Usuário"
};

export default { metadata, list, form, links };

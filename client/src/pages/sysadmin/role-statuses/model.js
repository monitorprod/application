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
    text: "Status de Funções do Usuário",
    href: "/sysadmin/master-data/role-statuses"
  }
];

export const metadata = {
  name: "role_statuses",
  listPath: "/sysadmin/master-data/role-statuses",
  formPath: "/sysadmin/master-data/role-statuses",
  paramsProp: "roleStatusId",
  newItemText: "Novo Status de Função do Usuário"
};

export default { metadata, list, form, links };

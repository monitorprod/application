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
    text: "Status de Ticket",
    href: "/sysadmin/master-data/ticket-statuses"
  }
];

export const metadata = {
  name: "ticket_statuses",
  listPath: "/sysadmin/master-data/ticket-statuses",
  formPath: "/sysadmin/master-data/ticket-statuses",
  paramsProp: "ticketStatusId",
  newItemText: "Novo Status do Ticket"
};

export default { metadata, list, form, links };

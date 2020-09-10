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
    text: "Status de Ordem de Produção",
    href: "/sysadmin/master-data/production-order-statuses"
  }
];

export const metadata = {
  name: "production_order_statuses",
  listPath: "/sysadmin/master-data/production-order-statuses",
  formPath: "/sysadmin/master-data/production-order-statuses",
  paramsProp: "productionOrderStatusId",
  newItemText: "Novo Status de Ordem de Produção"
};

export default { metadata, list, form, links };

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
    text: "Status de Produtos",
    href: "/sysadmin/master-data/product-statuses"
  }
];

export const metadata = {
  name: "product_statuses",
  listPath: "/sysadmin/master-data/product-statuses",
  formPath: "/sysadmin/master-data/product-statuses",
  paramsProp: "productStatusId",
  newItemText: "Novo Status de Produto"
};

export default { metadata, list, form, links };

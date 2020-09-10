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
    },
    {
      text: "Tipo Em Produção",
      identity: "isInProduction",
      type: "boolean"
    }
  ]
];

export const links = [
  {
    text: "Administração",
    href: "/administration"
  },
  {
    text: "Tipos de Ordem de Produção",
    href: "/administration/production-order-types"
  }
];

export const metadata = {
  name: "production_order_types",
  listPath: "/administration/production-order-types",
  formPath: "/administration/production-order-types",
  paramsProp: "productionOrderTypeId",
  newItemText: "Novo Tipo de Ordem de Produção"
};

export default { metadata, list, form, links };

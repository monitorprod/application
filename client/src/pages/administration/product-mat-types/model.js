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
    text: "Tipos de Produtos",
    href: "/administration/product-mat-types"
  }
];

export const metadata = {
  name: "product_mat_types",
  listPath: "/administration/product-mat-types",
  formPath: "/administration/product-mat-types",
  paramsProp: "productMatTypeId",
  newItemText: "Novo Tipo de Produto"
};

export default { metadata, list, form, links };

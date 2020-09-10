import { lodashGet } from "../../../utils";

export const list = [
  {
    text: "Cod Produto",
    identity: "identity",
    filter: {
      type: "string"
    }
  },
  {
    text: "Nome",
    identity: "name",
    filter: {
      type: "string"
    }
  },
  {
    text: "UM do Produto",
    identity: "measurement_unit.name",
    model: {
      service: "measurement_units",
      identity: "UM",
      query: {
        type: "quantity"
      }
    }
  },
  {
    text: "Cor",
    identity: "color",
    filter: {
      type: "string"
    }
  },
  {
    text: "Peso",
    identity: "weight",
    customContent: { dontFilter: true },
    customData: ({ data: product = {} }) =>
      `${product.weight || ""} ${
        product.weight ? lodashGet(product, "weight_measurement_unit.name") || "" : ""
      }`
  },
  {
    text: "Status",
    identity: "product_status.name",
    customContent: { dontFilterWhenChild: true },
    model: {
      service: "product_statuses",
      identity: "productStatusId"
    }
  }
];

export const form = [
  {
    text: "Foto",
    identity: "image",
    type: "image"
  },
  [
    {
      text: "Cod Produto",
      identity: "identity",
      max: 10,
      autoFocus: true,
      required: true,
      type: "string"
    },
    {
      text: "Status",
      identity: "productStatusId",
      required: true,
      model: "product_statuses",
      defaultValue: {
        config: "product.status.init"
      }
    }
  ],
  [
    {
      text: "Nome",
      identity: "name",
      required: true,
      type: "string"
    },
    {
      text: "Descrição",
      identity: "description",
      type: "string"
    },
    {
      text: "UM do Produto",
      identity: "UM",
      model: {
        service: "measurement_units",
        query: {
          type: "quantity"
        }
      }
    }
  ],
  [
    [
      {
        text: "Peso do Produto",
        identity: "weight",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "weightUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "mass"
          }
        },
        required: "weight",
        defaultValue: {
          config: "product.weight.um"
        }
      }
    ],
    {
      text: "Cor",
      identity: "color",
      type: "string"
    }
    // {
    //   text: "SetUp Produto (min)",
    //   identity: "setupMinutes",
    //   type: "integer"
    // }
  ],
  [
    {
      text: "Versão Válida",
      identity: "version",
      type: "string"
    },
    {
      text: "Desenho",
      identity: "design",
      type: "string"
    }
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/master-data"
  },
  {
    text: "Produtos",
    href: "/master-data/products"
  }
];

export const metadata = {
  name: "products",
  icon: "style",
  listPath: "/master-data/products",
  formPath: "/master-data/products",
  paramsProp: "productId",
  newItemText: "Novo Produto"
};

export default {
  metadata,
  list,
  form,
  links,
  options: {
    readPermissions: ["readMasterData"],
    writePermissions: ["writeMasterData"]
  },
  customContent: {
    customBreadCrumbsName: ({ data = {} }) =>
      `${data.identity ? `${data.identity} - ` : ""}${data.name}`
  },
  query: {
    $sort: { identity: 1 }
  }
};

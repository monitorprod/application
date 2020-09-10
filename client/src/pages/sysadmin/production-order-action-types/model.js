import React from "react";
import Color from "./Color";

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
  },
  {
    text: "Cor",
    identity: "color",
    model: {
      service: "colors",
      identity: "colorId"
    },
    customData: ({ ...props }) => <Color {...props} />
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
  ],
  [
    {
      text: "Cor",
      identity: "colorId",
      required: true,
      model: "colors"
    },
    {
      text: "Evento do Sistema",
      identity: "isSystemEvent",
      type: "boolean"
    }
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/sysadmin/master-data"
  },
  {
    text: "Tipos de Eventos de Ordem de Produção",
    href: "/sysadmin/master-data/production-order-action-types"
  }
];

export const metadata = {
  name: "production_order_action_types",
  listPath: "/sysadmin/master-data/production-order-action-types",
  formPath: "/sysadmin/master-data/production-order-action-types",
  paramsProp: "productionOrderActionTypeId",
  newItemText: "Novo Tipo de Evento de Ordem de Produção"
};

export default { metadata, list, form, links };

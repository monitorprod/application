import React from "react";
import { lodashGet } from "../../../utils";
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
    customData: ({ ...props }) => <Color {...props} />
  },
  {
    text: "Tipo de Evento",
    identity: "production_order_action_type.name",
    model: {
      service: "production_order_action_types",
      identity: "productionOrderActionTypeId"
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
  ],
  [
    {
      text: "Ícone",
      identity: "icon",
      type: "icon"
    },
    {
      text: "Tipo de Evento",
      identity: "productionOrderActionTypeId",
      model: {
        service: "production_order_action_types",
        query: { isSystemEvent: null }
      }
    }
  ]
];

export const links = [
  {
    text: "Administração",
    href: "/administration"
  },
  {
    text: "Eventos de Ordem de Produção",
    href: "/administration/production-order-event-types"
  }
];

export const metadata = {
  name: "production_order_event_types",
  listPath: "/administration/production-order-event-types",
  formPath: "/administration/production-order-event-types",
  paramsProp: "productionOrderEventTypeId",
  newItemText: "Novo Evento de Ordem de Produção"
};

export default {
  metadata,
  list,
  form,
  links,
  customContent: {
    dontEdit: ({ data }) => !lodashGet(data, "isSystemEvent"),
    dontDelete: ({ data }) => !lodashGet(data, "isSystemEvent")
  }
};

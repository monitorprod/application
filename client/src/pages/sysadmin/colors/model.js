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
    customData: ({ ...props }) => <Color {...props} />
  },
  {
    text: "Cod RGB",
    identity: "rgb",
    filter: {
      type: "string"
    }
  },
  {
    text: "Cod HSV",
    identity: "hsv",
    filter: {
      type: "string"
    }
  },
  {
    text: "Cod HEX",
    identity: "hex",
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
  ],
  [
    {
      text: "Cod RGB",
      identity: "rgb",
      type: "string"
    },
    {
      text: "Cod HSV",
      identity: "hsv",
      type: "string"
    },
    {
      text: "Cod HEX",
      identity: "hex",
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
    text: "Cores",
    href: "/sysadmin/master-data/colors"
  }
];

export const metadata = {
  name: "colors",
  listPath: "/sysadmin/master-data/colors",
  formPath: "/sysadmin/master-data/colors",
  paramsProp: "colorId",
  newItemText: "Novo Cor"
};

export default {
  metadata,
  list,
  form,
  links,
  query: {
    $sort: { name: 1 }
  }
};

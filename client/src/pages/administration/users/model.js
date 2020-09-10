import React from "react";
import moment from "moment";
import { lodashGet, lodashMap } from "../../../utils";
import SendEmailAction from "./SendEmailAction";
import SendReportAction from "./SendReportAction";
import RoleHelp from "./RoleHelp";

export const list = [
  {
    text: "Nome",
    identity: "name",
    filter: {
      type: "string"
    }
  },
  {
    text: "Email",
    identity: "email",
    filter: {
      type: "string"
    }
  },
  {
    text: "Perfis",
    identity: "roles",
    customContent: { dontFilter: true },
    customData: ({ data = {} }) => lodashMap(data.roles, r => r.name).join(", ")
  },
  {
    text: "Status",
    identity: "user_status.name",
    model: {
      service: "user_statuses",
      identity: "userStatusId"
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
      text: "Status",
      identity: "userStatusId",
      required: true,
      model: "user_statuses",
      defaultValue: {
        config: "user.status.init"
      }
    },
    {
      text: "Data Inclusão",
      identity: "creationDate",
      readOnly: true,
      show: {
        ifThis: "id"
      },
      type: "string",
      defaultValue: {
        customValue: async ({ data = {}, field, handleChange }) => {
          const date = moment(lodashGet(data, "createdAt")).format(
            "DD/MM/YYYY HH:mm"
          );
          handleChange({
            target: { name: field.identity, value: date }
          });
        }
      }
    }
  ],
  [
    {
      text: "Email",
      identity: "email",
      required: true,
      type: "email",
      customData: ({ ...props }) => <SendEmailAction {...props} />
    }
  ],
  [
    {
      text: "Fone",
      identity: "phone",
      type: "string"
    }
  ],
  [
    {
      text: "Enviar Relatório de Produção Diario",
      identity: "sendDailyReport",
      type: "boolean",
      customData: ({ ...props }) => (
        <SendReportAction type="sendDailyReport" {...props} />
      )
    }
  ],
  [
    {
      text: "Enviar Relatório de Produção Semanal",
      identity: "sendWeeklyReport",
      type: "boolean",
      customData: ({ ...props }) => (
        <SendReportAction type="sendWeeklyReport" {...props} />
      )
    }
  ],
  [
    {
      text: "Perfil Usuario",
      identity: "roles",
      model: {
        service: "roles",
        query: {
          name: { $nin: ["sysadmin"] }
        }
      },
      type: "checklist",
      handleValidate: ({ data = {} }) => {
        const value = lodashGet(data, "target.value");
        if (!value || !value.length) {
          return "Selecione pelo menos 1 perfil";
        }
        return true;
      },
      customContent: {
        customOptionContent: ({ ...props }) => <RoleHelp {...props} />
      }
    },
    {
      identity: "roles:delete",
      show: false,
      type: "checklist"
    }
  ]
];

export const links = [
  { text: "Administração", href: "/administration" },
  {
    text: "Usuários",
    href: "/administration/users"
  }
];

export const metadata = {
  name: "users",
  listPath: "/administration/users",
  formPath: "/administration/users",
  paramsProp: "userId",
  newItemText: "Novo Usuário"
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

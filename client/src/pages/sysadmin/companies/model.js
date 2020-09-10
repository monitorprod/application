import React from "react";
import { isValid as isCNPJValid } from "@fnando/cnpj";
import { Grid } from "@material-ui/core";
import { Link, lodashGet, lodashToLower, lodashForEach } from "../../../utils";
import { Button } from "../../../components";
import SendEmailAction from "./SendEmailAction";

const isValid = value => {
  const CEPRegExp = new RegExp(/^\d{5}-?\d{3}$/);
  return CEPRegExp.test(value);
};

export const list = [
  {
    text: "Nome Fantasia",
    identity: "fantasyName",
    filter: {
      type: "string"
    }
  },
  {
    text: "Identificação Fiscal",
    identity: "taxId",
    filter: {
      type: "string"
    }
  },
  {
    text: "Nivel",
    identity: "level",
    filter: {
      type: "string"
    }
  },
  {
    text: "Admin Sis",
    identity: "adminContact",
    filter: {
      type: "string"
    }
  },
  {
    text: "Email Admin Sis",
    identity: "adminEmail",
    filter: {
      type: "string"
    }
  },
  {
    text: "Status",
    identity: "company_status.name",
    model: {
      service: "company_statuses",
      identity: "companyStatusId"
    }
  }
];

export const form = [
  [
    {
      text: "UUID",
      identity: "uuid",
      variants: "display fullWidth",
      readOnly: true,
      show: {
        ifThis: "id"
      },
      type: "string"
    }
  ],
  [
    {
      text: "Nome Fantasia",
      identity: "fantasyName",
      autoFocus: true,
      required: true,
      type: "string",
      handleChange: ({ data = {}, handleChange }) => {
        const value = lodashGet(data, "target.value");
        if (value) {
          handleChange({
            target: {
              name: "loginName",
              value: lodashToLower(value).replace(/\s/g, "")
            }
          });
        }
      }
    },
    {
      text: "Identificação Fiscal",
      identity: "taxId",
      required: true,
      type: "string",
      handleValidate: ({ data = {} }) => {
        const value = lodashGet(data, "target.value");
        if (!isCNPJValid(value)) {
          return "CNPJ não é válido";
        }
        return true;
      }
    },
    {
      text: "Status",
      identity: "companyStatusId",
      required: true,
      model: "company_statuses",
      defaultValue: {
        config: "company.status.init"
      }
    },
    {
      text: "Nivel",
      identity: "level",
      required: true,
      enum: ["N1", "N6"],
      defaultValue: "N1"
    },
    {
      text: "Login da Empresa",
      identity: "loginName",
      type: "string"
    }
  ],
  [
    [
      {
        text: "Limite de Usuários",
        identity: "usersLimit",
        required: true,
        defaultValue: 50,
        type: "integer"
      },
      {
        text: "Usuários",
        identity: "usersNumber",
        readOnly: true,
        show: {
          ifThis: "id"
        },
        type: "integer",
        defaultValue: {
          customValue: async ({ data = {}, field, client, handleChange }) => {
            const { data: list } = await client.service("users").find({
              query: {
                companyId: data.id
              }
            });
            handleChange({
              target: { name: field.identity, value: list.length }
            });
          }
        }
      }
    ],
    [
      {
        text: "Limite de Máquinas",
        identity: "machinesLimit",
        required: true,
        defaultValue: 50,
        type: "integer"
      },
      {
        text: "Máquinas",
        identity: "machinesNumber",
        readOnly: true,
        show: {
          ifThis: "id"
        },
        type: "integer",
        defaultValue: {
          customValue: async ({ data = {}, field, client, handleChange }) => {
            const { data: list } = await client.service("machines").find({
              query: {
                companyId: data.id
              }
            });
            handleChange({
              target: { name: field.identity, value: list.length }
            });
          }
        }
      }
    ]
  ],
  [
    [
      {
        text: "Razão Social",
        identity: "companyName",
        required: true,
        type: "string"
      },
      {
        text: "Insc. Estadual",
        identity: "stateRegistration",
        type: "string"
      },
      {
        text: "Insc. Municipal",
        identity: "municipalRegistration",
        type: "string"
      }
    ]
  ],
  [
    {
      text: "Contato Admin Sist",
      identity: "adminContact",
      required: true,
      type: "string"
    },
    {
      text: "Email Admin Sist",
      identity: "adminEmail",
      required: true,
      type: "email",
      customData: ({ ...props }) => <SendEmailAction {...props} />
    }
  ],
  [
    {
      text: "Contato Comercial",
      identity: "technicalContact",
      required: true,
      type: "string"
    },
    {
      text: "Email Comercial",
      identity: "technicalEmail",
      required: true,
      type: "email"
    }
  ],
  [
    {
      text: "Endereço",
      identity: "address",
      type: "string"
    },
    {
      text: "Número",
      identity: "addressNumber",
      type: "string"
    },
    {
      text: "Bairro",
      identity: "neighborhood",
      type: "string"
    }
  ],
  [
    {
      text: "Estado",
      identity: "state",
      type: "string",
      enum: [
        "AC",
        "AL",
        "AM",
        "AP",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MG",
        "MS",
        "MT",
        "PA",
        "PB",
        "PE",
        "PI",
        "PR",
        "RJ",
        "RN",
        "RO",
        "RR",
        "RS",
        "SC",
        "SE",
        "SP",
        "TO"
      ]
    },
    {
      text: "Cidade",
      identity: "city",
      type: "string"
    },
    {
      text: "CEP",
      identity: "cep",
      required: true,
      type: "string",
      handleValidate: ({ data = {} }) => {
        const value = lodashGet(data, "target.value");
        if (!isValid(value)) {
          return "CEP não é válido";
        }
        return true;
      },
      async handleChange({ data = {}, handleChange }) {
        let value = lodashGet(data, "target.value");
        if (isValid(value)) {
          let response = await fetch(`https://viacep.com.br/ws/${value}/json`);
          response = await response.json();
          lodashForEach(
            [
              {
                key: "address",
                value: "logradouro"
              },
              {
                key: "neighborhood",
                value: "bairro"
              },
              {
                key: "state",
                value: "uf"
              },
              {
                key: "city",
                value: "localidade"
              }
            ],
            ({ key, value }) => {
              handleChange({
                target: {
                  name: key,
                  value: `${response[value]}`
                }
              });
            }
          );
        }
      }
    }
  ],
  [
    {
      text: "Fone",
      identity: "phone",
      required: true,
      type: "string"
    },
    {
      text: "Fone 2",
      identity: "phone2",
      type: "string"
    }
  ]
];

export const links = [
  {
    text: "Clientes",
    href: "/sysadmin/companies"
  }
];

export const metadata = {
  name: "companies",
  listPath: "/sysadmin/companies",
  formPath: "/sysadmin/companies",
  paramsProp: "companyId",
  newItemText: "Novo Cliente"
};

export default {
  metadata,
  list,
  form,
  links,
  customContent: {
    customBreadCrumbsName: ({ data = {} }) => data.fantasyName,
    customTreeName: ({ data = {} }) => data.fantasyName
  },
  customActions: ({ isList, isForm, data: company }) => (
    <React.Fragment>
      {isList && (
        <Button
          text="Visualizar Histórico"
          icon="view_day"
          type="icon"
          component={Link}
          to={`/sysadmin/companies/${company.id}/production-history`}
        />
      )}
      {isForm && company.id && (
        <Grid item>
          <Button
            text="Visualizar Histórico"
            icon="view_day"
            component={Link}
            to={`/sysadmin/companies/${company.id}/production-history`}
          />
        </Grid>
      )}
    </React.Fragment>
  ),
  query: {
    $sort: { fantasyName: 1 }
  }
};

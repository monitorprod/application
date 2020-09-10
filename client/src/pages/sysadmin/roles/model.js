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
    text: "Status",
    identity: "role_status.name",
    model: {
      service: "role_statuses",
      identity: "roleStatusId"
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
      text: "Status",
      identity: "roleStatusId",
      required: true,
      model: "role_statuses",
      defaultValue: {
        config: "role.status.init"
      }
    }
  ],
  [
    {
      text: "Criar/Modificar Cadastros",
      identity: "writeMasterData",
      type: "boolean"
    }
  ],
  [
    {
      text: "Visualizar Cadastros",
      identity: "readMasterData",
      type: "boolean"
    }
  ],
  [
    {
      text: "Acesso a Dados Administração",
      identity: "crudAdminData",
      type: "boolean"
    }
  ],
  [
    {
      text: "Cadastro Usuario/Perfil",
      identity: "crudUserData",
      type: "boolean"
    }
  ],
  [
    {
      text: "Criar Ordens Produção",
      identity: "writeActiveProductionOrders",
      type: "boolean"
    }
  ],
  [
    {
      text: "Criar Ordens Não Produção",
      identity: "writeScheduledStopProductionOrders",
      type: "boolean"
    }
  ],
  [
    {
      text: "Liberar Ordens (sequenciaador)",
      identity: "openProductionOrders",
      type: "boolean"
    }
  ],
  [
    {
      text: "Apontar Eventos Ordem",
      identity: "writeProductionOrderEvents",
      type: "boolean"
    }
  ],
  [
    {
      text: "Modificar Eventos Ordem",
      identity: "editProductionOrderEvents",
      type: "boolean"
    }
  ],
  [
    {
      text: "Visualizar Ordens",
      identity: "readProductionOrders",
      type: "boolean"
    }
  ],
  [
    {
      text: "Visualizar Relatorios",
      identity: "readProductionOrderReports",
      type: "boolean"
    }
  ],
  [
    {
      text: "Visualizar Refugo",
      identity: "readPendingWaste",
      type: "boolean"
    }
  ],
  [
    {
      text: "Apontar Refugo",
      identity: "writePendingWaste",
      type: "boolean"
    }
  ],
  [
    {
      text: "Modificar Refugo",
      identity: "editPendingWaste",
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
    text: "Perfis",
    href: "/sysadmin/master-data/roles"
  }
];

export const metadata = {
  name: "roles",
  listPath: "/sysadmin/master-data/roles",
  formPath: "/sysadmin/master-data/roles",
  paramsProp: "roleId",
  newItemText: "Novo Perfil"
};

export default {
  metadata,
  list,
  form,
  links,
  query: {
    name: { $nin: ["sysadmin"] },
    $sort: { name: 1 }
  }
};

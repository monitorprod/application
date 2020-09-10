import { withAdministrationPage } from "../../components";

const actions = [
  {
    name: "Domínios do Sistema",
    icon: "domain",
    actions: [
      {
        name: "Cores",
        href: "/sysadmin/master-data/colors"
      },
      {
        name: "Unidades de Medida",
        href: "/sysadmin/master-data/measurement-units"
      },
      {
        name: "Perfis",
        href: "/sysadmin/master-data/roles"
      },
      {
        name: "Status de Clientes",
        href: "/sysadmin/master-data/company-statuses"
      },
      {
        name: "Status de Funções do Usuário",
        href: "/sysadmin/master-data/role-statuses"
      },
      {
        name: "Status de Usuários",
        href: "/sysadmin/master-data/user-statuses"
      }
    ]
  },
  {
    name: "Domínios de OP",
    icon: "assessment",
    actions: [
      {
        name: "Status de Locais",
        href: "/sysadmin/master-data/plant-statuses"
      },
      {
        name: "Status de Ordem de Produção",
        href: "/sysadmin/master-data/production-order-statuses"
      },
      {
        name: "Tipos de Eventos de Ordem de Produção",
        href: "/sysadmin/master-data/production-order-action-types"
      }
    ]
  },
  {
    name: "Domínios de Máquinas",
    icon: "build",
    actions: [
      {
        name: "Status de Máquinas",
        href: "/sysadmin/master-data/machine-statuses"
      }
    ]
  },
  {
    name: "Domínios de Moldes",
    icon: "broken_image",
    actions: [
      {
        name: "Status de Moldes",
        href: "/sysadmin/master-data/mold-statuses"
      }
    ]
  },
  {
    name: "Domínios de Produtos",
    icon: "style",
    actions: [
      {
        name: "Status de Produtos",
        href: "/sysadmin/master-data/product-statuses"
      }
    ]
  },
  {
    name: "Domínios de Sensores",
    icon: "memory",
    actions: [
      {
        name: "Status de Sensores",
        href: "/sysadmin/master-data/sensor-statuses"
      }
    ]
  },
  {
    name: "Domínios de Tickets",
    icon: "memory",
    actions: [
      {
        name: "Status de Ticket",
        href: "/sysadmin/master-data/ticket-statuses"
      }
    ]
  }
];

const SysAdminPage = () => withAdministrationPage({ actions });

export default SysAdminPage;

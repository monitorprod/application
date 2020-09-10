import React from "react";
import { withAdministrationPage } from "../../components";
import { MachineIcon } from "../../utils/svgIcons";
import { useAuth, lodashGet } from "../../utils";

const actions = ({ level }) => [
  {
    name: "Sistema",
    icon: "domain",
    actions: [
      {
        name: "Grupos de Atributos",
        href: "/administration/attributes",
        permissions: ["crudAdminData"]
      },
      {
        name: "Tipos de Ordem de Produção",
        href: "/administration/production-order-types",
        permissions: ["crudAdminData"],
        disabled: level !== "N1"
      },
      {
        name: "Eventos de Ordem de Produção",
        href: "/administration/production-order-event-types",
        permissions: ["crudAdminData"]
      },
      {
        name: "Motivos de Refugo",
        href: "/administration/waste-justifications",
        permissions: ["crudAdminData"],
        disabled: level !== "N1"
      },
      {
        name: "Locais",
        href: "/administration/plants",
        permissions: ["crudAdminData"]
      },
      {
        name: "Usuários",
        href: "/administration/users",
        permissions: ["crudUserData"]
      }
    ],
    permissions: ["crudAdminData", "crudUserData"]
  },
  {
    name: "Máquinas",
    svgIcon: (
      <MachineIcon
        style={{ fontSize: 24, color: "white", marginRight: "8px" }}
      />
    ),
    actions: [
      {
        name: "Tipos de Máquinas",
        href: "/administration/machine-types",
        permissions: ["crudAdminData"]
      },
      {
        name: "Tipos de Bico",
        href: "/administration/nozzle-types",
        permissions: ["crudAdminData"]
      }
    ],
    permissions: ["crudAdminData"]
  },
  // {
  //   name: "Domínios de Moldes",
  //   icon: "broken_image",
  //   actions: []
  // },
  {
    name: "Produtos",
    icon: "style",
    actions: [
      {
        name: "Tipos de Produtos",
        href: "/administration/product-mat-types",
        permissions: ["crudAdminData"]
      }
    ],
    permissions: ["crudAdminData"],
    disabled: level !== "N1"
  }
  // {
  //   name: "Domínios de Sensores",
  //   icon: "memory",
  //   actions: []
  // }
];

const AdministrationPage = () => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  return withAdministrationPage({ actions: actions({ level }) });
};

export default AdministrationPage;

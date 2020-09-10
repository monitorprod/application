import { useContext } from "react";
import ApiContext from "../../../api";
import { lodashGet, lodashMap, useGetService } from "../../../utils";

const customName = ({ data = {} }) =>
  `${data.identity ? `${data.identity} - ` : ""}${data.name || ""}`;

const customData = ({ identity }) => ({ data = {} }) =>
  `${
    lodashGet(data, `${identity}.identity`) ? `${lodashGet(data, `${identity}.identity`)} - ` : ""
  }${lodashGet(data, `${identity}.name`) || ""}`;

export const list = [
  {
    text: "Máquina",
    hasIdentity: true,
    identity: "machine",
    customData: customData({ identity: "machine" }),
    model: {
      service: "machines",
      identity: "machineId",
      customName
    }
  },
  {
    text: "Molde",
    hasIdentity: true,
    identity: "mold",
    customData: customData({ identity: "mold" }),
    model: {
      service: "molds",
      identity: "moldId",
      customName
    }
  },
  {
    text: "Produto",
    hasIdentity: true,
    identity: "product",
    customData: customData({ identity: "product" }),
    model: {
      service: "products",
      identity: "productId",
      customName
    }
  },
  {
    text: "Ciclo Ideal",
    identity: "idealCycle",
    customContent: { dontFilter: true },
    customData: ({ data: mold = {} }) =>
      `${mold.idealCycle || ""} ${
        mold.idealCycle ? lodashGet(mold, "ideal_cycle_measurement_unit.name") || "" : ""
      }`
  }
];

export const form = [
  [
    {
      text: "Máquina",
      identity: "machineId",
      variants: "fullWidth",
      required: true,
      model: {
        service: "machines",
        hasIdentity: true,
        useCustomQuery: () => {
          const client = useContext(ApiContext);
          return {
            machineStatusId: lodashGet(client.get("config.machine.status.active"), "value")
          };
        }
      }
    }
  ],
  [
    {
      text: "Molde",
      identity: "moldId",
      variants: "fullWidth",
      required: true,
      model: {
        service: "molds",
        hasIdentity: true,
        useCustomQuery: () => {
          const client = useContext(ApiContext);
          return {
            moldStatusId: lodashGet(client.get("config.mold.status.active"), "value")
          };
        }
      },
      handleChange: ({ data = {}, handleChange, item: productionOrder = {} }) => {
        const moldId = lodashGet(data, "target.value");
        if (!moldId) {
          handleChange({
            target: {
              name: "productId",
              value: null
            }
          });
        }
      }
    }
  ],
  [
    {
      text: "Produto",
      identity: "productId",
      variants: "fullWidth",
      readOnly: {
        until: "moldId"
      },
      required: true,
      model: {
        service: "products",
        hasIdentity: true,
        // TODO same implementation for PRODUCTION ORDER fields
        useCustomQuery: ({ data = {} }) => {
          const client = useContext(ApiContext);
          const query = {
            productStatusId: lodashGet(client.get("config.product.status.active"), "value")
          };
          const { item: mold } = useGetService({
            model: "molds",
            id: data.moldId
          });
          if (lodashGet(mold, "id")) {
            return {
              ...query,
              id: {
                $in: lodashMap(mold.products, product => product.id)
              }
            };
          }
          return query;
        }
      }
    }
  ],
  [
    {
      text: "Ciclo Ideal",
      identity: "idealCycle",
      required: true,
      // TODO add MIN MAX values
      type: "decimal",
      handleChange: ({ data = {}, handleChange }) => {
        const calculateCycle = ({ value, factor }) =>
          Math.round(parseFloat(value, "10") * factor * 100) / 100;
        const value = lodashGet(data, "target.value");
        if (value) {
          handleChange({
            target: {
              name: "minCycle",
              value: calculateCycle({ value, factor: 0.9 })
            }
          });
          handleChange({
            target: {
              name: "maxCycle",
              value: calculateCycle({ value, factor: 1.1 })
            }
          });
        }
      }
    },
    {
      text: "Ciclo Min",
      identity: "minCycle",
      type: "decimal"
    },
    [
      {
        text: "Ciclo Max",
        identity: "maxCycle",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "UM",
        variants: "short",
        required: [["idealCycle", "minCycle", "maxCycle"]],
        populate: ["idealCycleUM", "minCycleUM", "maxCycleUM"],
        model: {
          service: "measurement_units",
          query: {
            type: "time"
          }
        }
      }
    ]
  ],
  [
    {
      text: "Ciclo de Alerta",
      identity: "warningCycle",
      type: "decimal"
    },
    {
      text: "Montagem (min)",
      identity: "setupInMinutes",
      required: true,
      type: "integer"
    },
    {
      text: "SetUp Injeção (min)",
      identity: "setupInjectionMinutes",
      type: "integer"
    },
    {
      text: "SetUp Automação (min)",
      identity: "setupAutoMinutes",
      type: "integer"
    },
    {
      text: "Desmontagem (min)",
      identity: "setupOutMinutes",
      required: true,
      type: "integer"
    }
  ],
  [
    {
      text: "UM",
      identity: "idealCycleUM",
      variants: "short",
      show: { useCustomIf: () => false },
      model: {
        service: "measurement_units",
        query: {
          type: "time"
        }
      }
    },
    {
      text: "UM",
      identity: "minCycleUM",
      variants: "short",
      show: { useCustomIf: () => false },
      model: {
        service: "measurement_units",
        query: {
          type: "time"
        }
      }
    },
    {
      text: "UM",
      identity: "maxCycleUM",
      variants: "short",
      show: { useCustomIf: () => false },
      model: {
        service: "measurement_units",
        query: {
          type: "time"
        }
      }
    }
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/master-data"
  },
  {
    text: "Tempos de Configuração",
    href: "/master-data/setups"
  }
];

export const metadata = {
  name: "machine_mold_products",
  listPath: "/master-data/setups",
  formPath: "/master-data/setups",
  paramsProp: "setupId",
  newItemText: "Novo Tempo de Configuração"
};

const customSetupName = ({ data = {} }) =>
  `${customName({ data: data.machine })} / ${customName({
    data: data.mold
  })} / ${customName({ data: data.product })}`;

export default {
  metadata,
  list,
  form,
  links,
  query: {
    $populateAll: true,
    $sort: { machineId: 1 }
  },
  options: {
    readPermissions: ["readMasterData"],
    writePermissions: ["writeMasterData"]
  },
  customContent: {
    customBreadCrumbsName: ({ data = {} }) => `Setup ${data.id}`,
    customTreeName: customSetupName,
    customError: ({ errors = {} }) => {
      if (errors.message === "Validation error") {
        return "Uma configuração de tempos com esta máquina / molde / produto já existe.";
      }
      return errors;
    }
  }
};

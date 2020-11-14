import { useContext } from "react";
import machinesIcon from "../../../../icons/injector.svg";
import moldsIcon from "../../../../icons/mold.svg";
import ApiContext from "../../../../api";
import {
  lodashGet,
  lodashMap,
  lodashForEach,
  useGetService
} from "../../../../utils";
import useAuth from "../../../../utils/useAuth";

export const form = [
  {
    text: "Tipo de Ordem",
    identity: "productionOrderTypeId",
    required: true,
    readOnly: {
      ifThis: "uuid"
    },
    model: "production_order_types"
  },
  [
    {
      text: "Status de Ordem",
      identity: "productionOrderStatusId",
      readOnly: true,
      model: "production_order_statuses",
      defaultValue: {
        config: "productionOrder.status.init"
      }
    },
    {
      text: "Local",
      identity: "plantId",
      readOnly: true,
      model: "plants"
    },
    {
      text: "Quantidade Confirmada",
      identity: "confirmedProduction",
      type: "integer",
      readOnly: {
        customIf: ({ data: productionOrder = {} }) =>
          lodashGet(productionOrder, "plant.qualityTrackFrequency") !==
            "Encerramento" ||
          lodashGet(productionOrder, "plant.qualityTrackType") !==
            "Q Confirmada"
      },
      show: {
        // TODO add semantics to ALL data params
        useCustomIf: ({ data: productionOrder = {} }) => {
          return (
            !!lodashGet(productionOrder, "isClosed") &&
            !!lodashGet(productionOrder, "production_order_type.isInProduction")
          );
        }
      },
      // handleValidate: ({ data = {}, item: productionOrder = {} }) => {
      //   const value = parseInt(lodashGet(data, "target.value"), "10");
      //   if (
      //     value > parseInt(lodashGet(productionOrder, "totalProduction"), "10")
      //   ) {
      //     return "Q Confirmada não pode exceder a quantidade produzida";
      //   }
      //   if (value < 0) {
      //     return "Q Confirmada não pode ser negativo";
      //   }
      //   return true;
      // },
      // handleChange: ({
      //   data = {},
      //   item: productionOrder = {},
      //   handleChange
      // }) => {
      //   const value = parseInt(lodashGet(data, "target.value"), "10");
      //   if (
      //     value &&
      //     lodashGet(productionOrder, "plant.qualityTrackType") ===
      //       "Q Confirmada"
      //   ) {
      //     handleChange({
      //       target: {
      //         name: "wastedProduction",
      //         value:
      //           (parseInt(
      //             lodashGet(productionOrder, "totalProduction"),
      //             "10"
      //           ) || 0) - value
      //       }
      //     });
      //   }
      // }
    },
    {
      text: "Quantidade Refugo",
      identity: "wastedProduction",
      type: "integer",
      readOnly: {
        customIf: ({ data: productionOrder = {} }) =>
          lodashGet(productionOrder, "plant.qualityTrackFrequency") !==
            "Encerramento" ||
          lodashGet(productionOrder, "plant.qualityTrackType") !== "Q Refugo"
      },
      show: {
        useCustomIf: ({ data: productionOrder = {} }) => {
          return (
            !!lodashGet(productionOrder, "isClosed") &&
            !!lodashGet(productionOrder, "production_order_type.isInProduction")
          );
        }
      },
      // handleValidate: ({ data = {}, item: productionOrder = {} }) => {
      //   const value = parseInt(lodashGet(data, "target.value"), "10");
      //   if (
      //     value > parseInt(lodashGet(productionOrder, "totalProduction"), "10")
      //   ) {
      //     return "Q Refugo não pode exceder a quantidade produzida";
      //   }
      //   if (value < 0) {
      //     return "Q Refugo não pode ser negativo";
      //   }
      //   return true;
      // },
      // handleChange: ({
      //   data = {},
      //   item: productionOrder = {},
      //   handleChange
      // }) => {
      //   // TODO create a util parseInt to include radix auto, maybe a lodashGetInt?
      //   const value = parseInt(lodashGet(data, "target.value"), "10");
      //   if (
      //     value &&
      //     lodashGet(productionOrder, "plant.qualityTrackType") === "Q Refugo"
      //   ) {
      //     handleChange({
      //       target: {
      //         name: "confirmedProduction",
      //         value:
      //           (parseInt(
      //             lodashGet(productionOrder, "totalProduction"),
      //             "10"
      //           ) || 0) - value
      //       }
      //     });
      //   }
      // }
    }
  ],
  {
    text: "Máquina",
    identity: "machineId",
    icon: { type: "svg", src: machinesIcon },
    required: true,
    readOnly: {
      ifThis: "uuid"
    },
    model: {
      service: "machines",
      hasIdentity: true,
      useCustomQuery: () => {
        const client = useContext(ApiContext);
        return {
          machineStatusId: lodashGet(
            client.get("config.machine.status.active"),
            "value"
          )
        };
      }
    }
  },
  [
    {
      text: "Molde",
      identity: "moldId",
      icon: { type: "svg", src: moldsIcon },
      variants: "fullWidth",
      readOnly: {
        ifThis: "uuid"
      },
      model: {
        service: "molds",
        hasIdentity: true,
        useCustomQuery: () => {
          const client = useContext(ApiContext);
          return {
            moldStatusId: lodashGet(
              client.get("config.mold.status.active"),
              "value"
            )
          };
        }
      },
      // TODO all handleChange async? or no need?
      handleChange: ({
        data = {},
        handleChange,
        item: productionOrder = {}
      }) => {
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
      icon: "style",
      variants: "fullWidth",
      show: {
        useCustomIf: ({ data: productionOrder = {} }) => {
          const { item: productionOrderType } = useGetService({
            model: "production_order_types",
            id: productionOrder.productionOrderTypeId
          });
          return !!lodashGet(productionOrderType, "isInProduction");
        }
      },
      readOnly: {
        customIf: ({ data: productionOrder = {} }) =>
          !lodashGet(productionOrder, "moldId") ||
          lodashGet(productionOrder, "uuid")
      },
      model: {
        service: "products",
        hasIdentity: true,
        // TODO instead of a hook, just send client as params and leave it as async?
        useCustomQuery: ({ data = {} }) => {
          const client = useContext(ApiContext);
          const query = {
            productStatusId: lodashGet(
              client.get("config.product.status.active"),
              "value"
            )
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
      },
      handleChange: async ({
        client,
        data = {},
        handleChange,
        item: productionOrder = {},
        field = {}
      }) => {
        const productId = lodashGet(data, "target.value");
        if (productId) {
          field.loading = true;
          try {
            const { data: moldProducts } = await client
              .service("mold_products")
              .find({
                query: {
                  moldId: productionOrder.moldId,
                  productId
                }
              });
            const product = await client.service("products").get(productId);
            // TODO always use lodashGET for objets, even if is declared?
            const mold = await client
              .service("molds")
              .get(lodashGet(productionOrder, "moldId"));
            handleChange({
              target: {
                name: "openCavities",
                value:
                  // TODO review backend populates, remove not used ones anymore
                  lodashGet(productionOrder, "openCavities") ||
                  lodashGet(moldProducts, "0.cavities")
              }
            });
            handleChange({
              target: {
                name: "expectedProductionUM",
                value: product.UM
              }
            });
            handleChange({
              target: {
                name: "color",
                value: product.color
              }
            });
            // TODO verify all ({} = {})
            const setProductionOrderCycles = ({ cyclesData }) => {
              handleChange({
                target: {
                  name: "idealCycle",
                  value:
                    lodashGet(productionOrder, "idealCycle") ||
                    lodashGet(cyclesData, "0.idealCycle") ||
                    lodashGet(mold, "idealCycle")
                }
              });
              handleChange({
                target: {
                  name: "idealCycleUM",
                  value:
                    lodashGet(productionOrder, "idealCycleUM") ||
                    lodashGet(cyclesData, "0.idealCycleUM") ||
                    lodashGet(mold, "idealCycleUM")
                }
              });
            };
            const { data: machineMoldProductCycles } = await client
              .service("machine_mold_products")
              .find({
                query: {
                  machineId: productionOrder.machineId,
                  moldId: productionOrder.moldId,
                  productId
                }
              });
            if (machineMoldProductCycles.length) {
              setProductionOrderCycles({
                cyclesData: machineMoldProductCycles
              });
            } else {
              const { data: machineProductCycles } = await client
                .service("machine_mold_products")
                .find({
                  query: {
                    machineId: productionOrder.machineId,
                    moldId: null,
                    productId
                  }
                });
              if (machineProductCycles.length) {
                setProductionOrderCycles({ cyclesData: machineProductCycles });
              } else {
                // TODO verify all functions calling ({})
                setProductionOrderCycles({});
              }
            }
          } catch (error) {
          } finally {
            field.loading = false;
          }
        } else {
          lodashForEach(
            [
              "openCavities",
              "expectedProductionUM",
              "color",
              "idealCycle",
              "minCycle",
              "maxCycle",
              "idealCycleUM"
            ],
            key => {
              handleChange({
                target: {
                  name: key,
                  value: null
                }
              });
            }
          );
        }
      }
    }
  ],
  [
    // TODO remove this objet under single FORM
    // {
    //   text: "Montagem (min)",
    //   identity: "setupInMinutes",
    //   variants: "setup",
    //   type: "integer"
    // },
    // {
    //   text: "Desmontagem (min)",
    //   identity: "setupOutMinutes",
    //   variants: "setup",
    //   type: "integer"
    // },
    // {
    //   text: "SetUp Injeção (min)",
    //   identity: "setupInjectionMinutes",
    //   variants: "setup",
    //   type: "integer"
    // },
    // {
    //   text: "SetUp Automação (min)",
    //   identity: "setupAutoMinutes",
    //   variants: "setup",
    //   type: "integer"
    // },
    // {
    //   text: "SetUp Produto (min)",
    //   identity: "setupProductMinutes",
    //   variants: "setup",
    //   type: "integer"
    // }
  ],
  [
    {
      text: "Cavidades Abertas",
      identity: "openCavities",
      type: "integer",
      readOnly: {
        useCustomIf: ({ data: productionOrder = {} }) => {
          const { session } = useAuth();
          const level = lodashGet(session, "company.level");
          return level === "N6";
        }
      },
      show: {
        useCustomIf: ({ data: productionOrder = {} }) => {
          const { session } = useAuth();
          const level = lodashGet(session, "company.level");
          return (
            level === "N6" ||
            (!!lodashGet(productionOrder, "moldId") &&
              !!lodashGet(productionOrder, "productId"))
          );
        }
      }
    },
    [
      {
        text: "Quantidade Prevista",
        identity: "expectedProduction",
        type: "integer",
        required: {
          useCustomIf: ({ data }) => {
            if (data.isInProduction === 0) {
              return false;
            }
            return true
          }
        },
        readOnly: {
          useCustomIf: ({ data: productionOrder = {} }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level === "N6";
          }
        },
        show: {
          useCustomIf: ({ data: productionOrder = {} }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return (
              level === "N6" ||
              (!!lodashGet(productionOrder, "moldId") &&
                !!lodashGet(productionOrder, "productId"))
            );
          }
        }
      },
      {
        text: "UM",
        identity: "expectedProductionUM",
        variants: "short",
        required: {
          useCustomIf: ({ data }) => {
            if (data.isInProduction === 0) {
              return false;
            }
            return true
          }
        },
        readOnly: {
          useCustomIf: ({ data: productionOrder = {} }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level === "N6";
          }
        },
        show: {
          useCustomIf: ({ data: productionOrder = {} }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return (
              level === "N6" ||
              (!!lodashGet(productionOrder, "moldId") &&
                !!lodashGet(productionOrder, "productId"))
            );
          }
        },
        model: {
          service: "measurement_units",
          query: {
            type: "quantity"
          }
        }
      }
    ]
  ],
  [
    {
      text: "Ciclo Ideal",
      identity: "idealCycle",
      type: "decimal",
      required: {
        useCustomIf: ({ data }) => {
          if (data.isInProduction === 0) {
            return false;
          }
          return true
        }
      },
      show: {
        useCustomIf: ({ data: productionOrder = {} }) => {
          const { session } = useAuth();
          const level = lodashGet(session, "company.level");
          return (
            level === "N6" ||
            (!!lodashGet(productionOrder, "moldId") &&
              !!lodashGet(productionOrder, "productId"))
          );
        }
      },
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
      type: "decimal",
      show: {
        useCustomIf: ({ data: productionOrder = {} }) => {
          const { session } = useAuth();
          const level = lodashGet(session, "company.level");
          return (
            level === "N6" ||
            (!!lodashGet(productionOrder, "moldId") &&
              !!lodashGet(productionOrder, "productId"))
          );
        }
      }
    },
    [
      {
        text: "Ciclo Max",
        identity: "maxCycle",
        type: "decimal",
        show: {
          useCustomIf: ({ data: productionOrder = {} }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return (
              level === "N6" ||
              (!!lodashGet(productionOrder, "moldId") &&
                !!lodashGet(productionOrder, "productId"))
            );
          }
        }
      },
      {
        text: "UM",
        identity: "cycleUM",
        variants: "short",
        required: {
          useCustomIf: ({ data }) => {
            if (data.isInProduction === 0) {
              return false;
            }
            return true
          }
        },
        // required: [["idealCycle", "minCycle", "maxCycle"]],
        populate: ["idealCycleUM", "minCycleUM", "maxCycleUM"],
        show: {
          useCustomIf: ({ data: productionOrder = {} }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return (
              level === "N6" ||
              (!!lodashGet(productionOrder, "moldId") &&
                !!lodashGet(productionOrder, "productId"))
            );
          }
        },
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
      text: "Lote",
      identity: "lot",
      type: "string"
    },
    {
      text: "Descrição",
      identity: "description",
      // TODO type longtext
      type: "string"
    },
    {
      text: "Cor",
      identity: "color",
      type: "string"
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

export default {
  form
};

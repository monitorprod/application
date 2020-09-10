import React, { useContext } from "react";
import ApiContext from "../../../api";
import { lodashGet, useAuth } from "../../../utils";
import machinesIcon from "../../../icons/injector.svg";
import SensorURL from "./SensorURL";
import SensorAllURL from "./SensorAllURL"; 

export const list = [
  {
    text: "Cod Máquina",
    identity: "identity",
    filter: {
      type: "string"
    }
  },
  {
    text: "Nome",
    identity: "name",
    filter: {
      type: "string"
    }
  },
  {
    text: "Tipo",
    identity: "machine_type.name",
    model: {
      service: "machine_types",
      identity: "machineTypeId"
    }
  },
  {
    text: "Modelo",
    identity: "model",
    hidden: true,
    filter: {
      type: "string"
    }
  },
  {
    text: "Local",
    identity: "plant.name",
    model: {
      service: "plants",
      identity: "plantId"
    }
  },
  {
    text: "Sensor",
    identity: "sensor",
    customContent: { dontFilter: true },
    customText: () => <SensorAllURL />,
    customData: ({ ...props }) => <SensorURL {...props} />
  },
  {
    text: "Status",
    identity: "machine_status.name",
    customContent: { dontFilterWhenChild: true },
    model: {
      service: "machine_statuses",
      identity: "machineStatusId"
    }
  }
];

export const form = [
  [
    {
      text: "Foto",
      identity: "image",
      type: "image"
    }
  ],
  [
    {
      text: "Cod Barra",
      identity: "barcode",
      type: "string"
    },
    {
      text: "Cod Máquina",
      identity: "identity",
      max: 10,
      autoFocus: true,
      required: true,
      type: "string"
    },
    {
      text: "Status",
      identity: "machineStatusId",
      required: true,
      model: "machine_statuses",
      defaultValue: {
        config: "machine.status.init"
      }
    },
    {
      text: "Local",
      identity: "plantId",
      required: true,
      model: {
        service: "plants",
        useCustomQuery: () => {
          const client = useContext(ApiContext);
          return {
            plantStatusId: lodashGet(
              client.get("config.plant.status.active"),
              "value"
            )
          };
        }
      }
    }
  ],
  [
    {
      text: "Nome",
      identity: "name",
      required: true,
      type: "string"
    },
    [
      {
        text: "Ciclo Médio",
        identity: "idealCycle",
        type: "decimal",
        readOnly: {
          useCustomIf: ({}) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level === "N1";
          }
        }
      },
      {
        text: "UM",
        identity: "idealCycleUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "time"
          }
        },
        required: "idealCycle"
      }
    ],
    {
      text: "Tipo",
      identity: "machineTypeId",
      model: "machine_types"
    },
    {
      text: "Tipo de Bico",
      identity: "nozzleType",
      model: "nozzle_types"
    }
  ],
  [
    [
      {
        text: "Fabricante",
        identity: "maker",
        type: "string"
      },
      {
        text: "Ano Fabricação",
        identity: "manufactureYear",
        type: "year"
      }
    ],
    [
      {
        text: "Modelo",
        identity: "model",
        type: "string"
      },
      {
        text: "Num Serie",
        identity: "serialNr",
        type: "string"
      },
      {
        text: "Fim Garantia",
        identity: "endGuarantee",
        type: "date"
      }
    ]
  ],
  [
    [
      {
        text: "Dist Colunas Comprimento",
        identity: "distanceColumnsLength",
        populate: ["distanceColumnsWidth"],
        type: "decimal"
      },
      {
        text: "X"
      }
    ],
    [
      {
        text: "Largura",
        identity: "distanceColumnsWidth",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "distanceColumnsUM",
        variants: "short",
        populate: ["distanceColumnsLengthUM", "distanceColumnsWidthUM"],
        required: [["distanceColumnsLength", "distanceColumnsWidth"]],
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        }
      }
    ],
    [
      {
        text: "Dim Placa Comprimento",
        identity: "plateSizeLength",
        populate: ["plateSizeWidth"],
        type: "decimal"
      },
      {
        text: "X"
      }
    ],
    [
      {
        text: "Largura",
        identity: "plateSizeWidth",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "plateSizeUM",
        variants: "short",
        populate: ["plateSizeLengthUM", "plateSizeWidthUM"],
        required: [["plateSizeLength", "plateSizeWidth"]],
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        }
      }
    ]
  ],
  [
    [
      {
        text: "Força de Fechamento",
        identity: "lockingForce",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "lockingForceUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "force"
          }
        },
        required: "lockingForce"
      }
    ],
    [
      {
        text: "Curso Abertura",
        identity: "openingStroke",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "openingStrokeUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        },
        required: "openingStroke"
      }
    ],
    [
      {
        text: "Diâmetro Anel Central",
        identity: "centralRingDiameter",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "centralRingDiameterUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        },
        required: "centralRingDiameter"
      }
    ],
    [
      {
        text: "Diâmetro Rosca de Injeção",
        identity: "injectionThreadDiameter",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "injectionThreadDiameterUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        },
        required: "injectionThreadDiameter"
      }
    ]
  ],
  [
    {
      text: "Altura Mínima Molde",
      identity: "minMoldHeight",
      type: "decimal"
    },
    [
      {
        text: "Altura Máxima Molde",
        identity: "maxMoldHeight",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "moldHeightUM",
        variants: "short",
        populate: ["minMoldHeightUM", "maxMoldHeightUM"],
        required: [["minMoldHeight", "maxMoldHeight"]],
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        }
      }
    ],
    [
      {
        text: "Peso Máximo Molde",
        identity: "maxMoldWeight",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "maxMoldWeightUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "mass"
          }
        },
        required: "maxMoldWeight"
      }
    ]
  ]
];

export const links = [
  {
    text: "Cadastros",
    href: "/master-data"
  },
  {
    text: "Máquinas",
    href: "/master-data/machines"
  }
];

export const metadata = {
  name: "machines",
  icon: { type: "svg", src: machinesIcon },
  listPath: "/master-data/machines",
  formPath: "/master-data/machines",
  paramsProp: "machineId",
  newItemText: "Nova Máquina"
};

export default {
  metadata,
  list,
  form,
  links,
  options: {
    readPermissions: ["readMasterData"],
    writePermissions: ["writeMasterData"]
  },
  customContent: {
    customBreadCrumbsName: ({ data = {} }) =>
      `${data.identity ? `${data.identity} - ` : ""}${data.name}`
  },
  query: {
    $sort: { identity: 1 }
  }
};

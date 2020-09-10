import { lodashGet } from "../../../utils";
import moldsIcon from "../../../icons/mold.svg";

export const list = [
  {
    text: "Cod Molde",
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
    text: "Cavidades",
    identity: "cavities",
    filter: {
      type: "string"
    }
  },
  {
    text: "Ciclo Médio",
    identity: "idealCycle",
    customContent: { dontFilter: true },
    customData: ({ data: mold = {} }) =>
      `${mold.idealCycle || ""} ${
        mold.idealCycle ? lodashGet(mold, "ideal_cycle_measurement_unit.name") || "" : ""
      }`
  },
  {
    text: "Status",
    identity: "mold_status.name",
    model: {
      service: "mold_statuses",
      identity: "moldStatusId"
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
      text: "Cod Molde",
      identity: "identity",
      max: 10,
      autoFocus: true,
      required: true,
      type: "string"
    },
    {
      text: "Status",
      identity: "moldStatusId",
      required: true,
      model: "mold_statuses",
      defaultValue: {
        config: "mold.status.init"
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
    {
      text: "Cavidades",
      identity: "cavities",
      required: true,
      type: "integer"
    },
    [
      {
        text: "Ciclo Médio",
        identity: "idealCycle",
        type: "decimal"
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
    ]
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
    {
      text: "Tipo de Bico",
      identity: "nozzleType",
      model: "nozzle_types"
    },
    {
      text: "Comprimento",
      identity: "length",
      type: "decimal"
    },
    {
      text: "Largura",
      identity: "width",
      type: "decimal"
    },
    [
      {
        text: "Altura",
        identity: "height",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "UM",
        variants: "short",
        populate: ["lengthUM", "widthUM", "heightUM"],
        required: [["length", "width", "height"]],
        model: {
          service: "measurement_units",
          query: {
            type: "distance"
          }
        },
        defaultValue: {
          config: "mold.size.um"
        }
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
        text: "Peso do Molde",
        identity: "weight",
        type: "decimal"
      },
      {
        text: "UM",
        identity: "weightUM",
        variants: "short",
        model: {
          service: "measurement_units",
          query: {
            type: "mass"
          }
        },
        required: "weight",
        defaultValue: {
          config: "mold.weight.um"
        }
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
    text: "Moldes",
    href: "/master-data/molds"
  }
];

export const metadata = {
  name: "molds",
  icon: { type: "svg", src: moldsIcon },
  listPath: "/master-data/molds",
  formPath: "/master-data/molds",
  paramsProp: "moldId",
  newItemText: "Novo Molde"
};

export default {
  metadata,
  list,
  form,
  links,
  options: {
    // TODO permission for OP on model too, and for subtables
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

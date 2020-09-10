import { lodashGet, useAuth } from "../../../utils";

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
    identity: "plant_status.name",
    customContent: { dontFilterWhenChild: true },
    model: {
      service: "plant_statuses",
      identity: "plantStatusId"
    }
  }
];

export const form = [
  [
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
        identity: "plantStatusId",
        required: true,
        model: "plant_statuses",
        defaultValue: {
          config: "plant.status.init"
        }
      }
    ],
    [
      {
        text: "Horas Trabalhadas/Semana",
        identity: "hoursPerWeek",
        type: "decimal",
        readOnly: {
          ifThis: "turns.length"
        }
      },
      {
        text: "Tempo para notificação (min)",
        identity: "notificationTimeMIN",
        type: "decimal",
        defaultValue: 5,
        minValue: 1,
        maxValue: 15,
        handleChange: ({ data = {}, handleChange }) => {
          const value = lodashGet(data, 'target.value');
          if (value < 1) {
            setTimeout(() => {
              handleChange({
                target: {
                  name: 'notificationTimeMIN',
                  value: 1
                }
              })
            }, 0)
          }
          if (value > 15) {
            setTimeout(() => {
              handleChange({
                target: {
                  name: 'notificationTimeMIN',
                  value: 15
                }
              })
            }, 0)
          }
        }
      }
    ]
  ],
  [
    [
      {
        text: "Apontar Qualidade",
        identity: "qualityTrackType",
        required: true,
        enum: ["Q Refugo", "Q Confirmada"],
        readOnly: {
          useCustomIf: ({ }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level !== "N1";
          }
        }
      },
      {
        text: "Frequencia",
        identity: "qualityTrackFrequency",
        required: true,
        // enum: ["Horario", "Turno", "Diario", "Encerramento"]
        enum: ["Turno", "Diario", "Encerramento"],
        readOnly: {
          useCustomIf: ({ }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level !== "N1";
          }
        }
      }
    ],
    [
      {
        text: "Motivo Refugo",
        identity: "wasteJustification",
        type: "boolean",
        readOnly: {
          useCustomIf: ({ }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level !== "N1";
          }
        }
      },
      {
        text: "Refugo Automatico SETUP/PARADA PROG",
        identity: "wasteAutoTrack",
        type: "boolean",
        readOnly: {
          useCustomIf: ({ }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level !== "N1";
          }
        }
      },
      {
        text: "Notas para OP",
        identity: "PONotes",
        type: "boolean",
        readOnly: {
          useCustomIf: ({ }) => {
            const { session } = useAuth();
            const level = lodashGet(session, "company.level");
            return level !== "N1";
          }
        }
      }
    ]
  ]
];

export const links = [
  {
    text: "Administração",
    href: "/administration"
  },
  {
    text: "Locais",
    href: "/administration/plants"
  }
];

export const metadata = {
  name: "plants",
  listPath: "/administration/plants",
  formPath: "/administration/plants",
  paramsProp: "plantId",
  newItemText: "Novo Local"
};

export default {
  metadata,
  list,
  form,
  links,
  options: {
    dontCopy: true
  }
};

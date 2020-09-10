export const form = [
  [
    [
      {
        text: "Turno",
        identity: "name",
        autoFocus: true,
        required: true,
        type: "string"
      },
      {
        text: "Descrição",
        identity: "description",
        type: "string"
      }
    ],
    [
      {
        text: "Hora Inicio",
        identity: "startTime",
        required: true,
        type: "time"
      },
      {
        text: "Hora Fim",
        identity: "endTime",
        required: true,
        type: "time"
      }
    ]
  ],
  [
    {
      text: "Seg",
      identity: "monday",
      type: "boolean"
    },
    {
      text: "Ter",
      identity: "tuesday",
      type: "boolean"
    },
    {
      text: "Qua",
      identity: "wednesday",
      type: "boolean"
    },
    {
      text: "Qui",
      identity: "thursday",
      type: "boolean"
    },
    {
      text: "Sex",
      identity: "friday",
      type: "boolean"
    },
    {
      text: "Sab",
      identity: "saturday",
      type: "boolean"
    },
    {
      text: "Dom",
      identity: "sunday",
      type: "boolean"
    }
  ]
];

export const metadata = {
  name: "turns",
  paramsProp: "turnId",
  newItemText: "Novo Turno"
};

export default { form, metadata };

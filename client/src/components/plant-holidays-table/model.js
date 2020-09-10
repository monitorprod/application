export const form = [
  [
    [
      {
        text: "Descrição",
        identity: "name",
        autoFocus: true,
        required: true,
        type: "string"
      },
      {
        text: "Data Inicio",
        identity: "startDate",
        required: true,
        type: "datetime"
      },
      {
        text: "Data Fim",
        identity: "endDate",
        required: true,
        type: "datetime"
      }
    ],
    [
      {
        text: "Não Trabalhado",
        identity: "noWorkDay",
        type: "boolean",
        defaultValue: true
      },
      {
        text: "Data Recorrente",
        identity: "recurring",
        type: "boolean"
      }
    ]
  ]
];

export const metadata = {
  name: "holidays",
  paramsProp: "holidayId",
  newItemText: "Novo Dia Não Trabalhado"
};

export default { form, metadata };

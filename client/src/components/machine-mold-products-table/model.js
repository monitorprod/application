export const form = [
  [
    {
      text: "Ciclo Ideal",
      identity: "idealCycle",
      autoFocus: true,
      required: true,
      type: "decimal"
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
  ]
];

export default { form };

export const form = [
  {
    text: "Nome",
    identity: "name",
    required: true,
    type: "string"
  },
  {
    text: "Descrição",
    identity: "description",
    type: "string"
  },
  {
    text: "Tabela",
    identity: "model",
    enum: [
      "measurement_units",
      "machine_statuses",
      "mold_statuses",
      "product_statuses",
      "sensor_statuses",
      "production_order_statuses"
    ]
  },
  {
    text: "Valor",
    identity: "value",
    type: "string",
    model: {
      this: "model"
    }
  }
];

export const metadata = {
  name: "configs"
};

export default { metadata, form };

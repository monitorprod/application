const lodash = require("lodash");
const getConfigs = require("../../utils/getConfigs");
const { getActionType } = require("../../utils/events");

module.exports = function() {
  return async context => {
    const { app, result } = context;
    const productionOrderTypesService = app.service("production_order_types");
    const eventTypesService = app.service("production_order_event_types");
    const actionTypesService = app.service("production_order_action_types");
    await getConfigs({ app });
    const eventTypes = lodash.map(
      ["active", "closed", "min", "max", "noJustified", "noWorkDay"],
      key => ({
        id: getActionType({ app, type: key })
      })
    );
    const { data: actionTypes } = await actionTypesService.find();
    // TODO verify events created on company setup
    lodash.map(actionTypes, ({ id, name, description }) => {
      if (`${id}` !== `${getActionType({ app, type: "undefined" })}`) {
        eventTypesService.create({
          name,
          description,
          productionOrderActionTypeId: id,
          companyId: result.id,
          isSystemEvent: !!lodash.find(eventTypes, { id: `${id}` })
        });
        if (`${id}` === `${getActionType({ app, type: "active" })}`) {
          productionOrderTypesService.create({
            name,
            description,
            companyId: result.id,
            isInProduction: true
          });
        } else if (`${id}` === `${getActionType({ app, type: "scheduledStop" })}`) {
          productionOrderTypesService.create({
            name,
            description,
            companyId: result.id,
            isInProduction: false
          });
        }
      }
    });
    eventTypesService.create({
      name: "FALTA OP",
      productionOrderActionTypeId: getActionType({ app, type: "scheduledStop" }),
      companyId: result.id,
      isSystemEvent: true,
    });
    eventTypesService.create({
      name: "MÁQUINA DESLIGADA",
      productionOrderActionTypeId: getActionType({ app, type: "closed" }),
      companyId: result.id,
      isSystemEvent: true,
    });
    return context;
  };
};

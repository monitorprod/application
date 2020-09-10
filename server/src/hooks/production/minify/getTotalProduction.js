const lodash = require("lodash");
const moment = require("moment");

const getCavitiesChanges = ({ data, history }) => {
  let initRange = false;
  let endRange = false;
  return (
    lodash.reduce(
      lodash.get(history, "cav"),
      (changes, cav, index) => {
        const startD = moment(data.startDate);
        const endD = data.endDate === -1 ? moment() : moment(data.endDate);
        const cavD = moment(cav.d);
        if (!endRange && !initRange) {
          if (startD.isSame(cavD, "minute")) {
            initRange = true;
          } else if (startD.isBefore(cavD, "minute")) {
            initRange = true;
            if (index > 0) {
              changes.push(lodash.get(history, `cav.${index - 1}`));
            }
          }
        }
        if (!endRange && initRange) {
          if (endD.isAfter(cavD, "minutes")) {
            changes.push(cav);
          } else {
            endRange = true;
          }
        }
        if (
          index === (lodash.get(history, "cav.length") || 0) - 1 &&
          changes.length === 0
        ) {
          changes.push(cav);
        }
        return changes;
      },
      []
    ) || []
  );
};

const getTotalProduction = async ({ app, data, productionOrder }) => {
  const productionOrderHistoryService = app.service("production_order_history");
  let history;
  if (productionOrder) {
    history = lodash.get(
      await productionOrderHistoryService.find({
        query: { poi: lodash.get(productionOrder, "id"), $limit: 1 },
      }),
      "data.0"
    );
  }
  const cavitiesChanges = getCavitiesChanges({ data, history });
  let openCavities,
    changesIndex = 0;
  return lodash.reduce(
    data.readings,
    (sum, r, index) => {
      if (cavitiesChanges.length) {
        if (!openCavities) {
          openCavities = lodash.get(cavitiesChanges, `${changesIndex}.cav`);
        }
        const startD = moment(data.startDate);
        const nextCavD = moment(
          lodash.get(cavitiesChanges, `${changesIndex + 1}.d`)
        );
        if (startD.add(index, "minutes").isAfter(nextCavD)) {
          changesIndex += 1;
          openCavities = lodash.get(cavitiesChanges, `${changesIndex}.cav`);
        }
      }
      if (!openCavities) {
        openCavities = lodash.get(productionOrder, "openCavities") || 0;
      }
      return sum + (parseInt(openCavities, "10") || 0) * parseFloat(r.total);
    },
    0
  );
};

module.exports = getTotalProduction;

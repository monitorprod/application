const lodash = require("lodash");
const hydrate = require("feathers-sequelize/hooks/hydrate");

module.exports = function({ include: propsInclude, custom: propsCustom }) {
  return async context => {
    const { app, service, method, type, params, result } = context;
    if (
      ((lodash.get(params, "$populateAll") || lodash.get(params, "query.$populateAll")) &&
        method === "find") ||
      method === "get"
    ) {
      params.$populateAll = true;
      lodash.unset(params, "query.$populateAll");
    }
    if (
      ((lodash.get(params, "$populateSelect") || lodash.get(params, "query.$populateSelect")) &&
        method === "find") ||
      method === "get"
    ) {
      params.$populateSelect =
        lodash.get(params, "$populateSelect") || lodash.get(params, "query.$populateSelect");
      lodash.unset(params, "query.$populateSelect");
    }
    if (params.$populateAll || params.$populateSelect) {
      const selectFields = params.$populateSelect || [];
      if (propsInclude) {
        let include = propsInclude;
        // TODO this logic on a util function
        if (!Array.isArray(include)) {
          include = [include];
        }
        const association = {
          include: include
            .filter(
              ({ as, method: itemMethod }) =>
                (selectFields.length > 0 ? selectFields.indexOf(as) !== -1 : true) &&
                (itemMethod ? method === itemMethod : true)
            )
            .map(({ model, as }) => ({
              model: app.service(model).Model,
              as
            }))
        };
        switch (type) {
          case "before":
            params.sequelize = Object.assign(association, { raw: false });
            break;
          case "after":
            hydrate(association).call(service, context);
            break;
        }
      }
      if (type === "after" && propsCustom) {
        let custom = propsCustom;
        if (!Array.isArray(custom)) {
          custom = [custom];
        }
        let resultArray = result.data || result;
        if (!Array.isArray(resultArray)) {
          resultArray = [resultArray];
        }
        await Promise.all(
          lodash.map(
            resultArray,
            async item =>
              await Promise.all(
                lodash.map(
                  custom.filter(
                    ({ as, method: itemMethod }) =>
                      (selectFields.length > 0 ? selectFields.indexOf(as) !== -1 : true) &&
                      (itemMethod ? method === itemMethod : true)
                  ),
                  async ({ searchType, model, as, key, query = {} }) => {
                    if (searchType === "find") {
                      const { data: find } = await app.service(model).find({
                        query: {
                          [key]: item.id,
                          ...query
                        }
                      });
                      item[as] = find;
                    } else if (item[key]) {
                      try {
                        item[as] = await app.service(model).get(item[key]);
                      } catch (error) {
                        console.log("!!! populate ERROR", error);
                      }
                    }
                  }
                )
              )
          )
        );
      }
    }
    return context;
  };
};

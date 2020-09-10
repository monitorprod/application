const lodash = require("lodash");

module.exports = function({ objectIdName, throughModel }) {
  return async context => {
    const { app, data, result } = context;
    const throughService = app.service(throughModel);
    if (lodash.isNil(data.attributes)) {
      return context;
    }
    if (!lodash.isArray(data.attributes)) {
      data.attributes = [data.attributes];
    }
    let resultArray = result;
    if (!lodash.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async item => {
        return await Promise.all(
          lodash.map(data.attributes, async attribute => {
            await throughService.create({
              companyId: data.companyId,
              [objectIdName]: item.id,
              attributeId: attribute.id,
              value: attribute.value
            });
            return context;
          })
        );
      })
    );
  };
};

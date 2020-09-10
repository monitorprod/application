const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const machineMoldProductsService = app.service("machine_mold_products");
    if (lodash.isNil(data.products)) {
      return context;
    }
    if (!lodash.isArray(data.products)) {
      data.products = [data.products];
    }
    let resultArray = result;
    if (!lodash.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async machine => {
        return await Promise.all(
          lodash.map(data.products, async product => {
            const query = {
              companyId: data.companyId,
              machineId: product.machineId || machine.id,
              moldId: product.moldId || null,
              productId: product.productId
            };
            const { data: machineMoldProducts } = await machineMoldProductsService.find({ query });
            const newProduct = { ...product, ...query };
            if (machineMoldProducts.length) {
              try {
                await machineMoldProductsService.patch(null, newProduct, {
                  query
                });
              } catch (error) {}
            } else {
              await machineMoldProductsService.create(newProduct);
            }
            return context;
          })
        );
      })
    );
  };
};

const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const productsService = app.service("products");
    const moldProductsService = app.service("mold_products");
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
      lodash.map(resultArray, async mold => {
        return await Promise.all(
          lodash.map(data.products, async product => {
            let newProduct;
            if (product.id) {
              newProduct = await productsService.patch(product.id, product);
            } else {
              product.companyId = data.companyId;
              newProduct = await productsService.create(product);
            }
            const query = {
              companyId: data.companyId,
              moldId: mold.id,
              productId: newProduct.id || product.productId
            };
            const { data: moldProducts } = await moldProductsService.find({
              query
            });
            newProduct = { ...product, ...newProduct, ...query };
            if (moldProducts.length) {
              try {
                await moldProductsService.patch(null, newProduct, {
                  query
                });
              } catch (error) {}
            } else {
              await moldProductsService.create(newProduct);
            }
            return context;
          })
        );
      })
    );
  };
};

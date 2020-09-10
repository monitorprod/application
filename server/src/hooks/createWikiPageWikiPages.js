const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const wikiPagesService = app.service("wiki_pages");
    if (lodash.isNil(data.wiki_pages)) {
      return context;
    }
    if (!lodash.isArray(data.wiki_pages)) {
      data.wiki_pages = [data.wiki_pages];
    }
    let resultArray = result;
    if (!lodash.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async wikiPage => {
        return await Promise.all(
          lodash.map(data.wiki_pages, async subWikiPage => {
            subWikiPage.wikiPageId = wikiPage.id;
            if (subWikiPage.id) {
              await wikiPagesService.patch(subWikiPage.id, subWikiPage);
            } else {
              await wikiPagesService.create(subWikiPage);
            }
            return context;
          })
        );
      })
    );
  };
};

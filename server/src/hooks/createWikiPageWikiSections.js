const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const wikiSectionsService = app.service("wiki_sections");
    if (lodash.isNil(data.wiki_sections)) {
      return context;
    }
    if (!lodash.isArray(data.wiki_sections)) {
      data.wiki_sections = [data.wiki_sections];
    }
    let resultArray = result;
    if (!lodash.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async wikiPage => {
        return await Promise.all(
          lodash.map(data.wiki_sections, async wikiSection => {
            wikiSection.wikiPageId = wikiPage.id;
            if (wikiSection.id) {
              await wikiSectionsService.patch(wikiSection.id, wikiSection);
            } else {
              await wikiSectionsService.create(wikiSection);
            }
            return context;
          })
        );
      })
    );
  };
};

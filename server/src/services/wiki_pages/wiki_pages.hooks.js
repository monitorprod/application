const { authenticate } = require("@feathersjs/authentication").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { verifyIsSysAdmin } = require("../../hooks/session");
const createWikiPageWikiPages = require("../../hooks/createWikiPageWikiPages");
const createWikiPageWikiSections = require("../../hooks/createWikiPageWikiSections");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  custom: [
    { searchType: "find", model: "wiki_pages", as: "wiki_pages", key: "wikiPageId" },
    { searchType: "find", model: "wiki_sections", as: "wiki_sections", key: "wikiPageId" }
  ]
});

module.exports = {
  before: {
    all: [authenticate("jwt"), cleanFlags()],
    find: [populateHook],
    get: [populateHook],
    create: [verifyIsSysAdmin()],
    update: [],
    patch: [verifyIsSysAdmin()],
    remove: [verifyIsSysAdmin()]
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
    create: [createWikiPageWikiPages(), createWikiPageWikiSections()],
    update: [],
    patch: [createWikiPageWikiPages(), createWikiPageWikiSections()],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

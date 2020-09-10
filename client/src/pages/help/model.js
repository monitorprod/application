export const tree = [
  {
    text: "Nome",
    identity: "name",
    type: "string"
  }
];

export const form = [
  [
    {
      text: "Nome",
      identity: "name",
      type: "string",
      required: true
    },
    {
      text: "Descrição",
      identity: "content",
      type: "content"
    }
  ]
];

export const links = [
  {
    text: "Cadastro",
    href: "/sysadmin"
  },
  {
    text: "Wiki",
    href: "/help/home"
  }
];

export const metadata = {
  name: "wiki_pages",
  paramsProp: "wikiPageId",
  listPath: "/help/home",
  formPath: "/help",
  newItemText: "Novo"
};

export default {
  tree,
  form,
  links,
  metadata,
  query: { wikiPageId: null },
  options: {
    dontUseBreadcrumbs: true,
    dontUseEnter: true
  }
};

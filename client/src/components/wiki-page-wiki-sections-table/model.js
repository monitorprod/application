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
      type: "content",
      required: true
    }
  ]
];

export const metadata = {
  name: "wiki_sections",
  paramsProp: "wikiSectionId",
  newItemText: "Nova Seção"
};

export default {
  form,
  metadata
};

export const contact = [
  {
    variants: 'inputBootstrap', fields: [
      [
        {
          text: "Seu nome",
          identity: "name",
          type: "string",
          required: true,
          variants: 'inputBootstrap'
        },
        {
          text: "Seu e-mail",
          identity: "email",
          type: "string",
          required: true,
          variants: 'inputBootstrap'
        },
        {
          text: 'Seu telefone',
          identity: "phone",
          type: "string",
          required: true,
          variants: 'inputBootstrap'
        }
      ],
      [
        {
          text: 'Sua mensagem',
          identity: "message",
          type: "longtext",
          required: true,
          variants: 'inputBootstrap'
        }
      ]
    ]
  }
]

export const links = [
  {
    text: "Wiki",
    href: "/help/home"
  }
];

export const metadata = {
  name: "site_contacts",
  formPath: "/help/home",
  newItemText: "Novo"
};

export default {
  contact,
  links,
  metadata,
};

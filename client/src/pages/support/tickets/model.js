import React from 'react';
import moment from 'moment';
import { lodashGet, useAuth } from '../../../utils';
import { Typography } from '@material-ui/core';

const customTree = ({ data = {} }) => {

  const status = {
    "ABERTO": {
      style: {
        fontSize: '14px',
        width: '90px',
        borderRadius: '20px',
        backgroundColor: 'rgb(129, 215, 66)',
        color: 'white',
        textAlign: 'center'
      }
    },
    "FECHADO": {
      style: {
        fontSize: '14px',
        width: '90px',
        borderRadius: '20px',
        backgroundColor: 'rgb(51, 51, 51)',
        color: 'white',
        textAlign: 'center'
      }
    },
    "URGENTE": {
      style: {
        fontSize: '14px',
        width: '90px',
        borderRadius: '20px',
        backgroundColor: 'red',
        color: 'white',
        textAlign: 'center'
      }
    }
  }

  const style = lodashGet(status[data.ticket_status.name], 'style')

  return (
    <React.Fragment>
      <Typography variant="body1">{data.title}</Typography>
      <Typography variant="subtitle2">
        {moment(data.createdAt).format('DD/MMM/YYYY HH:mm')}
      </Typography>
        <div style={{ ...style }}>
          {data.ticket_status.name}
        </div>
    </React.Fragment>
  )
}
export const form = [
  [
    {
      text: 'Titulo',
      identity: 'title',
      type: 'string',
      required: true,
      customTree,
    }
  ],
  [
    {
      text: 'Criado em',
      identity: 'createdAt',
      type: 'datetime',
      readOnly: true
    },
    {
      text: "Status",
      identity: "ticketStatusId",
      required: true,
      model: "ticket_statuses",
      defaultValue: {
        config: "ticket.status.init"
      },
      readOnly: {
        useCustomIf: ({ }) => {
          const { session } = useAuth();
          const isAdmin = lodashGet(session, 'isAdmin')
          return !isAdmin;
        }
      }
    }
  ]
]

export const links = [
  {
    text: "Tickets",
    href: "/support"
  }
]

export const metadata = {
  name: "tickets",
  paramsProp: "ticketId",
  listPath: "/support",
  formPath: "/support",
  newItemText: "Novo"
}

export default {
  form,
  links,
  metadata,
  query: {
    $sort: { title: 1 },
    $populateAll: true
  },
  customContent: {
    customTree: customTree
  }
}
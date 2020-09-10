import React, { useEffect, useContext } from 'react';

import ApiContext from '../../api';
import {
  withStyles,
  lodashGet,
  useFindService,
  Link,
  useAuth
} from '../../utils';

import {
  ListItemAvatar, ListItemIcon, IconButton, Tooltip,Typography,
  ListItemSecondaryAction, ListItem, ListItemText, Divider, Badge
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import ReportIcon from '@material-ui/icons/Report';
import DoneIcon from "@material-ui/icons/Done";
import ReportOutlineIcon from "@material-ui/icons/ReportOutlined";
import moment from 'moment';

const styles = theme => ({
  link:{
    color: theme.palette.type === "dark"? theme.palette.common.white : theme.palette.primary.main,
    textTransform: 'capitalize'
  },
  urgent:{
    color: theme.palette.error.main,
  },
  nested:{
    paddingLeft: theme.spacing(4),
  },
  badge:{
    top: '8px',
    right: '-20px'
  }
});

const UnreadBadge = withStyles((theme) => ({
  badge: {
    right: -20,
    top: 8,
  },
}))(Badge);

const NotificationMessageItem = ({ classes, ticket, isAdminApp , type, withoutClosedTickets, reloadTicket}) => {

  const client = useContext(ApiContext);


  /* Query to filter messages */
  const query = {
    ticketId: ticket.id
  }

  /* Ticket List */
  const { list: listMessages, reload: reloadMessages, loading: loadingMessages, setQuery: setQueryMessages } = useFindService({
    model: "ticket_messages",
    query: {
      ...query,
      viewedAt: null
    }
  })
  
  const { session } = useAuth();

  const userId = lodashGet(session, 'userId')
  
  const unreadMessages = listMessages.filter(message => message.userId !== userId)

  const STATUS ={
    "EM ANDAMENTO" : 1,
    "URGENTE" : 11,
    "FECHADO" : 21
  }

  const changeUrgency = async ticket => {
    await client.service("tickets").patch(ticket.id,ticket.ticketStatusId === STATUS["EM ANDAMENTO"] ? {ticketStatusId : STATUS.URGENTE} : {ticketStatusId: STATUS["EM ANDAMENTO"]})
    .then(resp => reloadTicket())
  }

  const changeClose = async ticket => {
    await client.service("tickets").patch(ticket.id,(ticket.ticketStatusId === STATUS["EM ANDAMENTO"] || ticket.ticketStatusId === STATUS.URGENTE) ? {ticketStatusId : STATUS.FECHADO} : {ticketStatusId: STATUS["EM ANDAMENTO"]})
    .then(resp => reloadTicket())
  }

  const stringQuery = JSON.stringify(query);

  useEffect(() => {
    setQueryMessages(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
  }, [stringQuery, setQueryMessages]);

  const getAvatar = (status, isAdminApp) =>{
    if (isAdminApp && status != "FECHADO")
      return ticket.ticket_status.name === "URGENTE" ? <ReportIcon className={classes.urgent} style={{fontSize:"40"}}/> : <ReportOutlineIcon style={{fontSize:"40"}}/>;

    switch (status) {
      case "FECHADO":
        return  <CloseIcon /> 
      case "URGENTE":
        return  <ReportIcon className={classes.urgent}/> 
          
      default:
        return <ReportOutlineIcon />
    }
  }

  if (!(ticket.ticket_status != null && ticket.ticket_status.name === "FECHADO" && withoutClosedTickets))
    return (
      <React.Fragment>
        <Divider />
        <ListItem 
          className={type === "Menu" ? classes.nested : null}
          button
          key={ticket.id}
          component={Link}
          to={`/support/${ticket.id}`}
        >
        {!isAdminApp && <ListItemAvatar>
            <ListItemIcon>
              <Tooltip title={ticket.ticket_status.name} aria-label={ticket.ticket_status.name}>
                {getAvatar(ticket.ticket_status.name, isAdminApp)}
              </Tooltip>
            </ListItemIcon>
          </ListItemAvatar>}

          <ListItemText  style={{paddingRight: isAdminApp? '40px' : ''}}
            primary={<div className={classes.link} style={{textDecoration: ticket.ticket_status.name === "FECHADO" ? 'line-through' : ''}}>{ticket.id} - {ticket.title.toLowerCase()}</div>}
            secondary={
              <UnreadBadge badgeContent={unreadMessages.length} color="secondary" >
                <span  style={{textDecoration: ticket.ticket_status.name === "FECHADO" ? 'line-through' : ''}}>{ticket.ticket_status.name} : {moment(ticket.createdAt).format("DD/MM/YYYY HH:mm")}</span>
              </UnreadBadge>
            }
          />
          { isAdminApp && type != "Menu" &&
            <ListItemSecondaryAction>
              <Tooltip title={ticket.ticket_status.name === "URGENTE" ? "URGENTE" : "NORMAL"} aria-label="URGENCIA">
                <IconButton edge="end" aria-label="delete" onClick={() => changeUrgency(ticket)}>
                {ticket.ticket_status.name === "URGENTE" ? <ReportIcon className={classes.urgent}/>: <ReportOutlineIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title={ticket.ticket_status.name === "FECHADO" ? "FECHADO" : "EM ANDAMENTO"} aria-label="FECHADO">
                  <IconButton edge="end" aria-label="delete" onClick={() => changeClose(ticket)}>
                    {ticket.ticket_status.name != "FECHADO" ? <DoneIcon /> : <CloseIcon />}
                  </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          }
        </ListItem>
        </React.Fragment>
    )
    else
      return null
}

export default withStyles(styles, { withTheme: true })(NotificationMessageItem);
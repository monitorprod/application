import React, { useState, useContext, useEffect } from "react";

import {
  lodashMap,
  lodashGet,
  lodashFilter,
  useFindService,
  useAuth,
  Link,
  withStyles
} from "../../utils"

import {
  Icon,
  AppBar,
  Toolbar,
  Button,FormControlLabel,
  Typography,
  Badge,
  Switch,
  List, ListItemIcon, Grid,
  ListItem, ListItemText
} from "@material-ui/core";

import ReportIcon from '@material-ui/icons/Report';
import ReportOutlineIcon from "@material-ui/icons/ReportOutlined";

// import NotFound from "../not-found";
// import Button from "../buttons";
import NotificationMessageItem from "./NotificationMessageItem";
import Tree from "../master-data-form/Tree";
import TreeSupportItem from "./TreeSupportItem";

import Companies from "../../pages/sysadmin/companies/model";

import ApiContext from "../../api";

const styles = theme => ({
  ticketsList:{
    maxHeight: '100%' ,overflow: 'overlay', overflowX: 'hidden', paddingTop: 0
  },
  addTicket:{
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
  },
  wrapper: {
    position: "relative",
    "&>div": {
      margin: 0
    }
  },
  button: {
    height: 50,
    "&>span>div": {
      width: "100% !important",
      height: "100% !important",
      borderRadius: 0
    },
    [theme.breakpoints.up("md")]: {
      background: "none",
      border: "none",
      color: theme.palette.common.white,
      boxShadow: "none"
    },
    [theme.breakpoints.down("sm")]: {
      width: 50,
      padding: 0
    }
  },
  userMenuItem: {
    backgroundColor: theme.palette.primary.header,
    color: theme.palette.common.white,
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    "&:hover": {
      backgroundColor: theme.palette.primary.header
    }
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    fontSize: ".65rem",
    background: theme.palette.primary.delete,
    borderRadius: "50%",
    height: 18,
    width: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  list: {
    paddingBottom: "0px",
    maxWidth: 350,
    //maxHeight: 350
  },
  item: {
    height: "auto",
    whiteSpace: "normal",
    padding: theme.spacing(1),
    "&>div": {
      width: "100%"
    }
  },
  // open: {
  //   width: '20px',
  //   height: '20px',
  //   borderRadius: '20px',
  //   backgroundColor: 'rgb(129, 215, 66)',
  //   color: 'white',
  //   textAlign: 'center',
  //   marginLeft: '5px'
  // },
  // closed: {
  //   width: '20px',
  //   height: '20px',
  //   borderRadius: '20px',
  //   backgroundColor: 'rgb(51, 51, 51)',
  //   color: 'white',
  //   textAlign: 'center',
  //   marginLeft: '5px'
  // },
  // urgent: {
  //   width: '20px',
  //   height: '20px',
  //   borderRadius: '20px',
  //   backgroundColor: 'red',
  //   color: 'white',
  //   textAlign: 'center',
  //   marginLeft: '5px'
  // },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  listHeader:{
    paddingLeft: theme.spacing(4),
    minHeight: 64,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main
  },
  urgent:{
    color: theme.palette.error.main,
    margin: 2
  },
  icon:{
    color: theme.palette.type === "dark"? theme.palette.common.white : theme.palette.primary.main,
    margin: 2
  }
});

const TicketsList = ({ classes, isAdminApp, type }) => {
  const client = useContext(ApiContext);
  const { session } = useAuth();
  const companyId = lodashGet(session, 'companyId')
  const [withoutClosedTickets, setWithoutClosedTickets] = useState(true);

  const { list: listTicket, loading: loadingTicket, reload: reloadTicket } = useFindService({
    model: "tickets",
    query: {
      $populateAll: true,
      $sort: {
        createdAt: -1
      }
    }
  });

  const { list: listMessages, reload: reloadMessages, loading: loadingMessages, setQuery: setQueryMessages } = useFindService({
    model: "ticket_messages"
  })

  useEffect(() => {
    setQueryMessages({
      ticketId: {
        $in: lodashMap(listTicket, t => t.id)
      },
      viewedAt: null,
      companyId: companyId
    })
  }, [listTicket, companyId, setQueryMessages])

  const userId = lodashGet(session, 'userId')
  const listMessagesUser = lodashFilter(listMessages, (ticket) => ticket.userId !== userId)

  useEffect(() => {
    const onNewEvent = () => {
      console.log('nova mensagem de suport');
      reloadMessages()
    }
    client.service("ticket_messages").on("created", onNewEvent);
    client.service("ticket_messages").on("patched", onNewEvent);
    return () => {
      client.service("ticket_messages").removeListener("created", onNewEvent);
      client.service("ticket_messages").removeListener("patched", onNewEvent);
    }
  }, [client]);

  useEffect(() => {
    const onNewEvent = () => {
      console.log('nova solicitação de suport');

      reloadTicket()
    }
    client.service("tickets").on("created", onNewEvent);
    client.service("tickets").on("patched", onNewEvent);
    return () => {
      client.service("tickets").removeListener("created", onNewEvent);
      client.service("tickets").removeListener("patched", onNewEvent);
    }
  }, [client]);

  const empty = !loadingTicket && listTicket.length === 0;

  return (
    <List  component="nav" className={classes.ticketsList} aria-labelledby="Lista de tickets" >
      <div style={{ width: 350}}>
        {type === "Menu" && !isAdminApp &&
          <ListItem button component={Link} to="/support/" className={classes.addTicket, classes.nested, classes.listHeader} >
            <ListItemIcon>
              <Icon >help</Icon>
            </ListItemIcon>
          <ListItemText primary={<Typography variant='button'>Abrir Novo</Typography>} />
          </ListItem>
        }
        {type != "Menu" &&
            <Toolbar variant="dense">
              {!isAdminApp && <Button variant="contained"  color="secondary" component={Link} to="/support/" startIcon={<Icon>edit</Icon>}>  Novo </Button>}
              <span style={{flex:1, color:'black'}}></span>
              <FormControlLabel
                style={{margin:'4px'}}
                value={withoutClosedTickets}
                control={<Switch color="secondary" onChange = {() =>setWithoutClosedTickets(p => !p)}/>}
                label="CONCLUÍDOS"
                labelPlacement="start"
              />
            </Toolbar>
        }
        {!empty && !isAdminApp &&
          lodashMap(
            listTicket,
            ticket => (
              <NotificationMessageItem key={ticket.id} ticket={ticket} type={type} reloadTicket={reloadTicket}  withoutClosedTickets={withoutClosedTickets}/>
            )
          )}
        {!empty && isAdminApp &&
          <Tree
            model={Companies.metadata}
            options={{
              dontTreeItemLink: isAdminApp
            }}
            query={Companies.query}
            customContent={{
              ...Companies.customContent,
              customTree: ({ data }) => {
                const ticketCompany = lodashFilter(listTicket, (ticket) => ticket.companyId === data.id)
                const ticketOpen = lodashFilter(ticketCompany, (ticket) =>  ticket.ticketStatusId === parseInt(lodashGet(client.get("config.ticket.status.init"), "value")))
                // const ticketClosed = lodashFilter(ticketCompany, (ticket) =>  ticket.ticketStatusId === parseInt(lodashGet(client.get("config.ticket.status.closed"), "value")))
                const ticketUrgent = lodashFilter(ticketCompany, (ticket) =>  ticket.ticketStatusId === parseInt(lodashGet(client.get("config.ticket.status.urgent"), "value")))
                return (
                  <Grid container>
                    {ticketUrgent.length >= 1 && <Badge color="secondary" badgeContent={ticketUrgent.length}><ReportIcon className={classes.urgent} /></Badge>} <div style={{width:12}}/>
                    {ticketOpen.length >= 1 && <Badge color="secondary" badgeContent={ticketOpen.length}><ReportOutlineIcon className={classes.icon} /></Badge>} <div style={{width:12}}/>
                    {/* {ticketClosed.length >= 1 && <Badge color="secondary" badgeContent={ticketClosed.length}><CloseIcon className={classes.icon}  /> </Badge>} */}
                  </Grid>
                )
              },
              afterTreeItem: ({ data }) =>
                <TreeSupportItem isAdminApp={isAdminApp} company={data} type={type} withoutClosedTickets={withoutClosedTickets}/>
            }}
          />
        }
      </div>
    </List>
  )
}

export default withStyles(styles, { withTheme: true })(TicketsList)
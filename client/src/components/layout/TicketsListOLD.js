import React, { useRef, useState, useContext, useEffect } from "react";

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
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Grid
} from "@material-ui/core";

import NotFound from "../not-found";
import Button from "../buttons";
import NotificationMessageItem from "./NotificationMessageItem";
import Tree from "../master-data-form/Tree";
import TreeSupportItem from "./TreeSupportItem";

import Companies from "../../pages/sysadmin/companies/model";

import ApiContext from "../../api";

const styles = theme => ({
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
    maxHeight: 350
  },
  item: {
    height: "auto",
    whiteSpace: "normal",
    padding: theme.spacing(1),
    "&>div": {
      width: "100%"
    }
  },
  open: {
    width: '20px',
    height: '20px',
    borderRadius: '20px',
    backgroundColor: 'rgb(129, 215, 66)',
    color: 'white',
    textAlign: 'center',
    marginLeft: '5px'
  },
  closed: {
    width: '20px',
    height: '20px',
    borderRadius: '20px',
    backgroundColor: 'rgb(51, 51, 51)',
    color: 'white',
    textAlign: 'center',
    marginLeft: '5px'
  },
  urgent: {
    width: '20px',
    height: '20px',
    borderRadius: '20px',
    backgroundColor: 'red',
    color: 'white',
    textAlign: 'center',
    marginLeft: '5px'
  }
});

const TicketsList = ({ classes, isAdminApp }) => {
  const client = useContext(ApiContext);
  const { session } = useAuth();
  const userId = lodashGet(session, 'userId')
  const companyId = lodashGet(session, 'companyId')

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

  const listMessagesUser = lodashFilter(listMessages, (ticket) => ticket.userId !== userId)

  useEffect(() => {
    const onNewEvent = () => {
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
      reloadTicket()
    }
    client.service("tickets").on("created", onNewEvent);
    client.service("tickets").on("patched", onNewEvent);
    return () => {
      client.service("tickets").removeListener("created", onNewEvent);
      client.service("tickets").removeListener("patched", onNewEvent);
    }
  }, [client]);

  const [open, setOpen] = useState(false);
  const MenuRef = useRef(null);

  const handleClose = event => {
    if (MenuRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  }
  const handleToggle = () => {
    setOpen(prev => !prev)
  }

  const empty = !loadingTicket && listTicket.length === 0;

  return (
    <React.Fragment>
      <div className={classes.wrapper}>
        <Button
          className={classes.button}
          buttonRef={node => {
            MenuRef.current = node;
          }}
          aria-owns={open ? "menu-list-grow" : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          type="icon"
          variants="navbar"
          icon="help"
          text="Suporte"
        />
        {!loadingMessages && listMessagesUser.length > 0 && (
          <div className={classes.badge}>{listMessagesUser.length}</div>
        )}
      </div>
      <Popper open={open} anchorEl={MenuRef.current} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id="menu-list-grow"
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom"
            }}
          >
            <Paper className={{ width: 350 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <div>
                  <MenuItem
                    className={classes.userMenuItem}
                    component={Link}
                    to="/support"
                  >
                    Tickets
                      <span style={{ flex: "1" }} />
                    <Icon>chat</Icon>
                  </MenuItem>
                  <MenuList className={classes.list}>
                    <div style={{ width: 350, height: listTicket.length ? 250 : 40 }}>
                      {empty && <NotFound />}
                      {!empty && !isAdminApp &&
                        lodashMap(
                          listTicket,
                          ticket => (
                            <NotificationMessageItem ticket={ticket} />
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
                             const ticketClosed = lodashFilter(ticketCompany, (ticket) =>  ticket.ticketStatusId === parseInt(lodashGet(client.get("config.ticket.status.closed"), "value")))
                             const ticketUrgent = lodashFilter(ticketCompany, (ticket) =>  ticket.ticketStatusId === parseInt(lodashGet(client.get("config.ticket.status.urgent"), "value")))
                              return (
                                <Grid container>
                                  {ticketUrgent.length >= 1 && <div className={classes.urgent}>{ticketUrgent.length}</div>}
                                  {ticketOpen.length >= 1 && <div className={classes.open}>{ticketOpen.length}</div>}
                                  {ticketClosed.length >= 1 && <div className={classes.closed}>{ticketClosed.length}</div>}
                                </Grid>
                              )
                            },
                            afterTreeItem: ({ data }) =>
                              <TreeSupportItem company={data} type="MenuItem" />
                          }}
                        />
                      }
                    </div>
                  </MenuList>
                  <MenuItem
                    className={classes.userMenuItem}
                    component={Link}
                    to="/help/home"
                  >
                    Wiki
                      <span style={{ flex: "1" }} />
                    <Icon>help</Icon>
                  </MenuItem>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  )

}

export default withStyles(styles, { withTheme: true })(TicketsList)
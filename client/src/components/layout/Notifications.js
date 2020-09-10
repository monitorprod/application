import React, { useContext, useRef, useState, useEffect } from "react";
import moment from "moment";
import {
  Popper,
  Grow,
  IconButton,
  Icon,
  Paper,
  ClickAwayListener,
  List,Divider,  ListItemText,
  ListItemSecondaryAction, ListItem,
  AppBar, Toolbar,
  Typography,
} from "@material-ui/core";
import { useSnackbar } from 'notistack';
import ApiContext from "../../api";
import {
  Link,
  withStyles,
  lodashGet,
  lodashMap,
  lodashSplit,
  lodashToUpper,
  useFindService
} from "../../utils";
import Button from "../buttons";
import NotFound from "../not-found";
import Loader from "../loader";
import logo from "../../icons/logo.svg";
import SnackNotification from "./SnackNotification";

const styles = theme => ({
  list: {
    paddingBottom: "0px",
    paddingTop: "0px",
    position: 'sticky',
    maxWidth: 350,
    maxHeight: 750,
    overflow: 'overlay',
  },
  item: {
    height: "auto",
    color: theme.palette.type === "dark"? theme.palette.common.white : theme.palette.primary.main,
    whiteSpace: "normal",
    padding: theme.spacing(1),
    "&>div": {
      width: "100%"
    }
  },
  wrapper: {
    position: "relative",
    "&>div": {
      margin: 0
    }
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    fontSize: ".65rem",
    background: theme.palette.primary.delete,
    borderRadius: "50%",
    height: 18,
    width: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
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
  button: {
    height: 50,
    color: theme.palette.common.white,
    "&>span>div": {
      width: "100% !important",
      height: "100% !important",
      borderRadius: 0
    },
    [theme.breakpoints.up("md")]: {
      background: "none",
      border: "none",
      boxShadow: "none"
    },
    [theme.breakpoints.down("sm")]: {
      width: 50,
      padding: 0
    }
  },
  icon: {
    fontSize: "1.5rem"
  },
  listHeader:{
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.primary.main,
    height: 64
  },
});

const Notifications = ({ classes, theme, hasSession, session, isAdminApp }) => {
  const client = useContext(ApiContext);
  const { list, loading, reload } = useFindService({
    model: "notifications",
    query: {
      $sort: {
        createdAt: -1
      }
    }
  });
  const [open, setOpen] = useState(false);
  const MenuRef = useRef(null);
  const handleToggle = () => {
    setOpen(prev => !prev);
  };
  const handleClose = event => {
    if (MenuRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const { enqueueSnackbar } = useSnackbar();
  const newNotification = ({ notification }) => {
    enqueueSnackbar('', {
      preventDuplicate: true,
      autoHideDuration: 5000,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left',
      },
      content: (key) => (
        <SnackNotification id={key} notification={notification} />
      )
    });
  }
  const handleRemove = ({ id }) => async e => {
    e.preventDefault();
    await client.service("notifications").remove(id);
    reload();
  };

  const handleRemoveAll = list => async  e => {
    await Promise.all(
      lodashMap(
        list,      
        async (notification) => await client.service("notifications").remove(notification.id))
    )
    .then( reload() );
  }

  useEffect(() => {
    // console.log("!!! effect onNotification")
    const onNotification = notification => {
      newNotification({ notification })
      const pushNotification = async () => {
        try {
          const serviceWorker = await window.navigator.serviceWorker.ready;
          window.Notification.requestPermission(status => {
            if (status === "granted") {
              serviceWorker.showNotification(notification.title, {
                body: moment(notification.createdAt).format("ddd, DD [de] MMM [de] YYYY HH:mm"),
                badge: logo,
                image: logo,
                icon: logo,
                vibrate: [10000],
                actions: [
                  {
                    action: "url",
                    title: "Ir para OP",
                    url: `/dashboard/production/${notification.machineId}/order/${notification.productionOrderId}`
                  }
                ]
              });
            }
          });
        } catch (error) {
          console.log("PUSH ERROR", error);
        }
      };
      pushNotification();
      reload();
    };
    client.service("notifications").on("created", onNotification);
    return () => {
      client.service("notifications").removeListener("created", onNotification);
    };
  }, [client, reload, newNotification]);
  const userName = lodashGet(session, "user.name");
  let initials = "";
  const isMobile = window.outerWidth <= theme.breakpoints.width("md");
  lodashMap(lodashSplit(userName, " "), fragment => (initials += lodashToUpper(fragment[0])));
  useEffect(() => {
    try {
      window.Notification.requestPermission(status => {
        if (status !== "granted") {
          alert(
            "Não tem notificações ativas! Por favor, recarrege a página de monitorprod.com.br para ativar-las."
          );
        }
      });
    } catch (error) {
      console.log("PUSH ERROR", error);
    }
  }, []);
  const empty = !loading && list.length === 0;
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
          text= "notifications"
          type = "icon"
          icon = "notifications"
          variants="navbar"
        />
        {!isAdminApp && !loading && list.length > 0 && (
          <div className={classes.badge}>{list.length}</div>
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
            <Paper style={{ width: 350 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <div >
                  <AppBar position="static" color="secondary" style={{borderRadius:'5px'}}>
                    <Toolbar>
                      <Typography variant='button' style={{flex: 1}}>Dispensar Todos</Typography>
                      <IconButton edge="end" color='primary' aria-label="dispensar" onClick={handleRemoveAll(list)}>
                        <Icon>delete_sweep</Icon>
                      </IconButton>
                    </Toolbar>
                  </AppBar>
                  <List className={classes.list}>
                    {loading && <Loader />}
                    {!isAdminApp && (
                      <div style={{ width: 350, maxHeight: '75vh'}}>
                        {empty && <NotFound />}
                        {!empty &&
                          lodashMap(
                            list,
                            ({ id, title, productionOrderId, machineId, createdAt }) => (
                              <React.Fragment>
                                <Divider />

                                <ListItem
                                  key={id}
                                  className={classes.item}
                                  component={Link}
                                  to={`/dashboard/production/${machineId}/order/${productionOrderId}`}
                                >
                                  <ListItemText
                                    primary={title.split(':')[1]}
                                    secondary={<div style={{display:'flex'}}>
                                      <div>{title.split(':')[0]}</div>
                                      <div style={{position: 'absolute',right: '60px'}}>{moment(createdAt).format("DD/MM HH:mm")}</div>
                                    </div>}
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="dispensar" onClick={handleRemove({ id })}>
                                      <Icon>delete</Icon>
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              </React.Fragment>
                            )
                          )}
                      </div>
                    )}
                  </List>                
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(Notifications);

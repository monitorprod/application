import React, { useRef, useState, useContext, useEffect } from "react";

import {
  lodashMap,
  lodashGet,
  lodashFilter,
  useFindService,
  lodashSplit,
  lodashToUpper,
  Link,
  withStyles
} from "../../utils"

import {
  Icon,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  Switch,
  Divider,
  Badge,
  MenuItem,
  MenuList,
  Grid
} from "@material-ui/core";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import Chat from '@material-ui/icons/Chat';
import MenuBook from '@material-ui/icons/MenuBook';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import TicketsList from './TicketsList'
import Button from "../buttons";
import Logout from "./Logout";

import useTicketContext from "./useTicketContext";

const styles = theme => ({
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
    width: 350,
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
});

const UnreadBadge = withStyles((theme) => ({
  badge: {
    right: 29,
    top: 14,
  },
}))(Badge);

const UserActions = ({ classes, isAdminApp, hasSession, session , swtichTheme, dark}) => {

  const [supportOpen, setSupportOpen] = useState(false);
  const {userUnreadMessages} = useTicketContext({session});

  const handleClick = () => {
    setSupportOpen(prev => !prev);
  };


  const [open, setOpen] = useState(false);
  const MenuRef = useRef(null);

  const handleClose = event => {
    if (MenuRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prev => !prev)
  };

  const userName = lodashGet(session, "user.name");
  let initials = "";
  lodashMap(lodashSplit(userName, " "), fragment => (initials += lodashToUpper(fragment[0])));

  //const empty = !loadingTicket && tickets.length === 0;

  return (
    <React.Fragment>
      <UnreadBadge badgeContent={userUnreadMessages.length} color="secondary">
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
          icon="account_circle"
          text={isAdminApp ? "Admin" : userName}
        />
        </UnreadBadge>
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

              <List
                component="nav"
                aria-labelledby="Menu do Usuário"                
              >
                  <ListItem>
                    <ListItemIcon>
                      <Switch edge="start" color="secondary" onChange={swtichTheme} checked={dark}/>
                    </ListItemIcon>
                    <ListItemText primary="Tema Escuro" />
                  </ListItem>

                  <Divider />

                  {!isAdminApp && (
                    <ListItem button component={Link} to="/administration/reset-password" onClick={handleToggle}>
                      <ListItemIcon>
                        <Icon>lock_outlined</Icon>
                      </ListItemIcon>
                      <ListItemText primary="Alterar Senha" />
                    </ListItem>
                  )}

                  <Logout />                    
                 
                  <Divider />

                  <ListItem button   component={Link} to="/help/home" onClick={handleToggle}>
                    <ListItemIcon>
                      <MenuBook />
                    </ListItemIcon>
                    <ListItemText primary="Manual Wiki"/>
                  </ListItem>
                  <ListItem button onClick={handleClick}>
                    <ListItemIcon>
                      <Chat />
                    </ListItemIcon>
                    <ListItemText primary="Suporte Técnico" />
                    {supportOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse style={{maxHeight:'250px', overflowY:'overlay', overflowX:'hidden'}} in={supportOpen} timeout="auto" unmountOnExit>
                    <TicketsList hasSession={hasSession} session={session} isAdminApp={isAdminApp} type="Menu" handleToggle={handleToggle}/>
                  </Collapse>
                </List>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  )

}

export default withStyles(styles, { withTheme: true })(UserActions)
import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { MenuItem, Hidden ,ListItemText, ListItem, ListItemIcon} from "@material-ui/core";
import ApiContext from "../../api";
import { withStyles, logout } from "../../utils";
import Button from "../buttons";
import ExitToApp from '@material-ui/icons/ExitToApp';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.primary.header,
    color: theme.palette.common.white,
    borderBottomLeftRadius: "4px",
    borderBottomRightRadius: "4px"
  },
  wrapper: {
    position: "relative",
    "&>div": {
      margin: 0
    }
  },
  button: {
    width: 50,
    "&>span>div": {
      width: "100% !important",
      height: "100% !important",
      borderRadius: 0
    }
  },
  icon: {
    width: "18px !important",
    height: "18px !important",
    color: theme.palette.common.white,
  }
});

const Logout = ({ classes, isAdminApp }) => {
  const client = useContext(ApiContext);
  const handleLogout = async () => {
    const companyUUID = localStorage.getItem("companyUUID");
    await logout({ client });
    window.location = `/login/${isAdminApp ? "admin" : companyUUID}`;
  };
  return (
    <ListItem button onClick={handleLogout}>
      <ListItemIcon>
        <ExitToApp />
      </ListItemIcon>
      <ListItemText primary="Deslogar" />
    </ListItem>

    // <React.Fragment>
    //   <Hidden smDown>
    //     <div className={classes.wrapper}>
    //       <Button
    //         className={classes.button}
    //         onClick={handleLogout}
    //         text="Sair"
    //         type="icon"
    //         avatar={<FontAwesomeIcon icon={faSignOutAlt} className={classes.icon} />}
    //         variants="navbar"
    //       />
    //     </div>
    //   </Hidden>
    //   <Hidden mdUp>
    //     <MenuItem onClick={handleLogout} className={classes.root}>
    //       Sair
    //       <span style={{ flex: "1" }} />
    //       <FontAwesomeIcon icon={faSignOutAlt} className={classes.icon} />
    //     </MenuItem>
    //   </Hidden>
    // </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(Logout);

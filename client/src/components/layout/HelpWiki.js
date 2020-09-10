import React from "react";
import { MenuItem, Hidden, Icon } from "@material-ui/core";
import { Link, withRouter, withStyles, classNames } from "../../utils";
import Button from "../buttons";

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
    color: theme.palette.common.white,
    width: 50,
    "&>span>div": {
      width: "100% !important",
      height: "100% !important",
      borderRadius: 0
    }
  },
  selected: {
    color: theme.palette.secondary.main
  },
  icon: {
    fontSize: "1.5rem"
  }
});

const WikiHelp = ({ location: { pathname }, classes }) => (
  <React.Fragment>
    <Hidden smDown>
      <div className={classes.wrapper}>
        <Button
          className={classNames(classes.button, {
            [classes.selected]: pathname.indexOf("help") !== -1
          })}
          type="icon"
          text="Help Wiki"
          icon="help"
          variants="navbar"
          component={Link}
          to="/help/home"
        />
      </div>
    </Hidden>
    <Hidden mdUp>
      <MenuItem className={classes.root} component={Link} to="/help/home">
        Help Wiki
        <span style={{ flex: "1" }} />
        <Icon className={classes.icon}>help</Icon>
      </MenuItem>
    </Hidden>
  </React.Fragment>
);

export default withRouter(withStyles(styles, { withTheme: true })(WikiHelp));

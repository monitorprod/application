import React from "react";
import { BottomNavigation, BottomNavigationAction, Hidden, Icon } from "@material-ui/core";
import { Link, withRouter, withStyles, lodashMap } from "../../utils";

const styles = theme => ({
  nav: {
    flex: 1,
    backgroundColor: "transparent",
    '&>a':{
      //shows all buttons on mobile
      minWidth: 'unset'
    }
  },
  wrapper: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  selected: {
    fontSize: "0.8rem !important",
    color: theme.palette.secondary.main,
    "&>span": {
      color: theme.palette.secondary.main
    }
  }
});

const MainTabs = ({ location: { pathname }, classes, actions }) => (
  <BottomNavigation value={pathname} showLabels className={classes.nav}>
    {lodashMap(actions, ({ icon, href, text }) => (
      <BottomNavigationAction
        classes={{
          selected: classes.selected,
          wrapper: classes.wrapper,
          label: classes.wrapper
        }}
        key={text}
        label={<Hidden xsDown>{text}</Hidden>}
        icon={<Icon>{icon}</Icon>}
        component={Link}
        to={href}
        value={pathname.indexOf(href) !== -1 && pathname.indexOf(`${href}-`) === -1 ? pathname : -1}
      />
    ))}
  </BottomNavigation>
);

export default withRouter(withStyles(styles, { withTheme: true })(MainTabs));

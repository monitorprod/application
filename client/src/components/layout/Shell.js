import React, { useContext } from "react";
import { Grid, AppBar, Toolbar, Avatar } from "@material-ui/core";
import {
  Link,
  withRouter,
  withStyles,
  lodashFilter,
  getPermissions,
  useAuth,
} from "../../utils";
import Button from "../buttons";
import MainTabsNav from "./MainTabsNav";
import CompanyLogin from "./CompanyLogin";
import Notifications from "./Notifications";
import logo from "../../icons/logo.svg";
import UserActions from "./UserActions";
import ApiContext from "../../api";

const userActions = [
  {
    icon: "assignment",
    href: "/master-data",
    text: "Cadastros",
    permissions: ["writeMasterData", "readMasterData"],
  },
  {
    icon: "assessment",
    href: "/dashboard",
    text: "Painel de Controle",
    permissions: [
      "readProductionOrders",
      "readProductionOrderReports",
      "writeActiveProductionOrders",
      "writeScheduledStopProductionOrders",
      "writeProductionOrderEvents",
    ],
  },
  {
    icon: "table_chart",
    href: "/reports",
    text: "Relatórios",
    permissions: ["readProductionOrderReports"],
  },
  {
    icon: "settings_applications",
    href: "/administration",
    text: "Configurações",
    permissions: ["crudAdminData", "crudUserData"],
  },
];

const sysAdminActions = [
  {
    icon: "domain",
    href: "/sysadmin/companies",
    text: "Clientes",
  },
  {
    icon: "memory",
    href: "/sysadmin/sensors",
    text: "Sensores",
  },
  {
    icon: "assignment",
    href: "/sysadmin/master-data",
    text: "Cadastros",
  },
];

const styles = (theme) => ({
  "@global": {
    /* width */
    "::-webkit-scrollbar": {
      width: "6px",
      height: "6px",

      /* FireFox */
      scrollbarWidth: "thin",
    },
    /* Track */
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-track-piece": {
      backgroundColor: "transparent",
    },

    /* Handle */
    "::-webkit-scrollbar-thumb": {
      background: "rgba(0, 0, 0, 0.54)",
      borderRadius: "3px",
    },

    /* Handle on hover */
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  },
  root: {
    height: "100vh",
    flexWrap: "nowrap",
    flexGrow: 1,
    [theme.breakpoints.down("md")]: {
      fontSize: 14,
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: 12,
    },
  },
  title: {
    flex: 1,
  },
  main: {
    overflowY: "auto",
    display: "flex",
    flexGrow: 1,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  home: {
    marginRight: theme.spacing(2),
  },
  content: {
    overflowX: "hidden",
    overflowY: "auto",
    flexGrow: 1,
    flexWrap: "nowrap",
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1),
    },
  },
});

const Shell = ({
  location: { pathname },
  classes,
  children,
  swtichTheme,
  dark,
}) => {
  const { session, permissions } = useAuth({ dependencies: [pathname] });
  const isAdminApp = session && session.isAdmin;
  const isLoginApp = pathname.indexOf("login") !== -1;
  const hasSession = !isLoginApp && session;
  const actions = isAdminApp ? sysAdminActions : userActions;

  const client = useContext(ApiContext);
  const isDevelopmentEnvironment =
    client.get("cloudURL").includes("heroku") ||
    client.get("cloudURL").includes("localhost");

  return (
    <Grid container direction="column" className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {" "}
          {/*on mobile we can swipe the menu* style={{overflow:'overlay'}}*/}
          {isDevelopmentEnvironment && <span>DEV</span>}
          {!isAdminApp && !hasSession && (
            <Avatar
              className={classes.home}
              alt="Logo"
              src={logo}
              component={Link}
              to="/"
            />
          )}{" "}
          {/*on mobile the logo takes to much space in the menu*/}
          {hasSession && isAdminApp && (
            <Button
              type="icon"
              text="SysAdmin"
              icon="settings"
              variants="navbar"
              component={Link}
              to="/sysadmin"
            />
          )}
          {!session && !isLoginApp && <CompanyLogin />}
          {hasSession && (
            <MainTabsNav
              actions={lodashFilter(
                actions,
                (action) =>
                  !action.permissions ||
                  getPermissions({
                    privileges: action.permissions,
                    permissions,
                  })
              )}
            />
          )}
          {hasSession && (
            <Notifications
              hasSession={hasSession}
              session={session}
              isAdminApp={isAdminApp}
            />
          )}
          {hasSession && (
            <UserActions
              hasSession={hasSession}
              session={session}
              isAdminApp={isAdminApp}
              swtichTheme={swtichTheme}
              dark={dark}
            />
          )}
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <Grid container direction="column" className={classes.content}>
          {children}
        </Grid>
      </main>
    </Grid>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(Shell));

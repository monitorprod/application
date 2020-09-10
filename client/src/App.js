import React, {useState, useEffect} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import "moment/locale/pt-br";
import { BrowserRouter, Route, Switch } from "./utils";
import { Shell, SessionRoute, AdminRoute } from "./components";
import LoginPage from "./pages/login";
import WikiPage from "./pages/help";
import SupportTicket from './pages/support';
import LandingPage from "./pages/landing";
import UnderConstructionPage from "./pages/under-construction";
import MasterDataRoutes from "./pages/master-data/routes";
import AdministrationRoutes from "./pages/administration/routes";
import DashboardRoutes from "./pages/dashboard/routes";
import SysAdminRoutes from "./pages/sysadmin/routes";
import { SnackbarProvider } from 'notistack';

// import Ubuntu from"./components/fonts/ubuntu.css";
moment.locale("pt-br");


const App = () => {
  
  const [dark, setDark] = useState(localStorage.getItem('DarkTheme') === "true");

  const swtichTheme = () => setDark(p => !p);

  useEffect(() => {
    localStorage.setItem('DarkTheme' , dark);
  },[dark])

  const theme = createMuiTheme({
    typography: {
      useNextVariants: true
      // fontFamily: 'TypoGraphica_demo' TODO://make this font work!!!
    },
    palette: {
      type: dark ? "dark" : "light",
      primary: {
        main: "#424242",
        header: "#616161",
        // header: "#00b5ad",
        table: "rgba(0, 0, 0, .14)",
        form: "rgba(0, 0, 0, .14)",
        disabled: "rgba(0, 0, 0, .14)",
        delete: "#db2828"
      },
      secondary: {
        main: "#ffb300"
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <MuiThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <CssBaseline />
          <BrowserRouter>
            <SnackbarProvider
              maxSnack={3}
            >
              <Shell swtichTheme = {swtichTheme} dark={dark}>
                <Switch>
                  <Route exact path="/" component={() => <LandingPage title="MonitorProd" />} />
                  <Route path="/login/:companyUUID" component={LoginPage} />
                  <Route path="/master-data" component={MasterDataRoutes} />
                  <Route path="/administration" component={AdministrationRoutes} />
                  <Route path="/dashboard" component={DashboardRoutes} />
                  <Route path="/reports" component={DashboardRoutes} />
                  <Route path="/sysadmin" component={SysAdminRoutes} />
                  <SessionRoute path="/help/home" component={WikiPage} />
                  <SessionRoute path="/help/:wikiPageId" component={WikiPage} />
                  <SessionRoute exact path="/support" component={SupportTicket} />
                  <SessionRoute exact path="/support/:ticketId" component={SupportTicket} />
                  <AdminRoute exact path="/support/company/:companyId/ticket/:ticketId" component={SupportTicket} />
                  <Route default component={UnderConstructionPage} />
                </Switch>
              </Shell>
            </SnackbarProvider>
          </BrowserRouter>
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
};

export default App;

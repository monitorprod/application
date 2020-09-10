import React, { useContext, useState, useEffect } from "react";
import {
  Grid,
  Avatar,
  Icon,
  Paper,
  TextField,
  Typography,
  SnackbarContent
} from "@material-ui/core";
import ApiContext from "../../api";
import {
  withRouter,
  withStyles,
  lodashGet,
  getPermissions,
  mapPermissions,
  login,
  logout,
  useAuth
} from "../../utils";
import { Loader, Errors, Button } from "../../components";

const styles = theme => ({
  wrapper: {
    width: 400,
    marginTop: theme.spacing(10),
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  textField: {
    margin: 0,
    minWidth: 250,
    //backgroundColor: theme.palette.common.white
  },
  footer: {
    width: 400,
    justifyContent: "space-around",
    marginTop: theme.spacing(2),
    "& p": {
      cursor: "pointer",
      color: theme.palette.primary.header
    }
  },
  success: {
    margin: `0 auto ${theme.spacing(1)}px`,
    backgroundColor: theme.palette.secondary.main,
    whiteSpace: "pre-wrap",
    "&>div": {
      padding: 0
    }
  }
});

const SYS_ADMIN_HOME = "/sysadmin/companies";
const CLIENT_HOME = "/";
const CLIENT_PRODUCTION_HOME = "/dashboard/production";
const CLIENT_MASTER_DATA_HOME = "/master-data";
const CLIENT_ADMINISTRATION_HOME = "/administration";

const goToHome = ({ history, permissions }) => {
  if (
    getPermissions({
      privileges: ["readProductionOrders", "readProductionOrderReports"],
      permissions
    })
  ) {
    return history.push(CLIENT_PRODUCTION_HOME);
  } else if (
    getPermissions({
      privileges: ["readMasterData", "writeMasterData"],
      permissions
    })
  ) {
    return history.push(CLIENT_MASTER_DATA_HOME);
  } else if (
    getPermissions({
      privileges: ["crudAdminData", "crudUserData"],
      permissions
    })
  ) {
    return history.push(CLIENT_ADMINISTRATION_HOME);
  } else {
    return history.push(CLIENT_HOME);
  }
};

const LoginPage = ({ history, match: { params }, classes }) => {
  const { session, loading: authLoading, permissions } = useAuth();
  const client = useContext(ApiContext);
  const [loginForm, setLoginForm] = useState({
    companyUUID: params.companyUUID
  });
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [send, setSend] = useState();
  const emailInputProps = {
    autoComplete: "email",
    autoFocus: true
  };
  const passwordInputProps = {
    autoComplete: "password"
  };
  const handleChange = ({ target }) => {
    setSend(false);
    setLoginForm(prev => ({ ...prev, [target.name]: target.value }));
  };
  const handleLogout = async () => await logout({ client });
  const handleLogin = async e => {
    e.preventDefault();
    // TODO verify all buttons for multiple clicks?
    if (loading) {
      return;
    }
    setLoading(true);
    setErrors();
    try {
      // console.log("login", loginForm);
      const payload = await login({ client, ...loginForm });
      if (params.companyUUID === "admin" && payload.isAdmin) {
        history.push(SYS_ADMIN_HOME);
      } else if (params.companyUUID !== "admin" && !payload.isAdmin) {
        goToHome({ history, permissions: mapPermissions({ payload }) });
      } else {
        throw new Error();
      }
    } catch (error) {
      await handleLogout();
      setErrors("As credenciais de usuário especificadas estão incorretas");
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async e => {
    if (loading) {
      return;
    }
    setLoading(true);
    setErrors();
    try {
      const payload = await login({ client, ...loginForm });
      if (params.companyUUID !== "admin" && !payload.isAdmin) {
        history.push("/administration/reset-password");
      } else {
        throw new Error();
      }
    } catch (error) {
      await handleLogout();
      setErrors("As credenciais de usuário especificadas estão incorretas");
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async e => {
    if (loading) {
      return;
    }
    setLoading(true);
    setErrors();
    try {
      if (loginForm.email) {
        await client
          .service("users")
          .patch(null, {}, { query: { email: loginForm.email, $forgotPassword: true } });
        setSend(true);
      } else {
        throw new Error();
      }
    } catch (error) {
      setErrors("Conta de usuário não encontrada");
    } finally {
      setLoading(false);
    }
  };
  const stringSession = JSON.stringify(session || {});
  const stringPermissions = JSON.stringify(permissions);
  useEffect(() => {
    // console.log("!!efffect Login", stringSession);
    const parsedSession = JSON.parse(stringSession);
    const handleLogout = async () => await logout({ client });
    if (!authLoading) {
      if (params.companyUUID === "admin" && lodashGet(parsedSession, "isAdmin")) {
        history.push(SYS_ADMIN_HOME);
      } else if (
        params.companyUUID !== "admin" &&
        lodashGet(parsedSession, "userId") &&
        !lodashGet(parsedSession, "isAdmin")
      ) {
        goToHome({ history, permissions: JSON.parse(stringPermissions) });
      } else {
        handleLogout();
      }
    }
    // TODO history useCallback
  }, [client, stringSession, authLoading, history, params.companyUUID, stringPermissions]);
  // console.log(">>> render Login", session, authLoading, loginForm);
  return (
    <Grid container direction="column" alignItems="center">
      <Paper className={classes.wrapper}>
        <form>
          <Grid container direction="column" spacing={3}>
            {loading && <Loader />}
            {errors && <Errors errors={errors} />}
            {send && <SnackbarContent className={classes.success} message="Email enviado" />}
            <Grid item container direction="column" alignItems="center" spacing={0}>
              <Avatar className={classes.avatar}>
                <Icon>lock_outlined</Icon>
              </Avatar>
              <Typography variant="h6">Iniciar Sessão</Typography>
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                required
                type="text"
                name="email"
                label="Email"
                inputProps={emailInputProps}
                className={classes.textField}
                value={loginForm.email || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                required
                type="password"
                name="password"
                label="Senha"
                inputProps={passwordInputProps}
                className={classes.textField}
                value={loginForm.password || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item>
              <Button
                text="Entrar"
                color="secondary"
                type="submit"
                fullWidth
                variants="submit"
                onClick={handleLogin}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
      {params.companyUUID !== "admin" && (
        <Grid className={classes.footer} container alignItems="center" spacing={0}>
          <Grid item onClick={handleResetPassword}>
            <Typography variant="body1">Esqueceu a senha</Typography>
          </Grid>
          <Grid item onClick={handleChangePassword}>
            <Typography variant="body1">Mudar senha</Typography>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(LoginPage));

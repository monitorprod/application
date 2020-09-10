import React, { useContext, useState } from "react";
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
import { withRouter, withStyles, useAuth } from "../../utils";
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
    backgroundColor: theme.palette.common.white
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

const LoginPage = ({ history, match: { params }, classes }) => {
  const { session } = useAuth();
  const client = useContext(ApiContext);
  const [loginForm, setLoginForm] = useState({
    companyUUID: params.companyUUID
  });
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [success, setSuccess] = useState();
  const passwordInputProps = {
    autoFocus: true
  };
  const handleChange = ({ target }) => {
    setLoginForm(prev => ({ ...prev, [target.name]: target.value }));
  };
  const handleChangePassword = async e => {
    e.preventDefault();
    if (loading) {
      return;
    }
    setLoading(true);
    setErrors();
    try {
      if (
        session.userId &&
        loginForm.newPassword &&
        loginForm.confirmPassword &&
        loginForm.newPassword === loginForm.confirmPassword
      ) {
        await client.service("users").patch(session.userId, { password: loginForm.newPassword });
        setLoginForm({
          companyUUID: params.companyUUID
        });
        setSuccess(true);
      } else {
        throw new Error();
      }
    } catch (error) {
      setErrors("A senha deve ser confirmada");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Grid container direction="column" alignItems="center">
      <Paper className={classes.wrapper}>
        <form>
          <Grid container direction="column" spacing={10}>
            {loading && <Loader />}
            {errors && <Errors errors={errors} />}
            {success && <SnackbarContent className={classes.success} message="Senha alterada" />}
            <Grid item container direction="column" alignItems="center" spacing={0}>
              <Avatar className={classes.avatar}>
                <Icon>lock_outlined</Icon>
              </Avatar>
              <Typography variant="h6">Redefinição de Senha</Typography>
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                required
                type="password"
                name="newPassword"
                label="Nova Senha"
                inputProps={passwordInputProps}
                className={classes.textField}
                value={loginForm.newPassword || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                required
                type="password"
                name="confirmPassword"
                label="Confirmar Senha"
                className={classes.textField}
                value={loginForm.confirmPassword || ""}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item>
              <Button
                text="Mudar senha"
                type="submit"
                fullWidth
                variants="submit"
                onClick={handleChangePassword}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Grid>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(LoginPage));

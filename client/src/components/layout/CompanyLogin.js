import React, { useContext, useState } from "react";
import { TextField } from "@material-ui/core";
import ApiContext from "../../api";
import { Redirect, withStyles } from "../../utils";
import Button from "../buttons";

const styles = theme => ({
  form: {
    display: "flex",
    alignItems: "center"
  },
  textField: {
    width: 175,
    "&>div": {
      color: theme.palette.common.white,
      "&::before,&::after": {
        borderColor: `${theme.palette.common.white} !important`
      }
    }
  }
});

const CompanyLogin = ({ classes }) => {
  const client = useContext(ApiContext);
  // TODO verify no setState on render
  const [loginName, setLoginName] = useState();
  const [error, setError] = useState();
  const [redirect, setRedirect] = useState();
  const handleChange = ({ target }) => {
    setLoginName(target.value);
  };
  const handleKeyPress = e => {
    if (e.which === 13) {
      handleLogin(e);
    }
  };
  const handleLogin = async e => {
    e.preventDefault();
    setError();
    const request = new URL(`${client.get("cloudURL")}/use_company_login_name`);
    const params = { loginName };
    request.search = new URLSearchParams(params);
    const response = await (await fetch(request)).json();
    if (response.companyUUID) {
      setRedirect(`/login/${response.companyUUID}`);
    } else {
      setError("Empresa não encontrada.");
    }
  };
  return (
    <form className={classes.form}>
      {redirect && <Redirect push to={redirect} />}
      <TextField
        className={classes.textField}
        error={!!error}
        helperText={error}
        required
        name="loginName"
        placeholder="Login da Empresa"
        value={loginName || ""}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <Button
        type="icon"
        text="Iniciar Sessão"
        icon="lock_outlined"
        color="inherit"
        onClick={handleLogin}
      />
    </form>
  );
};

export default withStyles(styles, { withTheme: true })(CompanyLogin);

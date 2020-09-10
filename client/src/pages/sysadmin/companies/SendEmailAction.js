import React, { useContext, useState } from "react";
import { Icon } from "@material-ui/core";
import ApiContext from "../../../api";
import { withStyles } from "../../../utils";
import Button from "../../../components/buttons";
import Loader from "../../../components/loader";
import Errors from "../../../components/errors";

const styles = theme => ({
  actions: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  loader: {
    height: "100%",
    width: "100%",
    background: "rgba(255,255,255,.5)",
    zIndex: 1,
    position: "absolute",
    right: 0,
    top: 0,
    padding: "0 8px",
    "&>div": {
      position: "relative",
      top: 25
    }
  },
  icon: {
    fontSize: 30,
    color: theme.palette.primary.main
  }
});

const SendEmailAction = withStyles(styles, { withTheme: true })(({ classes, data = {}, field }) => {
  const client = useContext(ApiContext);
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [send, setSend] = useState();
  const handleSendEmail = async () => {
    setLoading(true);
    setErrors();
    try {
      await client
        .service("companies")
        .patch(data.id, { loginName: data.loginName }, { query: { $sendEmail: true } });
      setSend(true);
    } catch (error) {
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    !!data.id && (
      <div className={classes.actions}>
        {loading && (
          <div className={classes.loader}>
            <Loader />
          </div>
        )}
        <Button text="(Re) Iniciar Senha" icon="mail" onClick={handleSendEmail} />
        {send && <Icon className={classes.icon}>done</Icon>}
        {errors && (
          <React.Fragment>
            <Icon className={classes.icon}>clear</Icon>
            <Errors errors={errors} />
          </React.Fragment>
        )}
      </div>
    )
  );
});

export default SendEmailAction;

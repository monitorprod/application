import React from "react";
import { Grid, Card, CardContent, Avatar, Typography } from "@material-ui/core";
import { Link, withStyles, lodashGet, lodashMap, getPermissions, useAuth } from "../../utils";
import Button from "../buttons";
import Loader from "../loader";

const styles = theme => ({
  card: {
    display: "flex",
    position: "relative"
  },
  content: {
    flex: 1,
    padding: theme.spacing(1)
  },
  header: {
    minHeight: 40,
    marginBottom: theme.spacing(1)
  },
  avatar: {
    marginRight: theme.spacing(1)
  },
  controls: {
    width: "unset"
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
      top: "50%"
    }
  }
});

const GridCard = ({
  classes,
  model,
  fields,
  data,
  handleDelete,
  loading,
  options = {},
  customContent = {},
  customActions
}) => {
  const { permissions } = useAuth();
  return (
    <Card className={classes.card}>
      {loading && (
        <div className={classes.loader}>
          <Loader />
        </div>
      )}
      <CardContent className={classes.content}>
        <Grid container alignItems="center" className={classes.header}>
          {data.image && <Avatar alt={data.name} src={data.image} className={classes.avatar} />}
          <Typography component="h5" variant="h5">
            {data.name}
          </Typography>
        </Grid>
        <Grid container spacing={2}>
          {lodashMap(
            fields,
            ({ identity, text, hasIdentity, customData }) =>
              identity !== "name" &&
              (lodashGet(data, identity) || customData) && (
                <Grid item key={identity}>
                  <Typography variant="subtitle1" color="textSecondary">
                    {text}
                  </Typography>
                  <Typography component="p">
                    {customData && customData({ data })}
                    {!customData && (
                      <React.Fragment>
                        {hasIdentity ? (data.identity ? `${data.identity} - ` : "") : ""}
                        {lodashGet(data, identity)}
                      </React.Fragment>
                    )}
                  </Typography>
                </Grid>
              )
          )}
        </Grid>
      </CardContent>
      <Grid container direction="column" className={classes.controls}>
        {!options.dontEdit && (!customContent.dontEdit || customContent.dontEdit({ data })) && (
          <Button
            type="icon"
            text="Editar"
            icon="edit_icon"
            variants="editAction"
            component={Link}
            to={`${model.formPath}/${data.id}`}
          />
        )}
        {getPermissions({ privileges: options.writePermissions, permissions }) &&
          !options.dontDelete &&
          (!customContent.dontDelete || customContent.dontDelete({ data })) && (
            <Button
              type="icon"
              text="Deletar"
              icon="delete"
              variants="deleteAction"
              onClick={handleDelete(data)}
            />
          )}
        {customActions && customActions({ isList: true, data })}
      </Grid>
    </Card>
  );
};

export default withStyles(styles, { withTheme: true })(GridCard);

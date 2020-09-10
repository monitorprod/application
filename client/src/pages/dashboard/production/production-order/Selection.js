import React from "react";
import { Grid, Card, Avatar, Typography, Icon } from "@material-ui/core";
import { withStyles } from "../../../../utils";
import { Button, FormInput } from "../../../../components";

const styles = theme => ({
  fullWidth: {
    flex: 1
  },
  title: {
    flex: 1
  },
  card: {
    height: 40,
    display: "flex",
    padding: theme.spacing(1)
  },
  wrapper: {
    alignContent: "center"
  },
  avatar: {
    width: theme.spacing(4),
    maxHeight: theme.spacing(4),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
});

const ProductionOrderSelection = ({
  classes,
  field,
  selectedItem,
  formItem,
  formErrors,
  formReadOnly,
  handleChange,
  query = {},
  options = {},
  customContent = {}
}) => {
  const handleDelete = () =>
    handleChange({
      target: {
        name: field.identity,
        value: null
      }
    });
  return (
    <React.Fragment>
      {!selectedItem && formItem && (
        <Grid item className={classes.fullWidth}>
          <FormInput
            field={field}
            formItem={formItem}
            formErrors={formErrors}
            formReadOnly={formReadOnly}
            query={query}
            options={options}
            handleChange={handleChange}
          />
        </Grid>
      )}
      {selectedItem && (
        <Grid item>
          <Grid container spacing={1} alignItems="center">
            <Grid item className={classes.fullWidth}>
              <Card className={classes.card}>
                <Grid container alignItems="center" className={classes.wrapper}>
                  {selectedItem.image && (
                    <Avatar
                      alt={selectedItem.name}
                      src={selectedItem.image}
                      className={classes.avatar}
                    />
                  )}
                  {!selectedItem.image && field.icon && field.icon.type === "svg" && (
                    <img className={classes.avatar} alt="icon" src={field.icon.src} />
                  )}
                  {!selectedItem.image && field.icon && !field.icon.type && (
                    <Icon className={classes.avatar}>{field.icon}</Icon>
                  )}
                  <Typography variant="body1" className={classes.title}>
                    {selectedItem.identity} - {selectedItem.name}
                  </Typography>
                  {formItem && !options.readOnly && !options.dontDelete && (
                    <Button
                      type="icon"
                      text="Deletar"
                      icon="close"
                      variants="deleteAction"
                      onClick={handleDelete}
                    />
                  )}
                </Grid>
              </Card>
            </Grid>
            {customContent.afterSelected && customContent.afterSelected()}
          </Grid>
        </Grid>
      )}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(ProductionOrderSelection);

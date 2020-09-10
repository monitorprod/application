import React from "react";
import { Toolbar, Fab } from "@material-ui/core";
import { Link, withStyles, getPermissions, useAuth } from "../../utils";
import Button from "../buttons";
import AddIcon from '@material-ui/icons/Add';

const styles = theme => ({
  toolbar: {
    padding: 0,
    minHeight: 40,
    marginBottom: theme.spacing(1)
  },
  spacer: {
    flex: "1 1 100%"
  },
  actions: {
    color: theme.palette.text.secondary
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1
  },
});

const GridToolbar = ({ classes, model, options = {} }) => {
  const { permissions } = useAuth();
  const showToolbar =
    !options.dontCreate && getPermissions({ privileges: options.writePermissions, permissions });
  return (
    showToolbar && (
      <Fab color="secondary" aria-label="criar"  className={classes.fab}>
        <AddIcon />
      </Fab>
      // <Toolbar className={classes.toolbar}>
      //   <div className={classes.spacer} />
      //   <div className={classes.actions}>
      //     {showToolbar && (
      //       <Button
      //         text="Criar"
      //         icon="add_icon"
      //         variants="toolbar"
      //         component={Link}
      //         to={`${model.formPath}/new`}
      //       />
      //     )}
      //   </div>
      // </Toolbar>
    )
  );
};

export default withStyles(styles, { withTheme: true })(GridToolbar);

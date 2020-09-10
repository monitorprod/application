import React from "react";
import { Hidden, TableCell, TableRow, Typography } from "@material-ui/core";
import { Link, withStyles, lodashGet, lodashMap, getPermissions, useAuth } from "../../utils";
import Button from "../buttons";
import Loader from "../loader";

const styles = theme => ({
  row: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.primary.table
    }
  },
  actions: {
    position: "relative",
    justifyContent: "center",
    display: "flex"
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
  }
});

const MasterTableRow = ({
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
    <TableRow className={classes.row} key={data.id}>
      {lodashMap(fields, ({ identity, hidden, hasIdentity, customData }) => (
        <Hidden key={identity} only={hidden ? "md" : "xs"}>
          <TableCell>
            <Typography variant="body2">
              {customData && customData({ data })}
              {!customData && (
                <React.Fragment>
                  {hasIdentity ? (data.identity ? `${data.identity} - ` : "") : ""}
                  {lodashGet(data, identity)}
                </React.Fragment>
              )}
            </Typography>
          </TableCell>
        </Hidden>
      ))}
      <TableCell>
        <div className={classes.actions}>
          {loading && (
            <div className={classes.loader}>
              <Loader />
            </div>
          )}
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
        </div>
      </TableCell>
    </TableRow>
  );
};

export default withStyles(styles, { withTheme: true })(MasterTableRow);

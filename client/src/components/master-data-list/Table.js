import React from "react";
import {
  Hidden,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@material-ui/core";
import {
  Link,
  withStyles,
  lodashMap,
  getPermissions,
  useAuth,
  useFindDeleteService
} from "../../utils";
import NotFound from "../not-found";
import Loader from "../loader";
import Errors from "../errors";
import Button from "../buttons";
import Filter from "./Filter";
import MasterTableRow from "./TableRow";

const styles = theme => ({
  root: {
    flex: 1,
    overflow: "hidden"
  },
  scrollArea: {
    height: "100%",
    minHeight: "300px",
    overflow: 'overlay'
  },
  container: {
    flex: 1,
    overflow: "hidden"
  },
  actions: {
    justifyContent: "center",
    display: "flex"
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: theme.spacing(1),
    "& p,& a span": {
      color: theme.palette.common.white,
      textTransform: "uppercase"
    }
  }
});

const MasterDataTable = ({
  classes,
  model,
  fields,
  query = {},
  options = {},
  customContent = {},
  customActions
}) => {
  const { permissions } = useAuth();
  const {
    list,
    setFindQuery,
    handleDelete,
    deleteRef,
    deleteLoading,
    findLoading,
    errors
  } = useFindDeleteService({ model: model.name, query });
  const empty = !findLoading && !errors && list.length === 0;
  return (
    // TODO add pagination!!
    <div className={classes.root}>
      <div className={classes.scrollArea} style={{ width: "none" }}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {lodashMap(fields, field => (
                <Hidden key={field.identity} only={field.hidden ? "md" : "xs"}>
                  <TableCell className={classes.header}>
                    {!(field.customContent && field.customContent.dontFilter) && (
                      <Filter field={field} query={query} setFindQuery={setFindQuery} />
                    )}
                    {field.customContent && field.customContent.dontFilter && !field.customText && (
                      <Typography variant="body1">{field.text}</Typography>
                    )}
                    {field.customContent &&
                      field.customContent.dontFilter &&
                      field.customText &&
                      field.customText()}
                  </TableCell>
                </Hidden>
              ))}
              <TableCell className={classes.header}>
                {!options.dontCreate &&
                  getPermissions({ privileges: options.writePermissions, permissions }) && (
                    <div className={classes.actions}>
                      <Button
                        text="Criar"
                        icon="add_icon"
                        variants="table"
                        component={Link}
                        to={`${model.formPath}/new`}
                      />
                    </div>
                  )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(findLoading || errors || empty) && (
              <TableRow className={classes.row}>
                <TableCell colSpan={fields.length + 1}>
                  {findLoading && <Loader />}
                  {errors && <Errors errors={errors} />}
                  {empty && <NotFound />}
                </TableCell>
              </TableRow>
            )}
            {!findLoading &&
              lodashMap(list, item => (
                <MasterTableRow
                  key={item.id}
                  model={model}
                  fields={fields}
                  data={item}
                  loading={deleteRef[item.id] && deleteLoading}
                  handleDelete={handleDelete}
                  options={options}
                  customContent={customContent}
                  customActions={customActions}
                />
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(MasterDataTable);

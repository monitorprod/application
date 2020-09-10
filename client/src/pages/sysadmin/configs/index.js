import React, { useState, useEffect } from "react";
import * as lodashGet from "lodash.get";
import * as lodashMap from "lodash.map";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Icon from "@material-ui/core/Icon";
import NotFound from "../../../components/not-found";
import Loader from "../../../components/loader";
import Errors from "../../../components/errors";
import FormInput from "../../../components/master-data-form/FormInput";
// import MasterTableRow from "./TableRow";
import { metadata, form as fields } from "./model";
// TODO move to utils
import useFindDeleteService from "../../../utils/useFindDeleteService";
import useUpsertService from "../../../utils/useUpsertService";

const styles = theme => ({
  table: {
    width: "100%"
  },
  header: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    "& p,&>a span": {
      color: theme.palette.common.white
    }
  },
  button: {
    padding: theme.spacing(1)
  },
  newButton: {
    color: theme.palette.primary.main
  },
  deleteButton: {
    color: theme.palette.primary.delete
  }
});

const ConfigsPage = ({ classes }) => {
  const [data, setData] = useState({});
  const { list, handleDelete, deleteLoading, findLoading, errors } = useFindDeleteService({
    model: metadata.name,
    reload: data
  });
  const {
    formItem,
    newItem,
    handleChange,
    handleSubmit,
    loading: upsertLoading
    // TODO add loader for FOrm errors and loader
  } = useUpsertService({
    model: metadata.name,
    data,
    // hooks: {
    //   afterHooks: [resetForm]
    // },
    fields
  });
  // TODO implement as afterSubmit
  useEffect(() => {
    setData({});
  }, [newItem]);
  const loading = deleteLoading || findLoading || upsertLoading;
  const empty = !findLoading && !errors && list.length === 0;
  return (
    // TODO add reload!!
    <Table className={classes.table}>
      <TableHead>
        <TableRow>
          {lodashMap(fields, ({ text }) => (
            <TableCell key={text} className={classes.header}>
              <Typography variant="body1">{text}</Typography>
            </TableCell>
          ))}
          <TableCell className={classes.header} />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          {lodashMap(fields, row => (
            <TableCell key={row.text}>
              <FormInput row={row} formItem={formItem} handleChange={handleChange} />
            </TableCell>
          ))}
          <TableCell>
            <Tooltip title="Criar">
              <IconButton
                aria-label="Criar"
                className={classNames(classes.button, classes.newButton)}
                onClick={handleSubmit}
              >
                <Icon>add_icon</Icon>
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
        {(loading || errors || empty) && (
          <TableRow className={classes.row}>
            <TableCell colSpan={fields.length + 1}>
              {loading && <Loader />}
              {errors && <Errors errors={errors} />}
              {empty && <NotFound />}
            </TableCell>
          </TableRow>
        )}
        {!findLoading &&
          lodashMap(list, item => (
            <TableRow key={item.id}>
              {lodashMap(fields, row => (
                <TableCell key={row.text}>
                  <Typography variant="body2">{lodashGet(item, row.identity)}</Typography>
                </TableCell>
              ))}
              <TableCell>
                <Tooltip title="Deletar">
                  <IconButton
                    aria-label="Deletar"
                    className={classNames(classes.button, classes.deleteButton)}
                    onClick={handleDelete(item)}
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
};

export default withStyles(styles, { withTheme: true })(ConfigsPage);

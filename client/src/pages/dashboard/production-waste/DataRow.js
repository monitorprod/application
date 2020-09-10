import React, { useContext, useState, useEffect } from "react";
import moment from "moment";
import { TableCell, TableRow, Typography, Icon } from "@material-ui/core";
import NumberFormat from "react-number-format";
import ApiContext from "../../../api";
import {
  withStyles,
  classNames,
  lodashGet,
  lodashIsNil,
  lodashMap,
  getPermissions,
  useAuth
} from "../../../utils";
import { Button, FormInput } from "../../../components";

const styles = theme => ({
  body: {
    "& td": {
      padding: theme.spacing(1),
      "& p,& a span": {
        fontSize: ".75rem"
      }
    }
  },
  wrapper: {
    display: "flex",
    alignItems: "center"
  },
  expanded: {
    transform: "rotate(180deg)"
  },
  icon: {
    margin: `0 ${theme.spacing(1)}px`
  },
  group: {
    cursor: "pointer",
    backgroundColor: theme.palette.primary.table
  }
});

const DataRow = ({ classes, header, item = {}, groupBy = {}, historyBy }) => {
  const { permissions } = useAuth();
  const client = useContext(ApiContext);
  const [formItem, setFormItem] = useState({});
  const [show, setShow] = useState(true);
  const stringItem = JSON.stringify(item);
  useEffect(() => {
    setFormItem(JSON.parse(stringItem) || {});
  }, [stringItem]);
  const [formErrors, setFormErrors] = useState({});
  const [allowEdition, setAllowEdition] = useState();
  const weight = parseFloat(lodashGet(item, "poi.product.weight")) || 0;
  const handleChange = ({ identity }) => ({ target }) => {
    const value = target.value;
    item.setFormErrors = setFormErrors;
    setFormItem(prev => ({ ...prev, [target.name]: value }));
    if (identity === "cp") {
      const cpw = Math.round((weight * value * 100) / 1000) / 100;
      setFormItem(prev => ({
        ...prev,
        cpw
      }));
      item.cp = value;
      item.cpw = cpw;
      let wasteP = (parseInt(lodashGet(item, "tp"), "10") || 0) - value;
      wasteP = wasteP > 0 ? wasteP : 0;
      setFormItem(prev => ({ ...prev, wp: wasteP }));
      const wpw = Math.round((weight * wasteP * 100) / 1000) / 100;
      setFormItem(prev => ({ ...prev, wpw }));
      item.wp = wasteP;
      item.wpw = wpw;
    }
    if (identity === "cpw") {
      const confirmP = Math.round((value * 1000) / weight);
      setFormItem(prev => ({
        ...prev,
        cp: confirmP
      }));
      item.cp = confirmP;
      item.cpw = value;
      let wasteP = (parseInt(lodashGet(item, "tp"), "10") || 0) - confirmP;
      wasteP = wasteP > 0 ? wasteP : 0;
      setFormItem(prev => ({ ...prev, wp: wasteP }));
      const wpw = Math.round((weight * wasteP * 100) / 1000) / 100;
      setFormItem(prev => ({ ...prev, wpw }));
      item.wp = wasteP;
      item.wpw = wpw;
    }
    if (identity === "wp") {
      const wpw = Math.round((weight * value * 100) / 1000) / 100;
      setFormItem(prev => ({
        ...prev,
        wpw
      }));
      item.wp = value;
      item.wpw = wpw;
      let confirmP = (parseInt(lodashGet(item, "tp"), "10") || 0) - value;
      confirmP = confirmP > 0 ? confirmP : 0;
      setFormItem(prev => ({ ...prev, cp: confirmP }));
      const cpw = Math.round((weight * confirmP * 100) / 1000) / 100;
      setFormItem(prev => ({ ...prev, cpw }));
      item.cp = confirmP;
      item.cpw = cpw;
    }
    if (identity === "wpw") {
      const wasteP = Math.round((value * 1000) / weight);
      setFormItem(prev => ({
        ...prev,
        wp: wasteP
      }));
      item.wp = wasteP;
      item.wpw = value;
      let confirmP = (parseInt(lodashGet(item, "tp"), "10") || 0) - wasteP;
      confirmP = confirmP > 0 ? confirmP : 0;
      setFormItem(prev => ({ ...prev, cp: confirmP }));
      const cpw = Math.round((weight * confirmP * 100) / 1000) / 100;
      setFormItem(prev => ({ ...prev, cpw }));
      item.cp = confirmP;
      item.cpw = cpw;
    }
    if (identity === "wji") {
      item.wji = value;
    }
  };
  const handleEdit = () => setAllowEdition(prev => !prev);
  const handleUpdate = () => {
    client.service("production_order_waste").patch(item._id, {
      cp: formItem.cp,
      wp: formItem.wp,
      wji: formItem.wji
    });
    setAllowEdition(false);
  };
  const handleDelete = () => {
    client.service("production_order_waste").remove(item._id);
    setShow(false);
  };
  const hasEditAccess = getPermissions({
    privileges: ["editPendingWaste"],
    permissions
  });
  return (
    show && (
      <TableRow className={classNames([classes.body, { [classes.group]: groupBy.enabled }])}>
        {groupBy.enabled && (
          <TableCell
            style={{ whiteSpace: "nowrap" }}
            colSpan={groupBy.colspan}
            onClick={
              groupBy.handleGroupExpand && groupBy.handleGroupExpand({ id: groupBy.expandId })
            }
          >
            <div className={classes.wrapper}>
              {groupBy.expandId && (
                <Icon
                  className={classNames(classes.icon, { [classes.expanded]: groupBy.expanded })}
                >
                  expand_more_icon
                </Icon>
              )}
              <Typography variant="body1">{groupBy.text}</Typography>
            </div>
          </TableCell>
        )}
        {lodashMap(
          header,
          ({ text, path, readOnly, alt, type, input, model }, index) =>
            !groupBy.enabled && (
              <TableCell key={index} style={{ whiteSpace: "nowrap" }}>
                {/* // TODO remove paragraph containers */}
                {/* // TODO type decimal should also format values!! */}
                {model && (
                  <FormInput
                    field={{
                      text,
                      identity: path,
                      model
                    }}
                    // TODO set item into formItem wth useEffect?
                    formItem={{ ...formItem }}
                    formErrors={formErrors}
                    handleChange={handleChange({ identity: path })}
                    options={{
                      readOnly:
                        (historyBy === "history" && !allowEdition) ||
                        (historyBy !== "history" && !lodashGet(item, "plant.wasteJustification")),
                      disabled:
                        (historyBy === "history" && !allowEdition) ||
                        (historyBy !== "history" && !lodashGet(item, "plant.wasteJustification"))
                    }}
                  />
                )}
                {((historyBy === "history" && allowEdition) || historyBy !== "history") &&
                  input &&
                  !model && (
                    <div style={{ display: "flex" }}>
                      <FormInput
                        field={{
                          text,
                          identity: path,
                          type
                        }}
                        formItem={formItem}
                        formErrors={formErrors}
                        handleChange={handleChange({ identity: path })}
                        options={{
                          readOnly:
                            lodashGet(item, "plant.qualityTrackType") === readOnly && !allowEdition,
                          disabled:
                            lodashGet(item, "plant.qualityTrackType") === readOnly && !allowEdition
                        }}
                      />
                      {[7, 9].indexOf(index) !== -1 &&
                        historyBy !== "history" &&
                        lodashGet(item, "plant.qualityTrackType") === readOnly && (
                          <React.Fragment>
                            {!allowEdition && (
                              <Button
                                type="icon"
                                text="Editar"
                                icon="edit_icon"
                                variants="editAction"
                                onClick={handleEdit}
                              />
                            )}
                            {allowEdition && (
                              <Button
                                type="icon"
                                text="Cancelar"
                                icon="close"
                                variants="editAction"
                                onClick={handleEdit}
                              />
                            )}
                          </React.Fragment>
                        )}
                    </div>
                  )}
                {((!input && !model) ||
                  (historyBy === "history" && input && !model && !allowEdition)) && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1">
                      {type === "datetime" ? (
                        lodashGet(item, path) ? (
                          moment(lodashGet(item, path)).format("DD/MM/YYYY HH:mm")
                        ) : (
                          alt
                        )
                      ) : type === "integer" ? (
                        !lodashIsNil(lodashGet(item, path)) ? (
                          <NumberFormat
                            value={lodashGet(item, path)}
                            displayType={"text"}
                            thousandSeparator={"."}
                            decimalSeparator={","}
                          />
                        ) : (
                          alt
                        )
                      ) : !lodashIsNil(lodashGet(item, path)) ? (
                        lodashGet(item, path)
                      ) : (
                        alt
                      )}
                    </Typography>
                    {index === 12 && historyBy === "history" && (
                      <React.Fragment>
                        {hasEditAccess && !allowEdition && (
                          <Button
                            type="icon"
                            text="Editar"
                            icon="edit_icon"
                            variants="editAction"
                            onClick={handleEdit}
                          />
                        )}
                        {allowEdition && (
                          <React.Fragment>
                            <Button
                              type="icon"
                              text="Gravar"
                              icon="save"
                              variants="editAction"
                              onClick={handleUpdate}
                            />
                            <Button
                              type="icon"
                              text="Deletar"
                              icon="delete_icon"
                              variants="deleteAction"
                              onClick={handleDelete}
                            />
                            <Button
                              type="icon"
                              text="Cancelar"
                              icon="close"
                              variants="editAction"
                              onClick={handleEdit}
                            />
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    )}
                  </div>
                )}
              </TableCell>
            )
        )}
      </TableRow>
    )
  );
};

export default withStyles(styles, { withTheme: true })(DataRow);
